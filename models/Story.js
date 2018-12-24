/** Story class for hack-or-snooze-API */

// npm modules
const db = require('../db');

// class models
const APIError = require('./ApiError');
const User = require('./User');

/** Story on the site */

class Story {
  /** getUserOwnStories - gets stories created by a specific user
   * @param {string} username
   * @return { Promise <[ { storyId, title, author, url, createdAt, updatedAt, username }, ... ]>}
   */
  static async getUserOwnStories(username) {
    // check if user exists, else throw error
    await User.getUser(username);

    const result = await db.query('SELECT * FROM stories where username = $1', [
      username
    ]);
    return result.rows;
  }
}

module.exports = Story;
