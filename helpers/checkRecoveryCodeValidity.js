// class models
const APIError = require('../models/ApiError');

// npm modules
const bcrypt = require('bcrypt');

/** @description checkRecoveryCodeValidity - Verifies RecoveryCode
 * @param {string} inputCode
 * @param {string} recoveryHashedCode
 * @return {Promise <boolean>}}
 */
async function checkRecoveryCodeValidity(inputCode, recoveryHashedCode) {
  const isValid = await bcrypt.compare(inputCode, recoveryHashedCode);
  if (!isValid) {
    throw new APIError(
      'Recovery information is invalid.',
      400,
      'Recovery failed'
    );
  }
  return true;
}

module.exports = checkRecoveryCodeValidity;
