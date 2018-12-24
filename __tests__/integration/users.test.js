/** Integration tests for auth routes */
process.env.NODE_ENV = 'test';

const request = require('supertest');
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
});

describe('GET /users', async () => {
  it('Get all users succeeded with valid query string params', async () => {
    const response = await request(app)
      .get('/users')
      .query({ skip: '1', limit: '25' });

    const { users } = response.body;
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(users)).toBe(true);
    expect(users).toHaveLength(1);
  });

  it('Get all users succeeded with no query string params', async () => {
    const response = await request(app).get('/users');

    const { users } = response.body;
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(users)).toBe(true);
    expect(users).toHaveLength(2);
  });

  it('Failed to get all users due to invalid query string params', async () => {
    const response = await request(app)
      .get('/users')
      .query({ skip: '1', limit: 'abc' });

    const { error } = response.body;
    expect(error.status).toBe(400);
    expect(error).toHaveProperty('title', 'Bad Request');
  });
});

describe('GET /users/:username', async () => {
  it('Get specific user succeeded', async () => {
    const response = await request(app).get('/users/bob');

    const { user } = response.body;
    expect(response.statusCode).toBe(200);
    expect(user).toHaveProperty('username', 'bob');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('favorites');
  });

  it('Failed to get non-existent user', async () => {
    const response = await request(app).get('/users/krish');

    const { error } = response.body;
    expect(error.status).toBe(404);
    expect(error).toHaveProperty('title', 'User Not Found');
  });
});

afterAll(async function() {
  // close db connection
  await db.end();
});