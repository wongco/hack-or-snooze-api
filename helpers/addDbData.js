const db = require('../db');
const User = require('../models/User');
// const Story = require('../models/Story');

// control function to clean up db and add new data
async function setUp() {
  await dropTables();
  await createTables();
  await usersSetup();
  await storiesSetup();
  await favoritesSetup();
}

// drop all existing tables
async function dropTables() {
  await db.query('DROP TABLE IF EXISTS favorites');
  await db.query('DROP TABLE IF EXISTS stories');
  await db.query('DROP TABLE IF EXISTS users');
}

// create tables in db
async function createTables() {
  await db.query(`CREATE TABLE users
  (
    username text PRIMARY KEY,
    name text NOT NULL,
    password text NOT NULL,
    createdAt timestamp DEFAULT current_timestamp NOT NULL,
    updatedAt timestamp DEFAULT current_timestamp NOT NULL
  )`);

  await db.query(`CREATE TABLE stories
  (
    storyId serial PRIMARY KEY,
    title text NOT NULL,
    url text NOT NULL,
    author text NOT NULL,
    username text NOT NULL REFERENCES users ON DELETE CASCADE,
    createdAt timestamp DEFAULT current_timestamp NOT NULL,
    updatedAt timestamp DEFAULT current_timestamp NOT NULL
  )`);

  await db.query(`CREATE TABLE favorites
  (
    username text NOT NULL REFERENCES users ON DELETE CASCADE,
    storyId integer NOT NULL REFERENCES stories ON DELETE CASCADE,
    PRIMARY KEY(username, storyId)
  )`);
}

// setup users on DB
async function usersSetup() {
  await User.addUser({
    username: 'bob',
    name: 'Bobby',
    password: '123456'
  });

  await User.addUser({
    username: 'jim',
    name: 'Jimmy',
    password: '123456'
  });

  await User.addUser({
    username: 'karkar',
    name: 'Karen',
    password: '123456'
  });
}

// setup stories on DB
async function storiesSetup() {}

// setup favorites on DB
async function favoritesSetup() {}

setUp()
  .then(resp => {
    console.log('done adding data.');
    process.exit(0);
  })
  .catch(error => {
    console.log('There was an error.');
    process.exit(1);
  });
