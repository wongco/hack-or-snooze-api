/** jest tests for User class */
process.env.NODE_ENV = 'test';

const bcrypt = require('bcrypt');

const checkRecoveryCodeValidity = require('../../helpers/checkRecoveryCodeValidity');

describe('checkRecoveryCodeValidity method', async () => {
  it('successfully validates code', async () => {
    const hashedCode = await bcrypt.hash('123877', 1);

    const isValid = await checkRecoveryCodeValidity('123877', hashedCode);

    expect(isValid).toBe(true);
  });

  it('throws error when code is wrong', async () => {
    const hashedCode = await bcrypt.hash('123877', 1);
    try {
      await checkRecoveryCodeValidity('000000', hashedCode);
    } catch (error) {
      expect(error).toHaveProperty('title', 'Recovery failed');
    }
  });
});
