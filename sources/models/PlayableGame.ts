import * as fs from 'fs-extra';
import * as path from 'path';

import { getEnvFolder } from './env';
import { PotentialGame } from './PotentialGame';

export enum SortParameter {
  NAME = 'name',
  TIME_PLAYED = 'timePlayed',
  RELEASE_DATE = 'releaseDate',
  RATING = 'rating',
  SERIES = 'series',
  DEVELOPER = 'developer',
  PUBLISHER = 'publisher',
}

export class PlayableGame extends PotentialGame {
  public timePlayed: number;

  public constructor(name: string, details?: any) {
    super(name, details);
    this.timePlayed = 0;
  }

  public async addPlayTime(timePlayed: number) {
    this.timePlayed += timePlayed;
    const configFilePath: string = path.resolve(getEnvFolder('games'), this.uuid, 'config.json');
    await fs.writeFile(configFilePath, JSON.stringify(this, null, 2));
  }
}
