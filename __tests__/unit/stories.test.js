/** jest tests for Stories class */

process.env.NODE_ENV = 'test';

const db = require('../../db');
const User = require('../../models/User');
const Story = require('../../models/Story');

beforeEach(async () => {
  // delete any data created by test in case of crash
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
});

describe('getUserOwnStories method', async () => {
  it('getting a users own stories succeeded', async () => {
    const stories = await Story.getUserOwnStories('bob');
    expect(stories).toHaveLength(1);
    expect(stories[0]).toHaveProperty('username', 'bob');
  });

  it('getting stories for non exisiting user returns no results', async () => {
    const stories = await Story.getUserOwnStories('jimmy');
    expect(stories).toHaveLength(0);
  });
});

describe('getStories method', async () => {
  it('getting all stories with no parameters succeeded', async () => {
    const stories = await Story.getStories({});
    expect(stories).toHaveLength(4);
  });

  it('getting all stories with both parameters succeeded', async () => {
    const stories = await Story.getStories({ skip: 1, limit: 2 });
    expect(stories).toHaveLength(2);
  });

  it('getting stories with valid skip parameter', async () => {
    const stories = await Story.getStories({ skip: '2' });
    expect(stories).toHaveLength(2);
  });

  it('getting stories with valid limit parameter', async () => {
    const stories = await Story.getStories({ limit: '1' });
    expect(stories).toHaveLength(1);
  });

  it('fail to get stories due to out of bound skip', async () => {
    try {
      await Story.getStories({ skip: '-1' });
    } catch (error) {
      expect(error).toHaveProperty('title', 'Bad Request');
    }
  });

  it('fail to get stories due to invalid skip', async () => {
    try {
      await Story.getStories({ skip: 'abc' });
    } catch (error) {
      expect(error).toHaveProperty('title', 'Bad Request');
    }
  });

  it('fail to get stories due to out of bound limit', async () => {
    try {
      await Story.getStories({ limit: '200' });
    } catch (error) {
      expect(error).toHaveProperty('title', 'Bad Request');
    }
  });

  it('fail to get stories due to invalid limit', async () => {
    try {
      await Story.getStories({ limit: 'cby' });
    } catch (error) {
      expect(error).toHaveProperty('title', 'Bad Request');
    }
  });
});

describe('addStory method', async () => {
  it('adding a story succeeded', async () => {
    const story = await Story.addStory({
      title: 'How to cook chicken.',
      url: 'http://www.goodrecipes.com',
      author: 'Bobby',
      username: 'bob'
    });
    expect(story).toHaveProperty('username', 'bob');
    expect(story).toHaveProperty('title', 'How to cook chicken.');
  });

  it('adding a story failed due to missing params', async () => {
    try {
      await Story.addStory({
        title: 'How to cook chicken.',
        url: 'http://www.goodrecipes.com',
        username: 'bob'
      });
    } catch (error) {
      expect(error).toHaveProperty('message');
    }
  });

  it('adding a story failed due to invalid user', async () => {
    try {
      await Story.addStory({
        title: 'How to cook chicken.',
        url: 'http://www.goodrecipes.com',
        author: 'Bobby',
        username: 'cookiemonster'
      });
    } catch (error) {
      expect(error).toHaveProperty('message');
    }
  });
});

afterAll(async function() {
  // close db connection
  await db.end();
});
