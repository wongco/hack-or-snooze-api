// npm modules
const express = require('express');
const router = new express.Router();
const cors = require('cors');

// class models
const User = require('../models/User');
const APIError = require('../models/ApiError');

// import helper
const validateJSONSchema = require('../helpers/validateJSONSchema');

// json validation
const usersPatchSchema = require('../schemas/usersPatchSchema.json');
const usersRecPatchSchema = require('../schemas/usersRecPatchSchema.json');

// import middleware
const validHTTPMethods = require('../helpers/validHTTPMethods');
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');
const { ensureValidStoryId } = require('../middleware/stories');
const { TWILIO_ENABLED } = require('../config');

// allow CORS on all routes in this router page
router.use(cors());

/** Base Route: /users */

/* --------------------------------------
Rereference Route: /users
/users - GET
-------------------------------------- */

// restrict http methods on '/users' route
router.all('/', validHTTPMethods(['GET']));

/* Authenticated Route - Token Required */
/** GET - /users
 * desc: get a list of users
 * input: token (header), optional - { skip, limit }
 * output: { users: [{ createdAt, name, updatedAt, username}, ...]}
 */
router.get('/', ensureLoggedIn, async (req, res, next) => {
  try {
    // get users public info only
    const users = await User.getUsers(req.query);
    return res.json({ users });
  } catch (error) {
    return next(error);
  }
});

/* --------------------------------------
Rereference Route: /users/username
GET - /users/username
PATCH - /users/username
DELETE - /users/username
-------------------------------------- */

// restrict hhtp methods on '/users/username' route
router.all('/:username', validHTTPMethods(['GET', 'PATCH', 'DELETE']));

/* Authenticated Route - Token Required */
/** GET - /users/:username
 * desc: get a user
 * input: token (header)
 * output: { user: {  createdAt,
 *                    favorites: [storyDetails]
 *                    name,
 *                    stories: [storyDetails],
 *                    updatedAt,
 *                    username } }
 */
router.get('/:username', ensureLoggedIn, async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.getUser(username);
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

/* Authorized Route - Token Required, Correct User */
/** PATCH - /users/:username
 * desc: update a user
 * input: token (header),  { user: { name, password } }
 * output: { user: {  createdAt,
 *                    favorites: [storyDetails]
 *                    name,
 *                    stories: [storyDetails],
 *                    updatedAt,
 *                    username } }
 */
router.patch('/:username', ensureCorrectUser, async (req, res, next) => {
  try {
    // if schema is invalid, throw error
    validateJSONSchema(req.body, usersPatchSchema);
  } catch (err) {
    return next(err);
  }

  try {
    const { username } = req.params;
    const user = await User.getUser(username);
    await user.patchUser(req.body.user);

    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

/* Authorized Route - Token Required, Correct User */
/** DELETE - /users/:username
 * desc: delete a user
 * input: token (header)
 * output: { message: "User ${username} successfully deleted!",
 *           user: {  createdAt,
 *                    favorites: [storyDetails]
 *                    name,
 *                    stories: [storyDetails],
 *                    updatedAt,
 *                    username } }
 */
router.delete('/:username', ensureCorrectUser, async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.getUser(username);

    // delete user in db
    await user.deleteUser();

    return res.json({
      message: `User '${username}' successfully deleted.`,
      user
    });
  } catch (error) {
    return next(error);
  }
});

/* --------------------------------------
Rereference Route: /users/username/favorites/storyId
POST - /users/username/favorites/storyId
DELETE - /users/username/favorites/storyId
-------------------------------------- */

// restrict http methods on '/:username/favorites/:storyId' route
router.all(
  '/:username/favorites/:storyId',
  validHTTPMethods(['POST', 'DELETE'])
);

/* Authorized Route - Token Required, Correct User */
/** POST - /users/:username/favorites/:storyId
 * desc: add a new user favorite
 * input: token (header)
 * output: { message: "Favorite Added!",
 *           user: {  createdAt,
 *                    favorites: [storyDetails]
 *                    name,
 *                    stories: [storyDetails],
 *                    updatedAt,
 *                    username } }
 */
router.post(
  '/:username/favorites/:storyId',
  ensureValidStoryId,
  ensureCorrectUser,
  async (req, res, next) => {
    try {
      const { username, storyId } = req.params;

      const user = await User.getUser(username);
      await user.addFavorite(storyId);

      return res.json({ message: 'Favorite Added!', user });
    } catch (error) {
      return next(error);
    }
  }
);

/* Authorized Route - Token Required, Correct User */
/** DELETE - /users/:username/favorites/:storyId
 * desc: delete a user favorite
 * input: token (header)
 * output: { message: "Favorite Removed!",
 *           user: {  createdAt,
 *                    favorites: [storyDetails]
 *                    name,
 *                    stories: [storyDetails],
 *                    updatedAt,
 *                    username } }
 */
router.delete(
  '/:username/favorites/:storyId',
  ensureValidStoryId,
  ensureCorrectUser,
  async (req, res, next) => {
    try {
      const { username, storyId } = req.params;

      const user = await User.getUser(username);
      await user.deleteFavorite(storyId);

      return res.json({ message: 'Favorite Removed!', user });
    } catch (error) {
      return next(error);
    }
  }
);

/* -------------------------------------------------------------------*/
/* ---  Twilio Require - Enable only if twilio config is available ---*/
/* -------------------------------------------------------------------*/
if (TWILIO_ENABLED) {
  /* --------------------------------------
  Rereference Route: /users/username/recovery
  POST /users/username/recovery
  PATCH /users/username/recovery
  -------------------------------------- */

  // restrict http methods on '/:username/recovery' route
  router.all('/:username/recovery', validHTTPMethods(['POST', 'PATCH']));

  /** POST - /:username/recovery
   * desc: request SMS recovery code for specific username
   * input: username (param)
   * output: { message: 'Request Acknowledged.' }
   */
  router.post('/:username/recovery', async (req, res, next) => {
    const { username } = req.params;
    try {
      const user = await User.getUser(username);
      await user.sendRecoveryRequest(username);
      return res.json({
        message: `SMS recovery for user: '${username}' acknowledged.`
      });
    } catch (error) {
      // log error silently, give user same message
      console.log(`error: ${error.message}`);
      return res.json({
        message: `SMS recovery for user: '${username}' acknowledged.`
      });
    }
  });

  /** PATCH - /:username/recovery
   * desc: resets password based on recovery code and updates new password
   * input: { user: code, password }
   * output: { message: 'Successfully updated password.' }
   */
  router.patch('/:username/recovery', async (req, res, next) => {
    try {
      // if schema is invalid, throw error
      validateJSONSchema(req.body, usersRecPatchSchema);
    } catch (err) {
      return next(err);
    }

    try {
      const { username } = req.params;
      const { code, password } = req.body.user;

      const user = await User.getUser(username);

      await user.resetPassword(code, password);
      return res.json({
        message: 'Successfully updated password.'
      });
    } catch (err) {
      const error = new APIError(
        'Recovery information is invalid.',
        400,
        'Recovery failed'
      );
      return next(error);
    }
  });
}
/* -------------------------------------------------------------------*/
/* -----------------------Twilio Block End----------------------------*/

module.exports = router;
