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
const formatPhoneNumber = require('../helpers/formatPhoneNumber');
const checkRecoveryCodeValidity = require('../helpers/checkRecoveryCodeValidity');

// import config
const {
  BCRYPT_WORK_ROUNDS,
  USERS_LIST_LIMIT,
  RECCODE_EXP_IN_MINS,
  TWILIO_ENABLED
} = require('../config');

/* -------------------------------------------------------------------*/
/* ---  Twilio Require - Enable only if twilio config is available ---*/
/* -------------------------------------------------------------------*/
let sendSmsMessage;
if (TWILIO_ENABLED) {
  sendSmsMessage = require('../helpers/sendSmsMessage');
}
/* -------------------------------------------------------------------*/
/* -----------------------Twilio Block End----------------------------*/

/** User on the site */

class User {
  constructor({
    name,
    username,
    createdAt,
    updatedAt,
    favorites = [],
    stories = []
  }) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.favorites = favorites;
    this.stories = stories;
  }

  /** @description addUser - adds a user to the database
   * @property {object} user
   * @property {string} user.username
   * @property {string} user.name
   * @property {string} user.password
   * @return {Promise <User ({ user: username, name, createdAt, updatedAt, stories, favorites})>}
   * both stories and favorites = [ { storyId, title, author, url, createdAt, updatedAt, username }, ... ]
   */
  static async addUser({ name, username, password, phone }) {
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

    // if phone number was passed, validate, convert to E.164
    if (phone) {
      // validates phone input, or sets to blank if invalid
      phone = formatPhoneNumber(phone);
    }

    // create hashed password with bcrypt
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_ROUNDS);
    const result = await db.query(
      `INSERT INTO users (username, name, password, phone) VALUES ($1, $2, $3, $4) RETURNING username, name, createdat, updatedat`,
      [username, name, hashedPassword, phone]
    );

    // single user row
    const user = result.rows[0];

    // deconstruct data for formatting
    const { createdat, updatedat, ...userDetails } = user;

    return new User({
      ...userDetails,
      createdAt: createdat,
      updatedAt: updatedat
    });
  }

  /** @description isUsernameValidFromToken - validate user exists from good token
   * @param {string} username
   * @return {boolean}}
   */
  static async isUsernameValidFromToken(username) {
    const result = await db.query(`SELECT * FROM users WHERE username = $1`, [
      username
    ]);

    // check if user exists, else throws unauthorized error
    if (result.rows.length === 0) {
      throw new APIError('Missing or invalid auth token.', 401, 'Unauthorized');
    }

    return true;
  }

  /** @description getUserDbInfo - gets a specific user's info from the db
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

  /** @description getUser - gets a specific user's info formatted nicely for JSON resp.
   * @param {string} username
   * @return {Promise <User({ username, name, createdAt, updatedAt, stories, favorites})>}
   * both stories and favorites = [ { storyId, title, author, url, createdAt, updatedAt, username }, ... ]
   */
  static async getUser(username) {
    // check if user exists
    const userDb = await User.getUserDbInfo(username);

    // deconstruct data for camelCase formatting
    const { createdat, updatedat, ...userDetails } = userDb;

    const user = new User({
      ...userDetails,
      createdAt: createdat,
      updatedAt: updatedat
    });

    // get actual favorites and stories
    user.favorites = await user.getUserFavorites();
    user.stories = await user.getUserOwnStories();

    return user;
  }

  /** @description checkValidCreds - checks if a user's credentials are valid
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

  /** @description getUsers - returns list of all users in db filtered by criteria.
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
    const publicUsers = result.rows.map(userPublicDetail => {
      const { createdat, updatedat, ...userDetails } = userPublicDetail;
      return {
        ...userDetails,
        createdAt: createdat,
        updatedAt: updatedat
      };
    });

    return publicUsers;
  }

  /** @description patchUser - updates user instance in database
   * @property {object} rawUpdate (at least one property below)
   * @property {string} rawUpdate.name
   * @property {string} rawUpdate.password
   * @property {string} rawUpdate.phone
   */
  async patchUser(rawUpdate) {
    // update updatedAt filed for db arg and instance
    let cleanUpdate = {
      updatedat: new Date()
    };
    this.updatedAt = cleanUpdate.updatedat;

    // if updated name was passed update db arg and instance
    if (rawUpdate.name) {
      this.name = rawUpdate.name;
      cleanUpdate.name = rawUpdate.name;
    }

    // convert phone to E.164 for update in db
    if (rawUpdate.phone) {
      cleanUpdate.phone = formatPhoneNumber(rawUpdate.phone);
    }

    // hash password for update in db
    if (rawUpdate.password) {
      const hashPassword = await bcrypt.hash(
        rawUpdate.password,
        BCRYPT_WORK_ROUNDS
      );
      cleanUpdate.password = hashPassword;
    }

    // generate sql commands for update with data from cleanUpdate
    const { query, values } = sqlForPartialUpdate(
      'users',
      cleanUpdate,
      'username',
      this.username
    );

    // update database
    await db.query(query, values);

    // if name was updated, update all messages of author
    if (rawUpdate.name) {
      // update author name in db
      await this.updateAuthoredStories();
    }
  }

  /** @description updateAuthoredStories - updates user instance in database */
  async updateAuthoredStories() {
    // update author name in db
    await db.query(
      'UPDATE stories SET author = $1, updatedat = $2 WHERE username = $3',
      [this.name, new Date(), this.username]
    );

    // update user instance stories to reflect updated author name
    this.stories.map(story => {
      story.author = this.name;
    });

    // update user instance favorites to reflect updated author name
    this.favorites.map(story => {
      if (story.username === this.username) {
        story.author = this.name;
      }
    });
  }

  /** @description deleteUser - deletes user instance in database */
  async deleteUser() {
    await db.query('DELETE FROM users WHERE username = $1', [this.username]);
  }

  /** @description getUserOwnStories - gets stories created by a specific user
   * @param {string} username
   * @return { Promise <[ { storyId, title, author, url, createdAt, updatedAt, username }, ... ]>}
   */
  async getUserOwnStories() {
    const dbStories = await db.query(
      'SELECT * FROM stories where username = $1 ORDER BY createdat DESC',
      [this.username]
    );

    // map & deconstruct data for camelCase formatting
    const stories = dbStories.rows.map(dbStory => {
      const { createdat, updatedat, storyid, ...userDetails } = dbStory;
      return new Story({
        ...userDetails,
        storyId: storyid,
        createdAt: createdat,
        updatedAt: updatedat
      });
    });

    return stories;
  }

  /** @description getUserFavorites - get user's favorites stories
   * @return {Promise <[ { storyId, title, author, url, createdAt, updatedAt, username }, ... ]>}
   */
  async getUserFavorites() {
    const dbStories = await db.query(
      `SELECT s.storyid, s.title, s.url, s.author, s.username, s.createdat, s.updatedat
       FROM favorites as f
       JOIN stories as s
       ON f.storyid = s.storyid
       WHERE f.username = $1
       ORDER BY createdat DESC`,
      [this.username]
    );

    // map & deconstruct data for camelCase formatting
    const stories = dbStories.rows.map(dbStory => {
      const { createdat, updatedat, storyid, ...userDetails } = dbStory;
      return new Story({
        ...userDetails,
        storyId: storyid,
        createdAt: createdat,
        updatedAt: updatedat
      });
    });

    return stories;
  }

  /** @description addFavorite - add storyId to user's favorite stories
   * @param {string} storyId
   */
  async addFavorite(storyId) {
    // check if story exists
    const story = await Story.getStory(storyId);

    // check if storyId is already in user favs
    const storyExistsIdx = this.favorites.findIndex(
      story => story.storyId === storyId
    );

    // if does not exist in favorites, add to favorties
    if (storyExistsIdx === -1) {
      // store username/storyId pair in favorites
      await db.query('INSERT INTO favorites VALUES ($1, $2)', [
        this.username,
        storyId
      ]);
      // update user instance favorites
      this.favorites.push(story);
    }
  }

  /** @description deleteFavorite - delete storyId from user's favorite stories
   * @param {string} storyId
   */
  async deleteFavorite(storyId) {
    // check if story exists
    await Story.getStoryDbInfo(storyId);

    // check if storyId is already in user favs
    const storyExistsIdx = this.favorites.findIndex(
      story => story.storyId === storyId
    );

    // if exists in favorties, delete from favorties
    if (storyExistsIdx >= 0) {
      // delete username/storyId pair from favorites
      await db.query(
        'DELETE FROM favorites WHERE username = $1 AND storyID = $2',
        [this.username, storyId]
      );
      this.favorites.splice(storyExistsIdx, 1);
    }
  }

  /** @description isRecoveryInfoValid - check user and phone info
   * @return {Promise <boolean>}}
   */
  async canRecoveryBeInitiated() {
    const dbUserResult = await db.query(
      `SELECT phone FROM users WHERE username = $1`,
      [this.username]
    );

    // extract user phone # and if does not exist, silent fail, log to server
    const { phone } = dbUserResult.rows[0];
    if (!phone) {
      console.log(
        'Fail Condition (Log to Server): SMS Number does not exist for requested user.'
      );
      return false;
    }
    return true;
  }

  /** @description createDbRecoveryEntry - create recovery info for user
   * @return {Promise <{ phone, recCode }>}}
   */
  async createDbRecoveryEntry() {
    // grab phone number from database
    const phone = (await db.query(
      `SELECT phone FROM users WHERE username = $1`,
      [this.username]
    )).rows[0].phone;

    // delete old recovery entry if exists
    await db.query('DELETE FROM recovery WHERE username = $1', [this.username]);

    // 6 random digits joined as a text string, Ex: '158392'
    const recCode = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 10)
    ).join('');

    // generate new code, send to sms
    const hashedRecCode = await bcrypt.hash(recCode, BCRYPT_WORK_ROUNDS);

    // place recovery code in db
    await db.query('INSERT INTO recovery (username, code) VALUES ($1, $2)', [
      this.username,
      hashedRecCode
    ]);

    return { phone, recCode };
  }

  /** @description sendRecoveryRequest - send SMS recovery request (Req Twilio)
   * @return {Promise <boolean>}}
   */
  async sendRecoveryRequest() {
    // if there are any errors, exit of of func immediately
    if (!(await this.canRecoveryBeInitiated())) {
      return false;
    }

    const { phone, recCode } = await this.createDbRecoveryEntry();

    // send recoveryCode to SMS - running async is fine (send via Twilio)
    sendSmsMessage(
      phone,
      `\nHack-or-Snooze Recovery Code: ${recCode}\n\nCode expires in 10 minutes.`
    );

    return true;
  }

  /** @description getRecoveryCodeInfo - Verifies Recovery Info Exists for User
   * @param {string} username
   * @return {Promise <{ username, code, createdat }>}}
   */
  async getRecoveryCodeInfo() {
    const result = await db.query(
      'SELECT * FROM recovery WHERE username = $1',
      [this.username]
    );

    // check if recovery info exists in recovery database
    if (result.rows.length === 0) {
      throw new APIError(
        'Recovery information is invalid.',
        400,
        'Recovery failed'
      );
    }
    return result.rows[0];
  }

  /** @description checkRecoveryTimeValidity - Verifies Recovery Time Expiration
   * @param {date} createdTime
   * @return {Promise <boolean>}}
   */
  async checkRecoveryTimeValidity(createdTime) {
    const currentTime = new Date();
    const timeDifferenceInMins = (currentTime - createdTime) / 1000 / 60;

    // check if more than RECCODE_EXP_IN_MINS minutes has elapsed (Code has expired)
    if (timeDifferenceInMins > RECCODE_EXP_IN_MINS) {
      // code has expired - delete old recovery entry
      await db.query('DELETE FROM recovery WHERE username = $1', [
        this.username
      ]);
      throw new APIError(
        'Recovery information is invalid.',
        400,
        'Recovery failed'
      );
    }
    return true;
  }

  /** @description resetPassword - reset user password with code (Req Twilio)
   * @param {string} code
   * @param {string} password
   * @return {Promise <boolean>}}
   */
  async resetPassword(inputCode, newPassword) {
    // obtain recovery info, if does not exist, throw error
    const recInfo = await this.getRecoveryCodeInfo();

    // check if recovery time has not expired, else throw error
    const createdTime = recInfo.createdat;
    await this.checkRecoveryTimeValidity(createdTime);

    // check if inputCode is correct, else throw error
    const recoveryHashedCode = recInfo.code;
    await checkRecoveryCodeValidity(inputCode, recoveryHashedCode);

    // code is valid, update password and delete recovery info
    await this.patchUser({
      password: newPassword
    });
    await db.query('DELETE FROM recovery WHERE username = $1', [this.username]);
    return true;
  }
}

module.exports = User;
