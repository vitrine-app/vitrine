import * as fs from 'fs-extra';
import * as path from 'path';

import { getEnvFolder } from '@models/env';
import { PotentialGame } from '@models/PotentialGame';
import { searchIgdbGame } from './api/ServerWrapper';
import { logger } from './Logger';

export class PotentialGamesCacher {
  private readonly cacheFilePath: string;

  public constructor() {
    this.cacheFilePath = path.resolve(getEnvFolder('config'), 'cache', 'potential_games.json');
  }

  public async cache(potentialGames: PotentialGame[]) {
    logger.info('PotentialGamesCacher', 'Potential games are about to be cached.');
    const potentialGamesCache: any = (await fs.pathExists(this.cacheFilePath))
      ? (await fs.readJson(this.cacheFilePath, { throws: false })) || {}
      : {};

    let addedGamesNb: number = 0;
    const populatedPotentialGames: PotentialGame[] = await Promise.all(
      potentialGames.map(async (potentialGame: PotentialGame) => {
        if (!potentialGamesCache[potentialGame.uuid]) {
          const [{ cover }]: any[] = await searchIgdbGame(potentialGame.name, 1);
          potentialGamesCache[potentialGame.uuid] = {
            cover,
            name: potentialGame.name
          };
          addedGamesNb++;
        }
        return {
          ...potentialGame,
          details: {
            cover: potentialGamesCache[potentialGame.uuid].cover
          }
        };
      })
    );
    if (addedGamesNb) {
      await fs.writeJson(this.cacheFilePath, potentialGamesCache, {
        spaces: 2
      });
    }
    logger.info('PotentialGamesCacher', 'Potential games are about to be cached.');
    return populatedPotentialGames;
  }

  public async invalidCache(potentialGame?: PotentialGame) {
    if (potentialGame) {
      const potentialGamesCache: any = (await fs.readJson(this.cacheFilePath, { throws: false })) || {};
      delete potentialGamesCache[potentialGame.uuid];
      await fs.writeJson(this.cacheFilePath, potentialGamesCache, {
        spaces: 2
      });
    } else {
      await fs.writeJson(this.cacheFilePath, {});
    }
  }
}

export const potentialGamesCacher: PotentialGamesCacher = new PotentialGamesCacher();
