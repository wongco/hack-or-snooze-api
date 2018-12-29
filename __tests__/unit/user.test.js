/** jest tests for User class */
process.env.NODE_ENV = 'test';

const User = require('../../models/User');
const Story = require('../../models/Story');
const db = require('../../db');

//import config
const { BCRYPT_WORK_ROUNDS } = require('../../config');

// import npm
const bcrypt = require('bcrypt');

beforeEach(async () => {
  // delete any data created by test in case of crash
  await db.query('DELETE FROM recovery');
  await db.query('DELETE FROM favorites');
  await db.query('DELETE FROM stories');
  await db.query('DELETE FROM users');

  await User.addUser({
    username: 'bob',
    name: 'Bobby',
    password: '123456',
    phone: '1-415-123-1234'
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

  const userJas = await User.getUser('jas');
  await userJas.addFavorite(storyId);
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
    const user = await User.getUser('bob');
    const story = user.stories[0];
    // check author before change
    expect(story).toHaveProperty('author', 'Bobby');

    await user.patchUser({
      name: 'bobbbbbb',
      password: 'abcdef'
    });

    expect(user).toHaveProperty('username', 'bob');
    expect(user).toHaveProperty('name', 'bobbbbbb');
    expect(user).not.toHaveProperty('password');
    // check author after change
    expect(story).toHaveProperty('author', 'bobbbbbb');
  });

  it('successfully update partial user information', async () => {
    const user = await User.getUser('bob');
    const story = user.stories[0];

    // check author before change
    expect(story).toHaveProperty('author', 'Bobby');

    await user.patchUser({
      name: 'jobby'
    });

    expect(user).toHaveProperty('username', 'bob');
    expect(user).toHaveProperty('name', 'jobby');
    expect(user).not.toHaveProperty('password');
    // check author after change
    expect(story).toHaveProperty('author', 'jobby');
  });
});

describe('deleteUser method', async () => {
  it('successfully deleted user', async () => {
    const user = await User.getUser('bob');
    user.deleteUser();

    expect(user).toHaveProperty('username', 'bob');
    expect(user).toHaveProperty('name', 'Bobby');

    try {
      await User.getUser('bob');
    } catch (error) {
      expect(error).toHaveProperty('title', 'User Not Found');
    }
  });
});

describe('getUserOwnStories method', async () => {
  it('getting a users own stories succeeded', async () => {
    const user = await User.getUser('bob');
    const stories = await user.getUserOwnStories();
    expect(stories).toHaveLength(1);
    expect(stories[0]).toHaveProperty('username', 'bob');
  });
});

describe('getUserFavorites method', async () => {
  it('successfully retrieved user favorites', async () => {
    // get first storyID
    const stories = await Story.getStories({});
    const storyId = stories[0].storyId;

    // add storyID to favorites
    const user = await User.getUser('bob');
    await user.addFavorite(storyId);

    expect(user.favorites).toHaveLength(1);
  });
});

describe('addFavorite method', async () => {
  it('successfully added story to user favorites', async () => {
    const stories = await Story.getStories({});
    const storyId = stories[0].storyId;

    const user = await User.getUser('bob');
    await user.addFavorite(storyId);

    expect(user).toHaveProperty('favorites');
    expect(user.favorites).toHaveLength(1);
  });

  it('failed to add story with invalid storyId', async () => {
    try {
      const user = await User.getUser('bob');
      await user.addFavorite(10000);
    } catch (error) {
      expect(error).toHaveProperty(
        'message',
        "No story with ID '10000' found."
      );
    }
  });
});

describe('deleteFavorite method', async () => {
  it('successfully delete story from user favorites', async () => {
    const stories = await Story.getStories({});
    const storyId = stories[0].storyId;

    const user = await User.getUser('jas');
    await user.deleteFavorite(storyId);

    expect(user).toHaveProperty('favorites');
    expect(user.favorites).toHaveLength(0);
  });

  it('failed to delete story with invalid storyId', async () => {
    try {
      const user = await User.getUser('jas');
      await user.deleteFavorite(10000);
    } catch (error) {
      expect(error).toHaveProperty(
        'message',
        "No story with ID '10000' found."
      );
    }
  });
});

