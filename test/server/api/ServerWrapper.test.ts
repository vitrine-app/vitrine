import { getGameById, searchGame } from '../../../sources/server/api/igdbWrapper';

describe('ServerWrapper searcher', () => {
  let gamesArray: any[];

  before(async () => {
    gamesArray = await searchGame('Super Mario Galaxy', 2);
  });

  it('Return a 2 games length array', () => {
    gamesArray.should.be.a('array');
    gamesArray.should.have.length(2);
  });

  it('Return a games array with name and cover', () => {
    gamesArray[0].should.be.a('object');
    gamesArray[0].should.have.property('id');
    gamesArray[0].should.have.property('name');
    gamesArray[0].should.have.property('cover');
  });
});

describe('ServerWrapper filler', () => {
  it('Return a game object', async () => {
    const game = await getGameById(340);
    game.should.be.a('object');
    game.should.have.property('name');
    game.should.have.property('summary');
    game.should.have.property('genres');
    game.should.have.property('screenshots');
    game.should.have.property('cover');
    game.should.have.property('rating');
    game.should.have.property('releaseDate');
    game.should.have.property('developer');
    game.should.have.property('publisher');
    game.should.have.property('series');
    game.genres.should.be.a('array');
    game.screenshots.should.be.a('array');
  });
});
