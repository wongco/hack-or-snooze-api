/** Integration tests for stories routes */
process.env.NODE_ENV = 'test';

// npm imports
const jwt = require('jsonwebtoken');
const request = require('supertest');

// class models
const Story = require('../../models/Story');
const User = require('../../models/User');

// app imports
const app = require('../../app');
const db = require('../../db');

// import config info
const { SECRET_KEY } = require('../../config');

let bobToken;
let jasToken;

beforeEach(async () => {
  // delete any data created by prior tests
  await db.query('DELETE FROM recovery');
  await db.query('DELETE FROM favorites');
  await db.query('DELETE FROM stories');
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

  // setup authTokens for convenience
  bobToken = jwt.sign({ username: 'bob' }, SECRET_KEY);
  jasToken = jwt.sign({ username: 'jas' }, SECRET_KEY);
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

describe('POST /stories', async () => {
  it('Adding a story succeeded', async () => {
    const response = await request(app)
      .post('/stories')
      .set({ Authorization: `Bearer ${bobToken}` })
      .send({
        story: {
          title: 'How to cook dinner.',
          url: 'http://www.recipeguide.com',
          author: 'Bobby'
        }
      });

    const { story } = response.body;
    expect(response.statusCode).toBe(200);
    expect(story).toHaveProperty('title', 'How to cook dinner.');
  });

  it('failed to add a story due to missing parameters', async () => {
    const response = await request(app)
      .post('/stories')
      .set({ Authorization: `Bearer ${bobToken}` })
      .send({
        story: {
          title: 'How to cook dinner.',
          url: 'http://www.recipeguide.com',
          username: 'bob'
        }
      });

    const { error } = response.body;
    expect(error.status).toBe(400);
    expect(error).toHaveProperty('title', 'Bad Request');
  });

  it('Failed due to no auth token', async () => {
    const response = await request(app)
      .post('/stories')
      .send({
        story: {
          title: 'How to cook dinner.',
          url: 'http://www.recipeguide.com',
          username: 'bob'
        }
      });

    const { error } = response.body;
    expect(error.status).toBe(401);
    expect(error).toHaveProperty('title', 'Unauthorized');
  });
});

describe('GET /stories/:storyId', async () => {
  it('Get specific story succeeded with valid storyId', async () => {
    const response = await request(app).get('/stories');
    const { stories } = response.body;
    const storyId = stories[0].storyId;

    const response2 = await request(app).get(`/stories/${storyId}`);
    const { story } = response2.body;
    expect(response2.statusCode).toBe(200);
    expect(story).toHaveProperty('storyId', storyId);
    expect(story).toHaveProperty('title');
  });

  it('Failed to get story due to non-existing storyId', async () => {
    const response = await request(app).get(`/stories/100000`);
    const { error } = response.body;
    expect(error.status).toBe(404);
    expect(error).toHaveProperty('title', 'Story Not Found');
  });

  it('Failed to get story due to invalid storyId input', async () => {
    const response = await request(app).get(`/stories/abc`);
    const { error } = response.body;
    expect(error.status).toBe(400);
    expect(error).toHaveProperty('title', 'Invalid StoryId');
  });
});

describe('PATCH /stories/:storyId', async () => {
  it('Updated specific story succeeded with valid storyId and params', async () => {
    const response = await request(app).get('/stories');
    const { stories } = response.body;
    const storyId = stories[stories.length - 1].storyId;

    const response2 = await request(app)
      .patch(`/stories/${storyId}`)
      .send({
        story: {
          title: 'How to eat cookies well!.',
          url: 'http://www.goodcookies.com/updated',
          author: 'Bobby-O'
        }
      })
      .set({ Authorization: `Bearer ${bobToken}` });
    const { story } = response2.body;
    expect(response2.statusCode).toBe(200);
    expect(story).toHaveProperty('storyId', storyId);
    expect(story).toHaveProperty('title', 'How to eat cookies well!.');
  });

  it('Failed to update story due to non-existent storyId', async () => {
    const response = await request(app)
      .patch('/stories/200000')
      .send({
        story: {
          title: 'How to eat cookies well!.',
          url: 'http://www.goodcookies.com/updated',
          author: 'Bobby-O'
        }
      })
      .set({ Authorization: `Bearer ${bobToken}` });
    const { error } = response.body;
    expect(error.status).toBe(404);
    expect(error).toHaveProperty('title', 'Story Not Found');
  });

  it('Failed to update story due to invalid parameters', async () => {
    const response = await request(app).get('/stories');
    const { stories } = response.body;
    const storyId = stories[stories.length - 1].storyId;

    const response2 = await request(app)
      .patch(`/stories/${storyId}`)
      .send({
        story: {
          title: 'How to eat cookies well!.',
          url: 'http://www.goodcookies.com/updated',
          author: 'Bobby-O',
          cookie: 'vanilla'
        }
      })
      .set({ Authorization: `Bearer ${bobToken}` });

    const { error } = response2.body;
    expect(error.status).toBe(400);
    expect(error).toHaveProperty('title', 'Bad Request');
  });

  it('Failed to update story due to not being author', async () => {
    const response = await request(app).get('/stories');
    const { stories } = response.body;
    const storyId = stories[stories.length - 1].storyId;

    const response2 = await request(app)
      .patch(`/stories/${storyId}`)
      .send({
        story: {
          title: 'How to eat cookies well!.',
          url: 'http://www.goodcookies.com/updated',
          author: 'Bobby-O',
          cookie: 'vanilla'
        }
      })
      .set({ Authorization: `Bearer ${jasToken}` });

    const { error } = response2.body;
    expect(error.status).toBe(403);
    expect(error).toHaveProperty('title', 'Forbidden');
  });

  it('Failed due to no auth token', async () => {
    const response = await request(app).get('/stories');
    const { stories } = response.body;
    const storyId = stories[0].storyId;

    const response2 = await request(app)
      .patch(`/stories/${storyId}`)
      .send({
        story: {
          title: 'How to eat cookies well!.',
          url: 'http://www.goodcookies.com/updated',
          author: 'Bobby-O',
          cookie: 'vanilla'
        }
      });

    const { error } = response2.body;
    expect(error.status).toBe(401);
    expect(error).toHaveProperty('title', 'Unauthorized');
  });
});

describe('DELETE /stories/:storyId', async () => {
  it('Deleted specific story successfully', async () => {
    const response = await request(app).get('/stories');
    const { stories } = response.body;
    const storyId = stories[stories.length - 1].storyId;

    const response2 = await request(app)
      .delete(`/stories/${storyId}`)
      .set({ Authorization: `Bearer ${bobToken}` });
    const { story } = response2.body;
    expect(response2.statusCode).toBe(200);
    expect(story).toHaveProperty('storyId', storyId);
    expect(story).toHaveProperty('title', 'How to eat cookies.');

    // check story no longer exists
    const response3 = await request(app).get(`/stories/${storyId}`);
    const { error } = response3.body;
    expect(error.status).toBe(404);
    expect(error).toHaveProperty('title', 'Story Not Found');
  });

  it('Failed to delete non-existent storyId', async () => {
    const response = await request(app)
      .delete('/stories/1000000')
      .set({ Authorization: `Bearer ${bobToken}` });
    const { error } = response.body;
    expect(response.statusCode).toBe(404);
    expect(error).toHaveProperty('title', 'Story Not Found');
  });

  it('Failed to delete due to invalid storyID', async () => {
    const response = await request(app)
      .delete('/stories/abc')
      .set({ Authorization: `Bearer ${bobToken}` });
    const { error } = response.body;
    expect(error.status).toBe(400);
    expect(error).toHaveProperty('title', 'Invalid StoryId');
  });

  it('Failed to delete due to storyId by different author', async () => {
    const response = await request(app).get('/stories');
    const { stories } = response.body;
    const storyId = stories[1].storyId;

    const response2 = await request(app)
      .delete(`/stories/${storyId}`)
      .set({ Authorization: `Bearer ${bobToken}` });
    const { error } = response2.body;
    expect(error.status).toBe(403);
    expect(error).toHaveProperty('title', 'Forbidden');
  });

  it('Failed due to no auth token', async () => {
    const response = await request(app).get('/stories');
    const { stories } = response.body;
    const storyId = stories[0].storyId;

    const response2 = await request(app).delete(`/stories/${storyId}`);
    const { error } = response2.body;
    expect(error.status).toBe(401);
    expect(error).toHaveProperty('title', 'Unauthorized');
  });
});

afterAll(async function() {
  // close db connection
  await db.end();
});
