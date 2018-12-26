process.env.NODE_ENV = 'test';

const sqlForPartialUpdate = require('../../helpers/partialUpdate');

describe('partialUpdate()', () => {
  it('should generate a proper partial update query with just 1 field', function() {
    const sqlString = sqlForPartialUpdate(
      'users',
      { firstName: 'Elie', lastName: 'Schoppik' },
      'id',
      100
    );

    // FIXME: write real tests!
    expect(sqlString).toHaveProperty(
      'query',
      'UPDATE users SET firstName=$1, lastName=$2 WHERE id=$3 RETURNING *'
    );
    expect(sqlString).toHaveProperty('values');
    expect(sqlString.values).toEqual(['Elie', 'Schoppik', 100]);
    expect(Array.isArray(sqlString.values)).toBe(true);
  });
});
