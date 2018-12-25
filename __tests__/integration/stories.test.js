/** Integration tests for stories routes */
process.env.NODE_ENV = 'test';

const request = require('supertest');
const Story = require('../../models/Story');
const User = require('../../models/User');

// app imports
const app = require('../../app');
const db = require('../../db');

beforeEach(async () => {
  // delete any data created by prior tests
  await db.query('DELETE FROM users');

  await User.addUser({
    username: 'bob',
    name: 'Bobby',
    password: '123456'
  });

  await User.addUser({
    username: 'jas',
    name: 'Jason',
    password: '123456'
  });

  await Story.addStory({
    title: 'How to eat cookies.',
    url: 'http://www.goodcookies.com',
    author: 'Bobby',
    username: 'bob'
  });

  await Story.addStory({
    title: 'Badminton? What is that?',
    url: 'http://www.goodsports.com',
    author: 'Jason',
    username: 'jas'
  });

  await Story.addStory({
    title: 'How to eat fruit.',
    url: 'http://www.goodfruit.com',
    author: 'Jason',
    username: 'jas'
  });

  await Story.addStory({
    title: 'Balling? What is that?',
    url: 'http://www.greatscott.com',
    author: 'Jason',
    username: 'jas'
  });
});

describe('GET /stories', async () => {
  it('Get all stories succeeded with valid query string params', async () => {
    const response = await request(app)
      .get('/stories')
      .query({ skip: 1, limit: 25 });

    const { stories } = response.body;
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(stories)).toBe(true);
    expect(stories).toHaveLength(3);
  });

  it('Get all stories succeeded with no query string params', async () => {
    const response = await request(app)
      .get('/stories')
      .query({});

    const { stories } = response.body;
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(stories)).toBe(true);
    expect(stories).toHaveLength(4);
  });

  it('Failed to get stories due to invalid query string params', async () => {
    const response = await request(app)
      .get('/stories')
      .query({ skip: 1, limit: 'abc' });

    const { error } = response.body;
    expect(error.status).toBe(400);
    expect(error).toHaveProperty('title', 'Bad Request');
  });
});

afterAll(async function() {
  // close db connection
  await db.end();
});
