// npm modules
const express = require('express');
const router = new express.Router();
const cors = require('cors');

// class models
const Story = require('../models/Story');

// import helper
const validateJSONSchema = require('../helpers/validateJSONSchema');

// json validation
const storiesPostSchema = require('../schemas/storiesPostSchema.json');
const storiesPatchSchema = require('../schemas/storiesPatchSchema.json');

// import middleware
const validHTTPMethods = require('../helpers/validHTTPMethods');
const { ensureValidStoryId } = require('../middleware/stories');
const { ensureLoggedIn, ensureCorrectAuthor } = require('../middleware/auth');

// allow CORS on all routes in this router page
router.use(cors());

/** Base Route: /stories */

/* --------------------------------------
Rereference Route: /stories
GET - /stories
POST - /stories
-------------------------------------- */

// middleware - restrict http methods on '/stories' route
router.all('/', validHTTPMethods(['GET', 'POST']));

/** GET - /stories
 * desc: Get a List of Stories
 * input: optional - { skip, limit }
 * output: { stories: [{ storyDetails}, ...]}
 */
router.get('/', async (req, res, next) => {
  try {
    const stories = await Story.getStories(req.query);
    return res.json({ stories });
  } catch (error) {
    return next(error);
  }
});

/* Authenticated Route - Token Required */
/** POST - /stories
 * desc: Create a New Story
 * input: token (header), { story: {username, author, title, url} }
 * output: { story: { storyDetails } }
 */
router.post('/', ensureLoggedIn, async (req, res, next) => {
  try {
    // if schema is invalid, throw error
    validateJSONSchema(req.body, storiesPostSchema);
  } catch (err) {
    return next(err);
  }

  try {
    // provide username from token
    req.body.story.username = req.username;

    // user has been authenticated and checked in middlware
    const story = await Story.addStory(req.body.story);
    return res.json({ story });
  } catch (error) {
    return next(error);
  }
});

/* --------------------------------------
Rereference Route: /stories/:storyID
GET - /stories/:storyID
PATCH - /stories/:storyID
DELETE - /stories/:storyID
-------------------------------------- */

//  middleware - restrict http methods on '/stories/:storyId' route
router.all('/:storyId', validHTTPMethods(['GET', 'PATCH', 'DELETE']));

/** GET - /stories/:storyId
 * desc: Get a Story
 * output: { story: { storyDetails } }
 */
router.get('/:storyId', ensureValidStoryId, async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const story = await Story.getStory(storyId);
    return res.json({ story });
  } catch (error) {
    return next(error);
  }
});

/* Authorized Route - Token Required, Correct User */
/** PATCH - /stories/:storyId
 * desc: Update a Story
 * input: token (header), { story: { author, title, url} }
 * output: { story: { storyDetails } }
 */
router.patch(
  '/:storyId',
  ensureValidStoryId,
  ensureCorrectAuthor,
  async (req, res, next) => {
    try {
      // if schema is invalid, throw error
      validateJSONSchema(req.body, storiesPatchSchema);
    } catch (err) {
      return next(err);
    }

    try {
      const { storyId } = req.params;
      const story = await Story.getStory(storyId);

      await story.patchStory(req.body.story);
      return res.json({ story });
    } catch (error) {
      return next(error);
    }
  }
);

/* Authorized Route - Token Required, Correct User */
/** DELETE - /stories/:storyId
 * desc: Delete a Story
 * input: token (header)
 * output: { message: "Story with ${storyId} successfully deleted"
 *           story: { storyDetails } }
 */
router.delete(
  '/:storyId',
  ensureValidStoryId,
  ensureCorrectAuthor,
  async (req, res, next) => {
    try {
      const { storyId } = req.params;
      const story = await Story.getStory(storyId);

      await story.deleteStory();
      return res.json({
        message: `Story with ID '${storyId}' successfully deleted.`,
        story
      });
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;
