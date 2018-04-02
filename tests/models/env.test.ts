import { expect } from 'chai';

import { randomHashedString, uuidV5 } from '../../assets/models/env';
import { logger } from '../../assets/server/Logger';

logger.createLogger(true);

describe('uuidV5 function', () => {
	let uuid: string;
	before(() => {
		uuid = uuidV5('dummy');
	});
	it('Should return a 36 characters length string', () => {
		expect(uuid).to.have.length(36);
	});
	it('Should have 5 hyphen-separated parts', () => {
		expect(uuid.split('-')).to.have.length(5);
	});
});

describe('randomHashedString function', () => {
	let hashedString: string;
	let length: number;
	before(() => {
		length = 12;
		hashedString = randomHashedString(length);
	});
	it('Should return a hashed string of the corresponding length', () => {
		expect(hashedString).to.have.length(length);
	});
});
