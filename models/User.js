/** User class for hack-or-snooze-API */

// npm modules
const db = require('../db');
const bcrypt = require('bcrypt');

// class models
const APIError = require('./ApiError');
const Story = require('./Story');

// helper function
const validateSkipLimit = require('../helpers/validateSkipLimit');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

// import config
const { BCRYPT_WORK_ROUNDS, USERS_LIST_LIMIT } = require('../config');

/** User on the site */

class User {
  /** addUser - adds a user to the database
   * @property {object} user
   * @property {string} user.username
   * @property {string} user.name
   * @property {string} user.password
   * @return {Promise <{ user: username, name, createdAt, updatedAt, stories, favorites}>}
   * both stories and favorites = [ { storyId, title, author, url, createdAt, updatedAt, username }, ... ]
   */
  static async addUser({ name, username, password }) {
    // check if user exist in database, if so throw error
    const userExistsResult = await db.query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );

    if (userExistsResult.rows.length > 0) {
      throw new APIError(
        `There is already a user with username '${username}'.`,
        409,
        'User Already Exists'
      );
    }

    // create hashed password with bcrypt
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_ROUNDS);
    const result = await db.query(
      `INSERT INTO users (username, name, password) VALUES ($1, $2, $3) RETURNING username, name, createdat, updatedat`,
      [username, name, hashedPassword]
    );

    // single user row
    const user = result.rows[0];

    // deconstruct data for formatting
    const { createdat, updatedat, ...userDetails } = user;
    const favorites = [];
    const stories = [];

    // return formatted JS object
    return {
      ...userDetails,
      createdAt: createdat,
      updatedAt: updatedat,
      favorites,
      stories
    };
  }

  /** getUserDbInfo - gets a specific user's info from the db
   * @param {string} username
   * @return {Promise <{username, name, createdAt, updatedAt}>}
   */
  static async getUserDbInfo(username) {
    const result = await db.query(
      `SELECT username, name, createdAt, updatedAt FROM users WHERE username = $1`,
      [username]
    );

    // check if user exists, else throw error
    if (result.rows.length === 0) {
      throw new APIError(`No user '${username}' found.`, 404, 'User Not Found');
    }

    return result.rows[0];
  }

  /** getUser - gets a specific user's info formatted nicely for JSON resp.
   * @param {string} username
   * @return {Promise <{ username, name, createdAt, updatedAt, stories, favorites}>}
   * both stories and favorites = [ { storyId, title, author, url, createdAt, updatedAt, username }, ... ]
   */
  static async getUser(username) {
    // check if user exists
    const user = await User.getUserDbInfo(username);

    // deconstruct data for camelCase formatting
    const { createdat, updatedat, ...userDetails } = user;

    // get actual favorites and stories
    const favorites = await User.getUserFavorites(username);
    const stories = await User.getUserOwnStories(username);

    return {
      ...userDetails,
      createdAt: createdat,
      updatedAt: updatedat,
      favorites,
      stories
    };
  }

  /** getUserOwnStories - gets stories created by a specific user
   * @param {string} username
   * @return { Promise <[ { storyId, title, author, url, createdAt, updatedAt, username }, ... ]>}
   */
  static async getUserOwnStories(username) {
    const dbStories = await db.query(
      'SELECT * FROM stories where username = $1',
      [username]
    );

    // map & deconstruct data for camelCase formatting
    const stories = dbStories.rows.map(dbStory => {
      const { createdat, updatedat, storyid, ...userDetails } = dbStory;

      return {
        ...userDetails,
        storyId: storyid,
        createdAt: createdat,
        updatedAt: updatedat
      };
    });

    return stories;
  }

  /** checkValidCreds - checks if a user's credentials are valid
   * @param {string} username
   * @param {string} inputPassword
   */
  static async checkValidCreds(username, inputPassword) {
    // check if user exists, else throw error
    await User.getUserDbInfo(username);

    // obtain user pw hash for comparision
    const queryResult = await db.query(
      `SELECT password FROM users WHERE username = $1`,
      [username]
    );
    const { password } = queryResult.rows[0];

    const isValid = await bcrypt.compare(inputPassword, password);
    if (!isValid) {
      throw new Error('Invalid Password.');
    }

    return true;
  }

  /** getUsers - returns list of all users in db filtered by criteria.
   * @property {object} reqDetails (optional properties below)
   * @property {integer} reqDetails.skip
   * @property {integer} reqDetails.limit
   * @returns {Promise <[ { username, name, createdAt, updatedAt }, ...]>}
   */
  static async getUsers(reqDetails) {
    // validates skip and limit, throws error if invalid
    validateSkipLimit(reqDetails, USERS_LIST_LIMIT);

    const { skip, limit } = reqDetails;
    const result = await db.query(
      `SELECT username, name, createdat, updatedat FROM users OFFSET $1 LIMIT $2`,
      [skip, limit]
    );

    // rename columns to match formatted output
    const users = result.rows.map(userDbDetail => {
      const { createdat, updatedat, ...userDetails } = userDbDetail;
      return {
        ...userDetails,
        createdAt: createdat,
        updatedAt: updatedat
      };
    });

    return users;
  }

  /** @description patchUser - updates specific user in database
   * @param {string} username
   * @property {object} userUpdateDetails (at least one property below)
   * @property {string} userUpdateDetails.name
   * @property {string} userUpdateDetails.password
   * @return {Promise <{ username, name, createdAt, updatedAt, stories, favorites}>}
   * both stories and favorites = [ { storyId, title, author, url, createdAt, updatedAt, username }, ... ]
   */
  static async patchUser(username, userUpdateDetails) {
    // check if user exists, else throw error
    await User.getUserDbInfo(username);

    // add timestamp to be updated
    userUpdateDetails.updatedat = new Date();

    // if password change is requested, hash password
    if (userUpdateDetails.password) {
      userUpdateDetails.password = await bcrypt.hash(
        userUpdateDetails.password,
        BCRYPT_WORK_ROUNDS
      );
    }

    // generate sql commands for update
    const { query, values } = sqlForPartialUpdate(
      'users',
      userUpdateDetails,
      'username',
      username
    );

    // update database
    await db.query(query, values);

    // get updated userDetails
    const user = await User.getUser(username);
    return user;
  }

  /** @description deleteUser - deletes specific user in database
   * @param {string} username
   * @return {Promise <{ username, name, createdAt, updatedAt, stories, favorites}>}
   * both stories and favorites = [ { storyId, title, author, url, createdAt, updatedAt, username }, ... ]
   */
  static async deleteUser(username) {
    // check if user exists, else throw error
    await User.getUserDbInfo(username);

    // grab user details before deleting
    const user = await User.getUser(username);
    await db.query('DELETE FROM users WHERE username = $1', [username]);
    return user;
  }

  /** getUserFavorites - get user's favorites stories
   * @param {string} username
   * @return {Promise <[ { storyId, title, author, url, createdAt, updatedAt, username }, ... ]>}
   */
  static async getUserFavorites(username) {
    const dbStories = await db.query(
      `SELECT s.storyid, s.title, s.url, s.author, s.username, s.createdat, s.updatedat
       FROM favorites as f
       JOIN stories as s
       ON f.storyid = s.storyid
       WHERE f.username = $1`,
      [username]
    );

    // map & deconstruct data for camelCase formatting
    const stories = dbStories.rows.map(dbStory => {
      const { createdat, updatedat, storyid, ...userDetails } = dbStory;

      return {
        ...userDetails,
        storyId: storyid,
        createdAt: createdat,
        updatedAt: updatedat
      };
    });

    return stories;
  }

  /** addFavorite - add storyId to user's favorite stories
   * @param {string} username
   * @return {Promise <{ username, name, createdAt, updatedAt, stories, favorites}>}
   * both stories and favorites = [ { storyId, title, author, url, createdAt, updatedAt, username }, ... ]
   */
  static async addFavorite(username, storyId) {
    // check if story exists
    await Story.getStoryDbInfo(storyId);

    // check if storyId is already in user favs
    const result = await db.query(
      'SELECT * FROM favorites WHERE username = $1 AND storyid = $2',
      [username, storyId]
    );

    // if does not exist in favorites, add to favorties
    if (result.rows.length === 0) {
      // store username/storyId pair in favorites
      await db.query('INSERT INTO favorites VALUES ($1, $2)', [
        username,
        storyId
      ]);
    }

    const user = await User.getUser(username);
    return user;
  }

  /** deleteFavorite - delete storyId from user's favorite stories
   * @param {string} username
   * @return {Promise <{ username, name, createdAt, updatedAt, stories, favorites}>}
   * both stories and favorites = [ { storyId, title, author, url, createdAt, updatedAt, username }, ... ]
   */
  static async deleteFavorite(username, storyId) {
    // check if story exists
    await Story.getStoryDbInfo(storyId);

    // check if storyId is already in user favs
    const result = await db.query(
      'SELECT * FROM favorites WHERE username = $1 AND storyid = $2',
      [username, storyId]
    );

    // if exists in favorties, delete from favorties
    if (result.rows.length === 1) {
      // delete username/storyId pair from favorites
      await db.query(
        'DELETE FROM favorites WHERE username = $1 AND storyID = $2',
        [username, storyId]
      );
    }

    const user = await User.getUser(username);
    return user;
  }
}

module.exports = User;
