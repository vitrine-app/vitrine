import 'mocha';
import { expect } from 'chai';
import * as fs from 'fs';

import { downloadImage, uuidV5 } from '../../assets/ts/server/helpers';

describe('uuidV5 function', () => {
	let uuid: string = uuidV5('dummy');
	it('Should return a 36 characters length string', () => {
		expect(uuid).to.have.length(36);
	});
	it('Should have 5 hyphen-separated parts', () => {
		expect(uuid.split('-')).to.have.length(5);
	});
});

describe('downloadFile function', () => {
	it('Should download a picture', (done: Function) => {
		let url: string = 'http://sindikker.org/web/assets/images/dummy-user.jpg';
		let path: string = './dummy.jpg';
		downloadImage(url, path).then(() => {
			fs.unlinkSync(path);
			done();
		}).catch((error) => {
			expect(error).to.be.eq(null);
		});
	});
});
