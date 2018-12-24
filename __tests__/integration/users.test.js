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

  // it('Add a user failed due to existing username', async () => {
  //   const response = await request(app)
  //     .post('/signup')
  //     .send({ user: { name: 'Bobby', username: 'bob', password: '123456' } });

  //   const { error } = response.body;
  //   expect(error.status).toBe(409);
  //   expect(error).toHaveProperty(
  //     'message',
  //     `There is already a user with username 'bob'.`
  //   );
  // });

  // it('Add a user failed due to invalid parameters', async () => {
  //   const response = await request(app)
  //     .post('/signup')
  //     .send({ user: { name: 'Bobby', username: 'bob' } });

  //   const { error } = response.body;
  //   expect(error.status).toBe(400);
  //   expect(error).toHaveProperty('title', 'Bad Request');
  // });
});

afterAll(async function() {
  // close db connection
  await db.end();
});
