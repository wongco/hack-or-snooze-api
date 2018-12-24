// class models
const APIError = require('../models/ApiError');

// import config
const { USERS_LIST_LIMIT } = require('../config');

/** validates skip and limit input for sql searches */
function validateSkipLimit(reqDetails) {
  // if skip is undefined or blank, set to default of 0
  if (reqDetails.skip === '' || reqDetails.skip === undefined) {
    reqDetails.skip = 0;
  } else if (Number.isNaN(+reqDetails.skip)) {
    // if skip is in invalid value, throw error
    throw new APIError(
      `Invalid skip: '${reqDetails.skip}', skip needs to be an integer.`,
      400,
      'Bad Request'
    );
  } else if (+reqDetails.skip < 0) {
    // if skip is set to smaller than zero, throw error
    throw new APIError(
      `${
        reqDetails.skip
      } is out of range for skip -- it should be 0 or larger.`,
      400,
      'Bad Request'
    );
  }

  // if limit is undfined or blank, set to default value
  if (reqDetails.limit === '' || reqDetails.limit === undefined) {
    reqDetails.limit = USERS_LIST_LIMIT;
  } else if (Number.isNaN(+reqDetails.limit)) {
    // if limit is invalid value, throw error
    throw new APIError(
      `Invalid limit: '${reqDetails.limit}', limit needs to be an integer.`,
      400,
      'Bad Request'
    );
  } else if (+reqDetails.limit < 1 || +reqDetails.limit > USERS_LIST_LIMIT) {
    // if limit is set to out of range throw error
    throw new APIError(
      `${
        reqDetails.limit
      } is out of range for limit -- it should be between 1 and ${USERS_LIST_LIMIT}.`,
      400,
      'Bad Request'
    );
  }

  // coerce values into Numbers and round down to int
  reqDetails.skip = Math.floor(+reqDetails.skip);
  reqDetails.limit = Math.floor(+reqDetails.limit);
}

module.exports = validateSkipLimit;
