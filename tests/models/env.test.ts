import { expect } from 'chai';

import { uuidV5 } from '../../assets/models/env';

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
