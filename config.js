/** Common config for hack-or-snooze-API */

// read .env files and make environmental variables
require('dotenv').config();

// pull db uri from .env
let DB_URI = process.env.DATABASE_URL || 'postgresql:///hack-or-snooze';
let BCRYPT_WORK_ROUNDS = +process.env.BCRYPT_WORK_ROUNDS || 12;
let JWT_OPTIONS = { expiresIn: 60 * 60 * 24 * 7 };

// if test environment is active
if (process.env.NODE_ENV === 'test') {
  DB_URI = 'postgresql:///hack-or-snooze-test';
  BCRYPT_WORK_ROUNDS = 1;
  JWT_OPTIONS = {};
}

const SECRET_KEY = process.env.SECRET_KEY || 'test-env-secret';
const SERVER_PORT = process.env.PORT || 3000;
const USERS_LIST_LIMIT = +process.env.USERS_LIST_LIMIT || 25;
const STORIES_LIST_LIMIT = +process.env.STORIES_LIST_LIMIT || 25;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_NUMBER = process.env.TWILIO_NUMBER;
const RECCODE_EXP_IN_MINS = 10;

let TWILIO_ENABLED = false;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_NUMBER) {
  TWILIO_ENABLED = true;
}

module.exports = {
  SECRET_KEY,
  BCRYPT_WORK_ROUNDS,
  DB_URI,
  SERVER_PORT,
  USERS_LIST_LIMIT,
  STORIES_LIST_LIMIT,
  JWT_OPTIONS,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_NUMBER,
  TWILIO_ENABLED,
  RECCODE_EXP_IN_MINS
};
