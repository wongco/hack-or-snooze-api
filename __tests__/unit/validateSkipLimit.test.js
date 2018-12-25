/** jest tests for helper function */
process.env.NODE_ENV = 'test';

// import config
const { USERS_LIST_LIMIT } = require('../../config');

// import helper function
const validateSkipLimit = require('../../helpers/validateSkipLimit');

describe('validateSkipLimit helper function', () => {
  it('validates reqDetails successfully when providing normal values', () => {
    const reqDetails = {
      skip: '0',
      limit: '25'
    };
    validateSkipLimit(reqDetails, USERS_LIST_LIMIT);
    expect(reqDetails).toHaveProperty('skip', 0);
    expect(reqDetails).toHaveProperty('limit', 25);
  });

  it('validates successfully when only normal skip value is provided', () => {
    const reqDetails = {
      skip: '3'
    };
    validateSkipLimit(reqDetails, USERS_LIST_LIMIT);
    expect(reqDetails).toHaveProperty('skip', 3);
    expect(reqDetails).toHaveProperty('limit', 25);
  });

  it('validates successfully when only normal limit value is provided', () => {
    const reqDetails = {
      limit: '3'
    };
    validateSkipLimit(reqDetails, USERS_LIST_LIMIT);
    expect(reqDetails).toHaveProperty('skip', 0);
    expect(reqDetails).toHaveProperty('limit', 3);
  });

  it('validates successfully when neither value is provided', () => {
    const reqDetails = {};
    validateSkipLimit(reqDetails, USERS_LIST_LIMIT);
    expect(reqDetails).toHaveProperty('skip', 0);
    expect(reqDetails).toHaveProperty('limit', 25);
  });

  it('validates successfully when limit is blank', () => {
    const reqDetails = {
      skip: '0',
      limit: ''
    };
    validateSkipLimit(reqDetails, USERS_LIST_LIMIT);
    expect(reqDetails).toHaveProperty('skip', 0);
    expect(reqDetails).toHaveProperty('limit', 25);
  });

  it('validates successfully when skip is blank', () => {
    const reqDetails = {
      skip: '',
      limit: '23'
    };
    validateSkipLimit(reqDetails, USERS_LIST_LIMIT);
    expect(reqDetails).toHaveProperty('skip', 0);
    expect(reqDetails).toHaveProperty('limit', 23);
  });

  it('validates successfully when limit is a float', () => {
    const reqDetails = {
      skip: '0',
      limit: '23.4'
    };
    validateSkipLimit(reqDetails, USERS_LIST_LIMIT);
    expect(reqDetails).toHaveProperty('skip', 0);
    expect(reqDetails).toHaveProperty('limit', 23);
  });

  it('validates successfully when skip is a float', () => {
    const reqDetails = {
      skip: '2.5',
      limit: '23'
    };
    validateSkipLimit(reqDetails, USERS_LIST_LIMIT);
    expect(reqDetails).toHaveProperty('skip', 2);
    expect(reqDetails).toHaveProperty('limit', 23);
  });

  it('fails validation when skip is invalid value', () => {
    const reqDetails = {
      skip: 'abc',
      limit: '23'
    };
    try {
      validateSkipLimit(reqDetails, USERS_LIST_LIMIT);
    } catch (error) {
      expect(error).toHaveProperty('message');
    }
  });

  it('fails validation when limit is invalid value', () => {
    const reqDetails = {
      skip: '0',
      limit: 'abc'
    };
    try {
      validateSkipLimit(reqDetails, USERS_LIST_LIMIT);
    } catch (error) {
      expect(error).toHaveProperty('message');
    }
  });

  it('fails validation when skip is out of range', () => {
    const reqDetails = {
      skip: '-1',
      limit: '25'
    };
    try {
      validateSkipLimit(reqDetails, USERS_LIST_LIMIT);
    } catch (error) {
      expect(error).toHaveProperty('message');
    }
  });

  it('fails validation when limit is out of range', () => {
    const reqDetails = {
      skip: '0',
      limit: '100'
    };
    try {
      validateSkipLimit(reqDetails, USERS_LIST_LIMIT);
    } catch (error) {
      expect(error).toHaveProperty('message');
    }
  });
});
