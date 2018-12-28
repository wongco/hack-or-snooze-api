/** jest tests for Stories class */
process.env.NODE_ENV = 'test';

const db = require('../../db');
const User = require('../../models/User');
const Story = require('../../models/Story');

beforeEach(async () => {
  // delete any data created by test in case of crash
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

describe('getStoryDbInfo method', async () => {
  it('getting info for a specific story succeeded', async () => {
    const stories = await Story.getStories({});
    const storyId = stories[stories.length - 1].storyId;

    const story = await Story.getStoryDbInfo(storyId);
    expect(story).toHaveProperty('username', 'bob');
    expect(story).toHaveProperty('title', 'How to eat cookies.');
    expect(story).toHaveProperty('storyid', storyId);
  });

  it('failed due to non-existing storyId', async () => {
    try {
      await Story.getStoryDbInfo(-1);
    } catch (error) {
      expect(error).toHaveProperty('title', 'Story Not Found');
    }
  });
});

describe('getStory method', async () => {
  it('getting info for a specific story succeeded', async () => {
    const stories = await Story.getStories({});
    const storyId = stories[stories.length - 1].storyId;

    const story = await Story.getStory(storyId);
    expect(story).toHaveProperty('username', 'bob');
    expect(story).toHaveProperty('title', 'How to eat cookies.');
    expect(story).toHaveProperty('storyId', storyId);
  });

  it('failed due to non-existing storyId', async () => {
    try {
      await Story.getStory(-1);
    } catch (error) {
      expect(error).toHaveProperty('title', 'Story Not Found');
    }
  });
});

describe('patchStory method', async () => {
  it('patching a specific story succeeded', async () => {
    const stories = await Story.getStories({});
    const storyId = stories[stories.length - 1].storyId;

    const story = await Story.getStory(storyId);
    await story.patchStory({
      title: 'How to eat cookies well!.',
      url: 'http://www.goodcookies.com/updated',
      author: 'Bobby-O'
    });

    expect(story).toHaveProperty('username', 'bob');
    expect(story).toHaveProperty('title', 'How to eat cookies well!.');
    expect(story).toHaveProperty('storyId', storyId);
  });

  it('failed due to invalid parameters storyId', async () => {
    try {
      const stories = await Story.getStories({});
      const storyId = stories[0].storyId;

      const story = await Story.getStory(storyId);
      await story.patchStory({
        title: 'How to eat cookies well!.',
        url: 'http://www.goodcookies.com/updated',
        author: 'Bobby-O',
        cookies: 'chocolate'
      });
    } catch (error) {
      expect(error).toHaveProperty(
        'message',
        'column "cookies" of relation "stories" does not exist'
      );
    }
  });
});

describe('deleteStory method', async () => {
  it('deleting a specific story succeeded', async () => {
    const stories = await Story.getStories({});
    const storyId = stories[stories.length - 1].storyId;

    const story = await Story.getStory(storyId);

    await story.deleteStory();

    expect(story).toHaveProperty('username', 'bob');
    expect(story).toHaveProperty('title', 'How to eat cookies.');
    expect(story).toHaveProperty('storyId', storyId);

    // check that story no long exists
    try {
      await Story.getStory(storyId);
    } catch (error) {
      expect(error).toHaveProperty('title', 'Story Not Found');
    }
  });
});

afterAll(async function() {
  // close db connection
  await db.end();
});
