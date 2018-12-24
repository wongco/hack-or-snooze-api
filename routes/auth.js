// npm modules
const express = require('express');
const router = new express.Router();
const jwt = require('jsonwebtoken');

// class models
const User = require('../models/User');

// import config info
const { SECRET_KEY } = require('../config');
const JWT_OPTIONS = { expiresIn: 60 * 60 * 24 }; // 1 day expiration

// import helper
const validateJSONSchema = require('../helpers/validateJSONSchema');

// json validation
const loginPostSchema = require('../schemas/loginPostSchema.json');

/** base route - auth resources */

/** POST - /signup
 * desc: create an account and receive token
 * input: { user: { name, username, password } }
 * output: { token, user: { userDetails } }
 */
router.post('/signup', async (req, res, next) => {
  try {
    // if schema is invalid, throw error
    validateJSONSchema(req.body, loginPostSchema);
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
    // add error validation for exisiting user

    // {
    //   "error": {
    //     "status": 409,
    //     "title": "User Already Exists",
    //     "message": "There is already a user with username 'yay'."
    //   }
    // }

    return next(error);
  }
});

/** POST - /login
 * desc: Login to Receive a Token
 * input: { user: username, password }
 * output: { token, user: {userDetails} }
 */
router.post('/login', (req, res, next) => {
  try {
    console.log(req.headers);
    return res.json({ message: 'login reached!' });
  } catch (error) {
    return next(error);
  }
});

// exports router for app.js use
module.exports = router;
