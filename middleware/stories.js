const APIError = require('../models/ApiError');

/** Middleware: Checks storyID is valid. */

function ensureValidStoryId(req, res, next) {
  const { storyId } = req.params;
  // if storyI is a valid positive integer, proceed
  if (
    typeof +storyId === 'number' &&
    storyId.split('.').length === 1 &&
    +storyId >= 0
  ) {
    req.params.storyId = +storyId;
    return next();
  }

  const error = new APIError(
    `StoryID needs to be an integer.`,
    400,
    'Invalid StoryId'
  );
  return next(error);
}

module.exports = {
  ensureValidStoryId
};
