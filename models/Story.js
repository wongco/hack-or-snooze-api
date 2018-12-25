/** Story class for hack-or-snooze-API */

// npm modules
const db = require('../db');

// class models
const APIError = require('./ApiError');

// helper function
const validateSkipLimit = require('../helpers/validateSkipLimit');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

// import config
const { STORIES_LIST_LIMIT } = require('../config');

/** Story on the site */

class Story {
  /** getUserOwnStories - gets stories created by a specific user
   * @param {string} username
   * @return { Promise <[ { storyId, title, author, url, createdAt, updatedAt, username }, ... ]>}
   */
  static async getUserOwnStories(username) {
    const result = await db.query('SELECT * FROM stories where username = $1', [
      username
    ]);
    return result.rows;
  }

  /** addStory - adds new story to db
   * @property {object} story
   * @property {string} story.username
   * @property {string} story.title
   * @property {string} story.author
   * @property {string} story.url
   * @return { Promise <{ storyId, title, author, url, createdAt, updatedAt, username }>}
   */
  static async addStory({ username, title, author, url }) {
    const result = await db.query(
      `INSERT INTO stories (username, title, author, url) VALUES ($1, $2, $3, $4) RETURNING *`,
      [username, title, author, url]
    );

    // single story row
    const story = result.rows[0];

    // deconstruct data for formatting
    const { createdat, updatedat, storyId, ...storyDetails } = story;

    // return formatted JS object
    return {
      ...storyDetails,
      storyId,
      createdAt: createdat,
      updatedAt: updatedat
    };
  }

  /** getStories - gets all stories in db filtered by criteria.
   * @property {object} reqDetails
   * @property {integer} reqDetails.skip
   * @property {integer} reqDetails.limit
   * @return { Promise <[ { storyId, title, author, url, createdAt, updatedAt, username }, ... ]>}
   */
  static async getStories(reqDetails) {
    // validates skip and limit, throws error if invalid
    validateSkipLimit(reqDetails, STORIES_LIST_LIMIT);

    const { skip, limit } = reqDetails;
    const result = await db.query(`SELECT * FROM stories OFFSET $1 LIMIT $2`, [
      skip,
      limit
    ]);

    // rename columns to match formatted output
    const stories = result.rows.map(storyDbDetail => {
      const { createdat, updatedat, storyid, ...userDetails } = storyDbDetail;
      return {
        ...userDetails,
        storyId: storyid,
        createdAt: createdat,
        updatedAt: updatedat
      };
    });

    return stories;
  }

  /** getStoryDbInfo - gets a specific story's info from the db
   * @param {string} username
   * @return { Promise <{ storyid, title, author, url, createdat, updatedat, username }>}
   */
  static async getStoryDbInfo(storyId) {
    const result = await db.query('SELECT * FROM stories WHERE storyid = $1', [
      storyId
    ]);

    // check if story exists, else throw error
    if (result.rows.length === 0) {
      throw new APIError(
        `No story with ID '${storyId}' found.`,
        404,
        'Story Not Found'
      );
    }
    return result.rows[0];
  }

  /** getStory - get a specific story's info formatted nicely for JONS resp.
   * @param {interger} storyId
   * @return { Promise <{ storyId, title, author, url, createdAt, updatedAt, username }>}
   */
  static async getStory(storyId) {
    // check if story exists and get story Info
    const story = await Story.getStoryDbInfo(storyId);

    // deconstruct data for camelCase formatting
    const { createdat, updatedat, storyid, ...userDetails } = story;

    return {
      ...userDetails,
      storyId: storyid,
      createdAt: createdat,
      updatedAt: updatedat
    };
  }
}

module.exports = Story;
