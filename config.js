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

let BCRYPT_WORK_ROUNDS;
if (process.env.NODE_ENV === 'test') {
  BCRYPT_WORK_ROUNDS = 1;
} else {
  BCRYPT_WORK_ROUNDS = +process.env.BCRYPT_WORK_ROUNDS || 12;
}

const SECRET_KEY = process.env.SECRET_KEY || 'test-env-secret';
const SERVER_PORT = +process.env.SERVER_PORT || 3000;
const USERS_LIST_LIMIT = +process.env.USERS_LIST_LIMIT || 25;
const STORIES_LIST_LIMIT = +process.env.STORIES_LIST_LIMIT || 25;

let JWT_OPTIONS;
if (process.env.NODE_ENV === 'test') {
  JWT_OPTIONS = {};
} else {
  JWT_OPTIONS = { expiresIn: 60 * 60 * 24 * 7 };
}

module.exports = {
  SECRET_KEY,
  BCRYPT_WORK_ROUNDS,
  DB_URI,
  SERVER_PORT,
  USERS_LIST_LIMIT,
  STORIES_LIST_LIMIT,
  JWT_OPTIONS
};
