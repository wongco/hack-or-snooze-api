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

  // const bobResponse = await request(app)
  //   .post('/login')
  //   .send({
  //     username: 'bob',
  //     password: '123456'
  //   });

  // const jeremyResponse = await request(app)
  //   .post('/login')
  //   .send({
  //     username: 'jeremy',
  //     password: '123456'
  //   });

  // bobToken = bobResponse.body.token;
  // jeremyToken = jeremyResponse.body.token;
});

describe('POST /signup', async () => {
  it('Add a user succeeded', async () => {
    const response = await request(app)
      .post('/signup')
      .send({ user: { name: 'Jimmy', username: 'jim', password: '123456' } });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('username', 'jim');
  });

  it('Add a user failed due to existing username', async () => {
    const response = await request(app)
      .post('/signup')
      .send({ user: { name: 'Bobby', username: 'bob', password: '123456' } });

    const { error } = response.body;
    expect(error.status).toBe(409);
    expect(error).toHaveProperty(
      'message',
      `There is already a user with username 'bob'.`
    );
  });

  it('Add a user failed due to invalid parameters', async () => {
    const response = await request(app)
      .post('/signup')
      .send({ user: { name: 'Bobby', username: 'bob' } });

    const { error } = response.body;
    expect(error.status).toBe(400);
    expect(error).toHaveProperty('title', 'Bad Request');
  });
});

afterAll(async function() {
  // close db connection
  await db.end();
});
