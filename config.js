/** Common config for hack-or-snooze-API */

// read .env files and make environmental variables
require('dotenv').config();

// pull db uri from .env
let DB_URI = process.env.DB_URI;

// if db uri is undefined, use local db
if (!DB_URI) {
  DB_URI = 'postgresql:///hack-or-snooze';
}

// if test environment is active use test db
if (process.env.NODE_ENV === 'test') {
  DB_URI = 'postgresql:///hack-or-snooze-test';
}

const BCRYPT_WORK_ROUNDS = +process.env.BCRYPT_WORK_ROUNDS || 12;
const SECRET_KEY = process.env.SECRET_KEY || 'test-env-secret';
const SERVER_PORT = +process.env.SERVER_PORT || 3000;

module.exports = {
  SECRET_KEY,
  BCRYPT_WORK_ROUNDS,
  DB_URI,
  SERVER_PORT
};
