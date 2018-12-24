// npm modules
const db = require('../db');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_ROUNDS } = require('../config');

class User {
  static async addUser({ name, username, password }) {
    // check if user exist in database, if so throw error
    // await User.getUser(username);

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
