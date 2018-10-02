import * as glob from 'glob';
import * as path from 'path';
import * as Registry from 'winreg';

import { GamesCollection } from '../../models/GamesCollection';
import { PlayableGame } from '../../models/PlayableGame';
import { GameSource, PotentialGame } from '../../models/PotentialGame';
import { spatStr } from '../helpers';
import { logger } from '../Logger';
import { PotentialGamesCrawler } from './PotentialGamesCrawler';

class OriginCrawler extends PotentialGamesCrawler {
  private regDetails: any[];
  private gamesFolder: string;

  public setPlayableGames(playableGames?: PlayableGame[]): this {
    super.setPlayableGames(playableGames);
    this.regDetails = [];
    return this;
  }

  public search(moduleConfig: any, callback: (error: Error, potentialGames: GamesCollection<PotentialGame>) => void) {
    super.search(moduleConfig, callback);

    this.gamesFolder = path.resolve(this.moduleConfig.installFolder);
    const regKey = new Registry({
      hive: Registry[this.moduleConfig.regHive],
      key: this.moduleConfig.regKey
    });
    logger.info('OriginCrawler', `Parsing registry key ${this.moduleConfig.regKey}.`);
    regKey.keys(this.parseRegistry.bind(this));
  }

  private async parseRegistry(error: Error, items: Winreg.Registry[]) {
    if (error)
      this.callback(error, null);

    await items.forEachEnd((key: Winreg.Registry, done: () => void) => {
      key.values((error: Error, values: Winreg.RegistryItem[]) => {
        if (error)
          this.callback(error, null);

        logger.info('OriginCrawler', `Installed game found in registry (${values[5].value}).`);
        this.regDetails.push({
          path: values[1].value,
          exe: values[5].value
        });
        done();
      });
    });
    logger.info('OriginCrawler', `Looking for games folders in (${this.gamesFolder}).`);
    glob(`${this.gamesFolder}/*`, this.parseFolder.bind(this));
  }

  private async parseFolder(error: Error, files: string[]) {
    if (error)
      this.callback(error, null);
    if (!files.length) {
      logger.info('OriginCrawler', 'Not Origin games found in this directory.');
      const potentialGames: GamesCollection<PotentialGame> = new GamesCollection();
      this.callback(null, potentialGames);
      return;
    }
    const gameInfos: any[] = files.map((gameFolder: string) => ({
      gameName: gameFolder.split('/').pop(),
      gameFolder
    })).filter(({ gameName }: any) => {
      const found: boolean = this.playableGames.filter((playableGame: any) =>
        spatStr(gameName) === spatStr(playableGame.name)
      ).length > 0;
      if (found)
        logger.info('OriginCrawler', `Origin game ${gameName} is already a playable game.`);
      return !found;
    });

    await gameInfos.forEachEnd(async ({ gameName, gameFolder }: any, done: () => void) => {
      try {
        const gamePath: string = await this.getRegGamePath(gameFolder);
        const potentialGame: PotentialGame = new PotentialGame(gameName);
        potentialGame.source = GameSource.ORIGIN;
        potentialGame.commandLine = [ path.resolve(gamePath) ];
        this.potentialGames.push(potentialGame);
        logger.info('OriginCrawler', `Adding ${gameName} to potential Origin games.`);
        done();
      }
      catch (error) {
        this.callback(error, null);
      }
    });
    this.sendResults();
  }

  private async getRegGamePath(gamePath: string) {
    let regGamePath: string;
    await this.regDetails.forEachEnd((regDetail: any, done: () => void) => {
      if (path.resolve(gamePath) === path.resolve(regDetail.path)) {
        logger.info('OriginCrawler', `Origin game found (${gamePath}).`);
        regGamePath = regDetail.exe;
      }
      done();
    });
    if (regGamePath)
      return regGamePath;
    throw new Error('Registry not matching.');
  }
}

const originCrawler: OriginCrawler = new OriginCrawler();

export function searchOriginGames(originConfig: any, playableGames?: PlayableGame[]): Promise<any> {
  return new Promise((resolve, reject) => {
    originCrawler.setPlayableGames(playableGames)
      .search(originConfig, (error: Error, potentialGames: GamesCollection<PotentialGame>) => {
        if (error)
          reject(error);
        else
          resolve(potentialGames);
      });
  });
}
