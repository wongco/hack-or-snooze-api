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

  await User.addUser({
    username: 'jas',
    name: 'Jason',
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

describe('getAllUsers method', async () => {
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

afterAll(async function() {
  // close db connection
  await db.end();
});
