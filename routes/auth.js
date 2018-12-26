// npm modules
const express = require('express');
const router = new express.Router();
const jwt = require('jsonwebtoken');
const cors = require('cors');

// class models
const User = require('../models/User');
const APIError = require('../models/ApiError');

// import config info
const { SECRET_KEY, JWT_OPTIONS } = require('../config');

// import helper
const validateJSONSchema = require('../helpers/validateJSONSchema');
const validHTTPMethods = require('../helpers/validHTTPMethods');

// json validation
const signupPostSchema = require('../schemas/signupPostSchema.json');
const loginPostSchema = require('../schemas/loginPostSchema.json');

// allow CORS on all routes in this router page
router.use(cors());

/** base route - auth resources */

/* --------------------------------------
Rereference Route: /signup
POST - /signup
-------------------------------------- */

/** POST - /signup
 * desc: create an account and receive token
 * input: { user: { name, username, password } }
 * output: { token, user: { userDetails } }
 */
router.post('/signup', validHTTPMethods(['POST']), async (req, res, next) => {
  try {
    // if schema is invalid, throw error
    validateJSONSchema(req.body, signupPostSchema);
  } catch (err) {
    return next(err);
  }

  try {
    // add user to database, if fail throw error
    const user = await User.addUser(req.body.user);

    // generate json web token and store username
    const { username } = req.body;
    const token = jwt.sign({ username }, SECRET_KEY, JWT_OPTIONS);

    return res.status(201).json({ token, user });
  } catch (error) {
    return next(error);
  }
});

/* --------------------------------------
Rereference Route: /login
POST - /login
-------------------------------------- */

/** POST - /login
 * desc: Login to Receive a Token
 * input: { user: username, password }
 * output: { token, user: {userDetails} }
 */
router.post('/login', validHTTPMethods(['POST']), async (req, res, next) => {
  try {
    // if schema is invalid, throw error
    validateJSONSchema(req.body, loginPostSchema);
  } catch (err) {
    return next(err);
  }

  try {
    const { username, password } = req.body.user;

    // check if login is valid, else throws errors
    await User.checkValidCreds(username, password);
    const user = await User.getUser(username);
    const token = jwt.sign({ username }, SECRET_KEY, JWT_OPTIONS);

    return res.json({ token, user });
  } catch (err) {
    const error = new APIError(
      'Invalid login credentials.',
      401,
      'Unauthorized'
    );
    return next(error);
  }
});

// exports router for app.js use
module.exports = router;
