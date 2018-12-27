const db = require('../db');
const User = require('../models/User');
const Story = require('../models/Story');

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
  await db.query('DROP TABLE IF EXISTS recovery');
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
    phone text,
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

  await db.query(`CREATE TABLE recovery 
  (
    username text PRIMARY KEY REFERENCES users ON DELETE CASCADE,
    code text NOT NULL,
    createdat timestamp DEFAULT current_timestamp NOT NULL
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
async function storiesSetup() {
  await Story.addStory({
    title: 'How to eat cookies.',
    url: 'http://www.goodcookies.com',
    author: 'Bobby',
    username: 'bob'
  });

  await Story.addStory({
    title: 'Badminton? What is that?',
    url: 'http://www.goodsports.com',
    author: 'Jimmy',
    username: 'jim'
  });

  await Story.addStory({
    title: 'Why Do i try?',
    url: 'http://www.inspiration.com',
    author: 'Karen',
    username: 'karkar'
  });

  await Story.addStory({
    title: 'Where did the dogs go?',
    url: 'http://www.urbancuriosity.com',
    author: 'Bobby',
    username: 'bob'
  });
}

// setup favorites on DB
async function favoritesSetup() {
  await User.addFavorite('bob', 2);
  await User.addFavorite('jim', 1);
  await User.addFavorite('bob', 3);
  await User.addFavorite('karkar', 4);
}

setUp()
  .then(resp => {
    console.log('done adding data.');
    process.exit(0);
  })
  .catch(error => {
    console.log('There was an error.');
    process.exit(1);
  });
