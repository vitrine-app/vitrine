import { randomHashedString, uuidV5 } from '../../sources/models/env';

describe('helpers functions', () => {
  describe('uuidV5()', () => {
    let uuid: string;
    before(() => {
      uuid = uuidV5('dummy');
    });
    it('Return a 36 characters length string', () => {
      uuid.should.have.length(36);
    });
    it('Have 5 hyphen-separated parts', () => {
      uuid.split('-').should.have.length(5);
    });
  });

  describe('randomHashedString()', () => {
    let hashedString: string;
    let length: number;
    before(() => {
      length = 12;
      hashedString = randomHashedString(length);
    });
    it('Return a hashed string of the corresponding length', () => {
      hashedString.should.have.length(length);
    });
  });
});
