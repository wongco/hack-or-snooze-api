const APIError = require('../models/ApiError');

/** middleware to validate allowed HTTP methods */
function validHTTPMethods(acceptedMethods) {
  return function(req, res, next) {
    if (!acceptedMethods.includes(req.method)) {
      const error = new APIError(
        `${req.method} is not supported at ${req.path}.`,
        405,
        'Method Not Allowed'
      );
      return next(error);
    }
    return next();
  };
}

module.exports = validHTTPMethods;
