/** Integration tests for users routes */
process.env.NODE_ENV = 'test';

const request = require('supertest');
const User = require('../../models/User');
const Story = require('../../models/Story');

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

  const stories = await Story.getStories({});
  const storyId = stories[0].storyId;

  await User.addFavorite('jas', storyId);
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

describe('PATCH /users/:username', async () => {
  it('Updating specific user succeeded', async () => {
    const response = await request(app)
      .patch('/users/bob')
      .send({
        user: {
          name: 'bobbobman',
          password: 'abcdef'
        }
      });

    const { user } = response.body;
    expect(response.statusCode).toBe(200);
    expect(user).toHaveProperty('username', 'bob');
    expect(user).toHaveProperty('name', 'bobbobman');
    expect(user).toHaveProperty('favorites');
  });

  it('Updating partial user details succeeded', async () => {
    const response = await request(app)
      .patch('/users/bob')
      .send({
        user: {
          name: 'bobbobman'
        }
      });

    const { user } = response.body;
    expect(response.statusCode).toBe(200);
    expect(user).toHaveProperty('username', 'bob');
    expect(user).toHaveProperty('name', 'bobbobman');
    expect(user).toHaveProperty('favorites');
  });

  it('Failed to update non-existing user', async () => {
    const response = await request(app)
      .patch('/users/krish')
      .send({
        user: {
          name: 'bobbobman'
        }
      });

    const { error } = response.body;
    expect(error.status).toBe(404);
    expect(error).toHaveProperty('title', 'User Not Found');
  });

  it('Failed to update due to bad parameter', async () => {
    const response = await request(app)
      .patch('/users/bob')
      .send({
        user: {
          name: 'bobbobman',
          cookie: 'delicious'
        }
      });

    const { error } = response.body;
    expect(error.status).toBe(400);
    expect(error).toHaveProperty('title', 'Bad Request');
  });
});

describe('DELETE /users/:username', async () => {
  it('Deleting specific user succeeded', async () => {
    const response = await request(app).delete('/users/bob');

    const { user } = response.body;
    expect(response.statusCode).toBe(200);
    expect(user).toHaveProperty('username', 'bob');
    expect(response.body).toHaveProperty(
      'message',
      "User 'bob' successfully deleted."
    );

    // confirm users is deleted
    const response2 = await request(app).get('/users/bob');
    const { error } = response2.body;
    expect(error.status).toBe(404);
    expect(error).toHaveProperty('title', 'User Not Found');
  });

  it('Failed to delete non-existent user', async () => {
    const response = await request(app).delete('/users/jackrabbit');

    const { error } = response.body;
    expect(error.status).toBe(404);
    expect(error).toHaveProperty('title', 'User Not Found');
  });
});

describe('POST /users/:username/favorites/:storyId', async () => {
  it('Adding story to user favorites succeeded', async () => {
    const stories = await Story.getStories({});
    const storyId = stories[1].storyId;

    const response = await request(app).post(`/users/jas/favorites/${storyId}`);
    const { user } = response.body;
    expect(response.statusCode).toBe(200);
    expect(user).toHaveProperty('username', 'jas');
    expect(user).toHaveProperty('favorites');
    expect(user.favorites).toHaveLength(2);
  });

  it('Failed to add non-existent story', async () => {
    const response = await request(app).post(`/users/jas/favorites/100000`);
    const { error } = response.body;
    expect(error.status).toBe(404);
    expect(error).toHaveProperty('title', 'Story Not Found');
  });

  it('Re-Adding existing favorite has no ill effect', async () => {
    const stories = await Story.getStories({});
    const storyId = stories[0].storyId;

    const response = await request(app).post(`/users/jas/favorites/${storyId}`);
    const { user } = response.body;
    expect(response.statusCode).toBe(200);
    expect(user).toHaveProperty('username', 'jas');
    expect(user).toHaveProperty('favorites');
    expect(user.favorites).toHaveLength(1);
  });
});

describe('DELETE /users/:username/favorites/:storyId', async () => {
  it('Deleting story from user favorites succeeded', async () => {
    const stories = await User.getUserFavorites('jas');
    const storyId = stories[0].storyId;

    const response = await request(app).delete(
      `/users/jas/favorites/${storyId}`
    );
    const { user } = response.body;
    expect(response.statusCode).toBe(200);
    expect(user).toHaveProperty('username', 'jas');
    expect(user).toHaveProperty('favorites');
    expect(user.favorites).toHaveLength(0);
  });

  it('Failed to remove non-existent story', async () => {
    const response = await request(app).delete(`/users/jas/favorites/100000`);
    const { error } = response.body;
    expect(error.status).toBe(404);
    expect(error).toHaveProperty('title', 'Story Not Found');
  });

  it('Removing story not in favorites has no ill effect', async () => {
    const stories = await Story.getStories({});
    const storyId = stories[3].storyId;

    const response = await request(app).delete(
      `/users/jas/favorites/${storyId}`
    );
    const { user } = response.body;
    expect(response.statusCode).toBe(200);
    expect(user).toHaveProperty('username', 'jas');
    expect(user).toHaveProperty('favorites');
    expect(user.favorites).toHaveLength(1);
  });
});

afterAll(async function() {
  // close db connection
  await db.end();
});
