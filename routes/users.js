// npm modules
const express = require('express');
const router = new express.Router();

// class models
const User = require('../models/User');
const APIError = require('../models/ApiError');

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
    const users = await User.getAllUsers(req.query);
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
router.get('/:username', (req, res, next) => {
  try {
    const { username } = req.params;
    return res.json({ message: `User ${username} requested!` });
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
router.patch('/:username', (req, res, next) => {
  try {
    const { username } = req.params;
    return res.json({ message: `User ${username} patched!` });
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
router.delete('/:username', (req, res, next) => {
  try {
    const { username } = req.params;
    return res.json({ message: `User ${username} deleted!` });
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
router.post('/:username/favorites/:storyId', (req, res, next) => {
  try {
    const { username, storyId } = req.params;
    return res.json({
      message: `User ${username} had story ${storyId} added to favorites!`
    });
  } catch (error) {
    return next(error);
  }
});

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
router.delete('/:username/favorites/:storyId', (req, res, next) => {
  try {
    const { username, storyId } = req.params;
    return res.json({
      message: `User ${username} had story ${storyId} removed from favorites!`
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
