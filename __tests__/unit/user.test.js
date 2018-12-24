/** jest tests for User class */

process.env.NODE_ENV = 'test';

const User = require('../../models/User');
const db = require('../../db');

beforeEach(async () => {
  // delete any data created by test in case of crash
  await db.query('DELETE FROM users');

  await User.addUser({
    username: 'bob',
    name: 'Bobby',
    password: '123456'
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

afterAll(async function() {
  // close db connection
  await db.end();
});
