// npm modules
const express = require('express');
const router = new express.Router();
const cors = require('cors');

// class models
const APIError = require('../models/ApiError');

// import config info
const { SECRET_KEY } = require('../config');

// import helper
const validateJSONSchema = require('../helpers/validateJSONSchema');
const validHTTPMethods = require('../helpers/validHTTPMethods');

// json validation
// const signupPostSchema = require('../schemas/signupPostSchema.json');

// allow CORS on all routes in this router page
router.use(cors());

/* --------------------------------------
Rereference Route: /users/username/recovery
POST /users/username/recovery
PUT /users/username/recovery
-------------------------------------- */

/** POST - /recovery
 * desc: request SMS recovery code for specific username
 * input: { user: username }
 * output: { message: 'Request Acknowledged.' }
 */
router.post(
  '/recovery/:username',
  validHTTPMethods(['GET']),
  async (req, res, next) => {
    try {
      const { username } = req.params;
    } catch (error) {
      return next(error);
    }
  }
);

/* --------------------------------------
Rereference Route: /login
POST - /login
-------------------------------------- */

// exports router for app.js use
module.exports = router;
