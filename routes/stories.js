const express = require('express');
const router = new express.Router();

/** Base Route: /stories */

/** GET - /stories
 * desc: Get a List of Stories
 * output: { stories: [{ storyDetails}, ...]}
 */
router.get('/', (req, res, next) => {
  try {
    return res.json({ message: 'all stories requested!' });
  } catch (error) {
    return next(error);
  }
});

/* Authenticated Route - Token Required */
/** POST - /stories
 * desc: Create a New Story
 * input: token (header), { story: {username, author, title, url} }
 */
router.post('/', (req, res, next) => {
  try {
    return res.json({ message: 'New Story added!' });
  } catch (error) {
    return next(error);
  }
});

/** GET - /stories/:storyId
 * desc: Get a Story
 * output: { story: { storyDetails } }
 */
router.get('/:storyId', (req, res, next) => {
  try {
    const { storyId } = req.params;
    return res.json({
      message: `Retrieved a single story with id: ${storyId}.`
    });
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
router.patch('/:storyId', (req, res, next) => {
  try {
    const { storyId } = req.params;
    return res.json({
      message: `Story with id: ${storyId} was updated.`
    });
  } catch (error) {
    return next(error);
  }
});

/* Authorized Route - Token Required, Correct User */
/** DELETE - /stories/:storyId
 * desc: Delete a Story
 * input: token (header)
 * output: { message: "Story with ${storyId} successfully deleted"
 *           story: { storyDetails } }
 */
router.delete('/:storyId', (req, res, next) => {
  try {
    const { storyId } = req.params;
    return res.json({
      message: `Story with id: ${storyId} was deleted.`
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
