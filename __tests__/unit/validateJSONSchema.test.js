/** jest tests for helper function */
process.env.NODE_ENV = 'test';

// import helper function
const validateJSONSchema = require('../../helpers/validateJSONSchema');

// sample schema validator template
const loginPostSchema = require('../../schemas/loginPostSchema.json');

describe('validateJSONSchema helper function', async () => {
  it('validates schema successfully', async () => {
    const result = validateJSONSchema(
      { user: { username: 'bob', password: '123456' } },
      loginPostSchema
    );

    expect(result).toBe(true);
  });

  it('validates fails because of missing input (password)', async () => {
    try {
      validateJSONSchema({ user: { username: 'bob' } }, loginPostSchema);
    } catch (error) {
      expect(error).toHaveProperty(
        'message',
        "instance.user requires property 'password'"
      );
    }
  });

  it('validates fails because of invalid parameter (cookies)', async () => {
    try {
      validateJSONSchema(
        { user: { username: 'bob', password: '123456' }, cookie: 'chocolate' },
        loginPostSchema
      );
    } catch (error) {
      expect(error).toHaveProperty(
        'message',
        "instance additionalProperty 'cookie' exists in instance when not allowed"
      );
    }
  });
});
