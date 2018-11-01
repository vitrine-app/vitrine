import * as fs from 'fs-extra';
import * as path from 'path';

import { getEnvFolder } from '../../sources/models/env';
import { PotentialGame } from '../../sources/models/PotentialGame';
import { PotentialGamesCacher } from '../../sources/server/PotentialGamesCacher';

function testPotentialGamesCacher(prod?: boolean) {
  return () => {
    let potentialGamesCacher: PotentialGamesCacher;
    let cacheFilePath: string;
    const potentialGame: PotentialGame = new PotentialGame('Cooking Mama');

    before(async () => {
      process.env.NODE_ENV = prod ? 'prod' : 'dev';
      process.env.TEST_PROD = prod ? 'true' : 'false';
      await fs.ensureDir(path.resolve(getEnvFolder('config'), 'cache'));
      potentialGamesCacher = new PotentialGamesCacher();
      cacheFilePath = path.resolve(getEnvFolder('config'), 'cache', 'potential_games.json');
    });

    function cacheGame() {
      return async () => {
        const [ cachedGame]: PotentialGame[] = await potentialGamesCacher.cache([ potentialGame ]);
        cachedGame.name.should.equal(potentialGame.name);
        cachedGame.details.should.have.property('cover');
      };
    }

    it('Cache a game', cacheGame());

    it('Get back a cached game', cacheGame());

    after(async () => {
      await potentialGamesCacher.invalidCache(potentialGame);
    });
  };
}

describe('PotentialGamesCacher', () => {
  describe('Dev env', testPotentialGamesCacher());
  describe('Prod env', testPotentialGamesCacher(true));
});
