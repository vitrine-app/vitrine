import { expect } from 'chai';
import 'foreach-end';

import { fillIgdbGame, searchIgdbGame } from '../../../assets/server/api/IgdbWrapper';
import { logger } from '../../../assets/server/Logger';

logger.createLogger(true);

describe('IgdbWrapper searcher', () => {
	let gamesArray: any;
	before((done: () => void) => {
		searchIgdbGame('Super Mario Galaxy', 2).then((games: any) => {
			gamesArray = games;
			done();
		});
	});
	it('Should return a 2 games length array', () => {
		expect(gamesArray).to.be.a('array');

		expect(gamesArray).to.have.length(2);
	});
	it('Should return a games array with name and cover', () => {
		expect(gamesArray[0]).to.be.a('object');

		expect(gamesArray[0]).to.have.property('id');
		expect(gamesArray[0]).to.have.property('name');
		expect(gamesArray[0]).to.have.property('cover');
	});
});

describe('IgdbWrapper filler', () => {
	it('Should return a game object', (done: () => void) => {
		fillIgdbGame(340, 'en').then((game: any) => {
			expect(game).to.be.a('object');

			expect(game).to.have.property('name');
			expect(game).to.have.property('summary');
			expect(game).to.have.property('genres');
			expect(game).to.have.property('screenshots');
			expect(game).to.have.property('cover');
			expect(game).to.have.property('rating');
			expect(game).to.have.property('releaseDate');
			expect(game).to.have.property('developer');
			expect(game).to.have.property('publisher');
			expect(game).to.have.property('series');

			expect(game.genres).to.be.a('array');
			expect(game.screenshots).to.be.a('array');
			done();
		});
	});
});