describe('canRecoveryBeInitiated method', async () => {
  it('returns true with valid recovery record', async () => {
    const recCode = '654321';
    const hashedRecCode = await bcrypt.hash(recCode, BCRYPT_WORK_ROUNDS);
    await db.query('INSERT INTO recovery (username, code) VALUES ($1, $2)', [
      'bob',
      hashedRecCode
    ]);
    const user = await User.getUser('bob');

    expect(await user.canRecoveryBeInitiated()).toBe(true);
  });

  it('failed to no phone number existing for user', async () => {
    const user = await User.getUser('jas');
    expect(await user.canRecoveryBeInitiated()).toBe(false);
  });
});

describe('createDbRecoveryEntry method', async () => {
  it('obtain phone number and recovery code successfully', async () => {
    const user = await User.getUser('bob');
    const recoveryInfo = await user.createDbRecoveryEntry();
    const { phone, recCode } = recoveryInfo;

    expect(phone).toBe('+14151231234');
    expect(recCode).toHaveLength(6);
  });

  it('successive recovery attempts creates different codes', async () => {
    const user = await User.getUser('bob');

    const recoveryInfo = await user.createDbRecoveryEntry();
    const recCode = recoveryInfo.recCode;

    const recoveryInfo2 = await user.createDbRecoveryEntry();
    const recCode2 = recoveryInfo2.recCode;

    expect(recCode).not.toBe(recCode2);
  });
});

describe('getRecoveryCodeInfo method', async () => {
  it('gets recovery info successfully', async () => {
    const user = await User.getUser('bob');
    await user.createDbRecoveryEntry();
    const result = await user.getRecoveryCodeInfo();
    expect(result).toHaveProperty('username', 'bob');
    expect(result).toHaveProperty('code');
  });
});

describe('checkRecoveryTimeValidity method', async () => {
  it('time is within recovery window', async () => {
    const user = await User.getUser('bob');
    const timeFiveMinutesAgo = new Date() - 1000 * 60 * 5;
    const isTimeValid = await user.checkRecoveryTimeValidity(
      timeFiveMinutesAgo
    );

    expect(isTimeValid).toBe(true);
  });

  it('failed due to time windows not being valid (time > 10 min default)', async () => {
    // create recovery entry
    const user = await User.getUser('bob');
    await user.createDbRecoveryEntry();

    const timeTwelveMinutesAgo = new Date() - 1000 * 60 * 12;
    try {
      await user.checkRecoveryTimeValidity(timeTwelveMinutesAgo);
    } catch (error) {
      expect(error).toHaveProperty('title', 'Recovery failed');
      const result = await db.query(
        'SELECT * FROM recovery WHERE username = $1',
        ['bob']
      );
      // make sure recovery record was deleted
      expect(result.rows).toHaveLength(0);
    }
  });
});

describe('resetPassword method', async () => {
  it('password was reset successfully', async () => {
    // create entry and get recCode
    const user = await User.getUser('bob');
    const result = await user.createDbRecoveryEntry();
    const { recCode } = result;

    // completed successfully
    const completed = await user.resetPassword(recCode, 'fedcba');
    expect(completed).toBe(true);

    // make sure recovery record was deleted
    const result2 = await db.query(
      'SELECT * FROM recovery WHERE username = $1',
      ['bob']
    );
    expect(result2.rows).toHaveLength(0);

    // check new password is valid
    const isValid = await User.checkValidCreds('bob', 'fedcba');
    expect(isValid).toBe(true);
  });

  it('failed to reset password due to bad recovery Code', async () => {
    // create entry and get recCode
    const user = await User.getUser('bob');
    await user.createDbRecoveryEntry();
    try {
      await user.resetPassword('000000', 'fedcba');
    } catch (error) {
      expect(error).toHaveProperty('title', 'Recovery failed');
    }
  });
});

afterAll(async function() {
  // close db connection
  await db.end();
});
