// npm module
const normalizePhoneNum = require('phone');

// class models
const APIError = require('../models/ApiError');

/** @description formatPhoneNumber - formats phone into E.164 format
 * @param {string} phone
 * @return {string} phone - Ex: +14151231234
 */
function formatPhoneNumber(phone) {
  // retrieve valid USA phone numbers only
  const result = normalizePhoneNum(phone, 'USA');
  // could not recognize USA phone number
  if (result.length === 0) {
    throw new APIError(
      'Please input a valid USA phone number.',
      400,
      'Invalid Input'
    );
  }
  return result[0];
}

module.exports = formatPhoneNumber;
