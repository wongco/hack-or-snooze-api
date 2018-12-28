/** jest tests for User class */
process.env.NODE_ENV = 'test';

const formatPhoneNumber = require('../../helpers/formatPhoneNumber');

describe('formatPhoneNumber method', () => {
  it('formatting a regular number USA # succeeded', () => {
    const phone = formatPhoneNumber('415-123-1234');
    expect(phone).toBe('+14151231234');
  });

  it('failed to format number due to wrong digits/format/non-usa', () => {
    try {
      formatPhoneNumber('11-415-1263-12634');
    } catch (error) {
      expect(error).toHaveProperty(
        'message',
        'Please input a valid USA phone number.'
      );
    }
  });
});
