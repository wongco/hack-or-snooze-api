// npm modules
const express = require('express');
const router = new express.Router();
const cors = require('cors');

// class models
const User = require('../models/User');

// import helper
const validateJSONSchema = require('../helpers/validateJSONSchema');

// json validation
const usersPatchSchema = require('../schemas/usersPatchSchema.json');

// import middleware
const validHTTPMethods = require('../helpers/validHTTPMethods');
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');
const { ensureValidStoryId } = require('../middleware/stories');

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
    const user = await User.patchUser(username, req.body.user);
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
    const user = await User.deleteUser(username);
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
      const user = await User.addFavorite(username, storyId);
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
      const user = await User.deleteFavorite(username, storyId);
      return res.json({ message: 'Favorite Removed!', user });
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;
