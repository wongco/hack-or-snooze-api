/** User class for hack-or-snooze-API */

// npm modules
const db = require('../db');
const bcrypt = require('bcrypt');

// class models
const APIError = require('./ApiError');
const Story = require('./Story');

// helper function
const validateSkipLimit = require('../helpers/validateSkipLimit');

// import config
const { BCRYPT_WORK_ROUNDS, USERS_LIST_LIMIT } = require('../config');

/** User on the site */

class User {
  /** addUser - adds a user to the database
   * @typedef {Object} user
   * @property {string} username
   * @property {string} name
   * @property {string} password
   * @return { Promise <{ user: username, name, createdAt, updatedAt, stories, favorites }>}
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

  /** getUserDbInfo - gets a specific user's info from the database
   * @param {string} username
   * @return { Promise <{ username, name, createdAt, updatedAt }>}
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

  /** getUser - gets a specific user's info formatted nicely for JONS resp.
   * @param {string} username
   * @return { Promise <{ username, name, createdAt, updatedAt, stories, favorites }>}
   * both stories and favorites = [ { storyId, title, author, url, createdAt, updatedAt, username }, ... ]
   */
  static async getUser(username) {
    // check if user exists
    const user = await User.getUserDbInfo(username);

    // deconstruct data for formatting
    const { createdat, updatedat, ...userDetails } = user;

    // get actual favorites and stories
    const favorites = []; // TODO: update using actual story methods
    const stories = await Story.getUserOwnStories(username); // TODO: update using actual story methods

    return {
      ...userDetails,
      createdAt: createdat,
      updatedAt: updatedat,
      favorites,
      stories
    };
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

  /** getAllUsers - returns list of all users in database
   * @typedef {Object} queryString
   * @property {integer} skip
   * @property {integer} limit
   * @returns { Promise <[ { username, name, createdAt, updatedAt }, ...]>}
   */
  static async getAllUsers(reqDetails) {
    // validates skip and limit, throws error if invalid
    validateSkipLimit(reqDetails);

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
}

module.exports = User;
