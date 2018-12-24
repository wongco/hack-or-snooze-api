/** User class for hack-or-snooze-API */

// npm modules
const db = require('../db');
const bcrypt = require('bcrypt');

// class models
const APIError = require('./models/ApiError');

// import config
const { BCRYPT_WORK_ROUNDS } = require('../config');

/** User on the site */

class User {
  /** getUser - gets a specific user from the database
   * @param {string} username
   * @return { Promise <{ user: username, name, createdAt, updatedAt, stories, favorites }>}
   * both stories and favorites = [ { storyId, title, author, url, createdAt, updatedAt, username }, ... ]
   */
  static async getUser(username) {
    const result = await db.query(`SELECT * FROM users WHERE username = $1`, [
      username
    ]);

    if (result.rows.length === 0) {
      throw new APIError(`No user '${username}' found.`, 'User Not Found', 404);
    }

    // single user row
    const user = result.rows[0];

    // deconstruct data for formatting
    const { createdat, updatedat, ...userDetails } = user;

    // get actual favorites and stories
    const favorites = []; // TODO: update using actual story methods
    const stories = []; // TODO: update using actual story methods

    return {
      ...userDetails,
      createdAt: createdat,
      updatedAt: updatedat,
      favorites,
      stories
    };
  }

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
        'User Already Exists',
        409
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
}

module.exports = User;
