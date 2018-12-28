// npm modules
const faker = require('faker');

const db = require('../db');
const User = require('../models/User');

// fake data creation amount
const USER_COUNT = 5;
const TOTAL_STORIES = 25;
const FAVORITES_PER_USER = 3;

// control function to clean up db and add new data
async function setUp() {
  await dropTables();
  await createTables();
  const users = await usersSetup();
  await storiesSetup(users);
  await favoritesSetup(users);
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
  for (let i = 0; i < USER_COUNT; i++) {
    const name = faker.name.firstName();
    const username = faker.internet.userName();
    const password = faker.internet.password(10);

    // faker fails to generate actual USA valid phone numbers
    //const phone = faker.phone.phoneFormats();

    // use this to bcrypt passwords instead of raw sql insert
    await User.addUser({
      username,
      name,
      password
    });
  }

  // get user details with ids
  const users = await User.getUsers({});
  return users;
}

// setup stories on DB
async function storiesSetup(users) {
  const insertStatement =
    'INSERT INTO stories (username, author, title, url) VALUES ';

  let count = 0;
  const usersValues = [];
  const usersStatement = [];

  // iterate over how many stories we want per user
  for (let i = 0; i < TOTAL_STORIES; i++) {
    usersValues.push(faker.company.bs()); //title
    usersValues.push(faker.internet.url()); //url
    const randomUser = users[Math.floor(Math.random() * users.length)];
    usersStatement.push(
      `('${randomUser.username}', '${
        randomUser.name
      }', $${++count}, $${++count})`
    );
  }

  // make jumbo sql statement
  const query = insertStatement + usersStatement.join(', ');
  // make jumbo insert
  await db.query(query, usersValues);
}

// setup favorites on DB
async function favoritesSetup(users) {
  const storiesIds = (await db.query('SELECT storyid FROM stories')).rows;

  const insertStatement = 'INSERT INTO favorites (username, storyid) VALUES ';
  let count = 0;
  const favsValues = [];
  const favsStatement = [];

  const choices = storiesIds.map(storyObj => storyObj.storyid);

  users.forEach(user => {
    for (let i = 0; i < FAVORITES_PER_USER; i++) {
      const randomIdx = Math.floor(Math.random() * choices.length);
      const storyid = choices.splice(randomIdx, 1)[0];
      favsValues.push(storyid);
      favsStatement.push(`('${user.username}', $${++count})`);
    }
  });

  // make jumbo sql statement
  const query = insertStatement + favsStatement.join(', ');
  // make jumbo insert
  await db.query(query, favsValues);
}

setUp()
  .then(resp => {
    console.log('done adding data.');
    process.exit(0);
  })
  .catch(error => {
    console.log('There was an error.');
    console.log(error.message);
    process.exit(1);
  });
