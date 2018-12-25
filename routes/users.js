// npm modules
const express = require('express');
const router = new express.Router();

// class models
const User = require('../models/User');
const APIError = require('../models/ApiError');

// import helper
const validateJSONSchema = require('../helpers/validateJSONSchema');

// json validation
const usersPatchSchema = require('../schemas/usersPatchSchema.json');

// import middleware
const { ensureValidStoryId } = require('../middleware/stories');

/** Base Route: /users */

/* Authenticated Route - Token Required */
/** GET - /users
 * desc: get a list of users
 * input: token (header), optional - { skip, limit }
 * output: { users: [{ createdAt, name, updatedAt, username}, ...]}
 */
router.get('/', async (req, res, next) => {
  // console.log(req.headers);
  try {
    const users = await User.getUsers(req.query);
    return res.json({ users });
  } catch (error) {
    return next(error);
  }
});

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
router.get('/:username', async (req, res, next) => {
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
router.patch('/:username', async (req, res, next) => {
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
router.delete('/:username', async (req, res, next) => {
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
