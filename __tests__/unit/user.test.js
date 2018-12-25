/** jest tests for User class */

process.env.NODE_ENV = 'test';

const User = require('../../models/User');
const Story = require('../../models/Story');
const db = require('../../db');

beforeEach(async () => {
  // delete any data created by test in case of crash
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

describe('addUser method', async () => {
  it('adding user succeeded no password returned', async () => {
    const user = await User.addUser({
      username: 'jim',
      name: 'Jimmy',
      password: '123456'
    });

    expect(user).toHaveProperty('username', 'jim');
    expect(user).not.toHaveProperty('password');
  });

  it('adding user failed due to missing parameter', async () => {
    try {
      await User.addUser({
        username: 'bob',
        name: 'Bobby'
      });
    } catch (error) {
      expect(error).toHaveProperty('message');
    }
  });

  it('adding user failed due to existing username', async () => {
    try {
      await User.addUser({
        username: 'bob',
        name: 'Bobby',
        password: '123456'
      });
    } catch (error) {
      expect(error).toHaveProperty(
        'message',
        `There is already a user with username 'bob'.`
      );
    }
  });
});

describe('getUserDbInfo method', async () => {
  it('gets a users info from database successfully', async () => {
    const user = await User.getUserDbInfo('bob');

    expect(user).toHaveProperty('username', 'bob');
    expect(user).not.toHaveProperty('password');
  });

  it('failed due to non-existing username', async () => {
    try {
      await User.getUserDbInfo('jim');
    } catch (error) {
      expect(error).toHaveProperty('title', 'User Not Found');
    }
  });
});

describe('getUser method', async () => {
  it('gets a users formatted info successfully', async () => {
    const user = await User.getUser('bob');
    expect(user).toHaveProperty('username', 'bob');
    expect(user).not.toHaveProperty('password');
  });

  it('failed due to non-existing username', async () => {
    try {
      await User.getUser('jim');
    } catch (error) {
      expect(error).toHaveProperty('title', 'User Not Found');
    }
  });
});

describe('getUserOwnStories method', async () => {
  it('getting a users own stories succeeded', async () => {
    const stories = await User.getUserOwnStories('bob');
    expect(stories).toHaveLength(1);
    expect(stories[0]).toHaveProperty('username', 'bob');
  });

  it('getting stories for non exisiting user returns no results', async () => {
    const stories = await User.getUserOwnStories('jimmy');
    expect(stories).toHaveLength(0);
  });
});

describe('checkValidCreds method', async () => {
  it('successfully verifies user credentials', async () => {
    const isValid = await User.checkValidCreds('bob', '123456');
    expect(isValid).toBe(true);
  });

  it('fails due to incorrect username', async () => {
    try {
      await User.checkValidCreds('jim', '123456');
    } catch (error) {
      expect(error).toHaveProperty('title', 'User Not Found');
    }
  });

  it('fails due to incorrect password', async () => {
    try {
      await User.checkValidCreds('bob', 'abcdef');
    } catch (error) {
      expect(error).toHaveProperty('message', 'Invalid Password.');
    }
  });
});

describe('getUsers method', async () => {
  it('successfully gets all users with params specified', async () => {
    const users = await User.getUsers({
      skip: '1',
      limit: '25'
    });

    expect(users).toHaveLength(1);
  });

  it('successfully gets all users with no query string params', async () => {
    const users = await User.getUsers({});
    expect(users).toHaveLength(2);
  });

  it('fails due to invalid query string parameters', async () => {
    try {
      await User.getUsers({
        skip: '0',
        limit: '100'
      });
    } catch (error) {
      expect(error).toHaveProperty('message');
    }
  });
});

describe('patchUser method', async () => {
  it('successfully updates user information', async () => {
    const user = await User.patchUser('bob', {
      name: 'bobby',
      password: 'abcdef'
    });

    expect(user).toHaveProperty('username', 'bob');
    expect(user).toHaveProperty('name', 'bobby');
    expect(user).not.toHaveProperty('password');
  });

  it('successfully update partial user information', async () => {
    const user = await User.patchUser('bob', {
      name: 'bobby'
    });

    expect(user).toHaveProperty('username', 'bob');
    expect(user).toHaveProperty('name', 'bobby');
    expect(user).not.toHaveProperty('password');
  });

  it('fail to update details for non-existent user', async () => {
    try {
      await User.patchUser('jeremy', {
        name: 'bobby',
        password: 'abcdef'
      });
    } catch (error) {
      expect(error).toHaveProperty('title', 'User Not Found');
    }
  });
});

describe('deleteUser method', async () => {
  it('successfully deleted user', async () => {
    const user = await User.deleteUser('bob');

    expect(user).toHaveProperty('username', 'bob');
    expect(user).toHaveProperty('name', 'Bobby');

    try {
      await User.getUser('bob');
    } catch (error) {
      expect(error).toHaveProperty('title', 'User Not Found');
    }
  });

  it('failed to delete non-existent user', async () => {
    try {
      await User.deleteUser('jack');
    } catch (error) {
      expect(error).toHaveProperty('title', 'User Not Found');
    }
  });
});

describe('getUserFavorites method', async () => {
  it('successfully retrieved user favorites', async () => {
    // get first storyID
    const stories = await Story.getStories({});
    const storyId = stories[0].storyId;

    // add storyID to favorites
    await User.addFavorite('bob', storyId);

    const userFavorites = await User.getUserFavorites('bob');
    expect(userFavorites).toHaveLength(1);
  });

  it('no results for non-existent user', async () => {
    const stories = await User.getUserFavorites('kevino');
    expect(stories).toHaveLength(0);
  });
});

describe('addFavorite method', async () => {
  it('successfully added story to user favorites', async () => {
    const stories = await Story.getStories({});
    const storyId = stories[0].storyId;

    const user = await User.addFavorite('bob', storyId);

    expect(user).toHaveProperty('favorites');
    expect(user.favorites).toHaveLength(1);
  });

  it('failed to add story with invalid storyId', async () => {
    try {
      await User.addFavorite('bob', 10000);
    } catch (error) {
      expect(error).toHaveProperty(
        'message',
        "No story with ID '10000' found."
      );
    }
  });

  it('failed to add story with invalid userId', async () => {
    try {
      const stories = await Story.getStories({});
      const storyId = stories[0].storyId;
      await User.addFavorite('jeremiah', storyId);
    } catch (error) {
      expect(error).toHaveProperty(
        'message',
        'insert or update on table "favorites" violates foreign key constraint "favorites_username_fkey"'
      );
    }
  });
});

afterAll(async function() {
  // close db connection
  await db.end();
});
