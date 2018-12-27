/** Middlware for authenticating hack-or-snooze-API */

// npm modules
const jwt = require('jsonwebtoken');

// import config info
const { SECRET_KEY, JWT_OPTIONS } = require('../config');

// class models
const Story = require('../models/Story');
const APIError = require('../models/ApiError');
const User = require('../models/User');

/** helper for auth middlware, obtain jwt from header */
function getToken(req) {
  // extract authorization header
  const { authorization } = req.headers;
  if (!authorization) {
    throw new APIError('Missing or invalid auth token.', 401, 'Unauthorized');
  }

  // authorization exists. check data
  const authInfo = authorization.split(' ');

  // check auth lenght is 2, else throw error
  if (authInfo.length !== 2 || authInfo[0] !== 'Bearer') {
    throw new APIError('Missing or invalid auth token.', 401, 'Unauthorized');
  }

  const token = authInfo[1];
  return token;
}

/** Middleware: Requires user is logged in. */
async function ensureLoggedIn(req, res, next) {
  try {
    const token = getToken(req);

    // verifies token and throws error if invalid
    const { username } = jwt.verify(token, SECRET_KEY, JWT_OPTIONS);

    // check if user exists, else throw unauthorized error
    await User.isUsernameValidFromToken(username);

    // then store username for conveneince
    req.username = username;

    return next();
  } catch (error) {
    return next(error);
  }
}

async function ensureCorrectUser(req, res, next) {
  try {
    const token = getToken(req);
    // verifies token and throws error if invalid
    const { username } = jwt.verify(token, SECRET_KEY, JWT_OPTIONS);

    // check if user exists, else throw unauthorized error
    await User.isUsernameValidFromToken(username);

    if (username === req.params.username) {
      // then store username for conveneince
      req.username = username;
      return next();
    }

    throw new APIError(
      'You are not allowed to update other users.',
      403,
      'Forbidden'
    );
  } catch (err) {
    return next(err);
  }
}

async function ensureCorrectAuthor(req, res, next) {
  try {
    const token = getToken(req);
    // verifies token and throws error if invalid
    const { username } = jwt.verify(token, SECRET_KEY, JWT_OPTIONS);

    // check if user exists, else throw unauthorized error
    await User.isUsernameValidFromToken(username);

    // check if current logged in user is creator of story
    const { storyId } = req.params;
    const story = await Story.getStoryDbInfo(storyId);
    if (username === story.username) {
      // then store username for conveneince
      req.username = username;
      return next();
    }

    throw new APIError(
      'You are not the user who posted this story so you cannot update it.',
      403,
      'Forbidden'
    );
  } catch (err) {
    return next(err);
  }
}

module.exports = { ensureLoggedIn, ensureCorrectUser, ensureCorrectAuthor };
