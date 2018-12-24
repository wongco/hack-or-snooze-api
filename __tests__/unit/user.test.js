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

afterAll(async function() {
  // close db connection
  await db.end();
});
