import { promise as glob } from 'glob-promise';
import * as path from 'path';
import * as Registry from 'winreg';

import { GamesCollection } from '../../models/GamesCollection';
import { PlayableGame } from '../../models/PlayableGame';
import { GameSource, PotentialGame } from '../../models/PotentialGame';
import { spatStr } from '../helpers';
import { logger } from '../Logger';
import { PotentialGamesCrawler } from './PotentialGamesCrawler';

function getRegistryKeys(regKey: any): Promise<Winreg.Registry[]> {
  return new Promise((resolve, reject) => {
    regKey.keys((error: Error, items: Winreg.Registry[]) => {
      if (error)
        reject(error);
      else
        resolve(items);
    });
  });
}

function getKeyValue(key: Winreg.Registry): Promise<Winreg.RegistryItem[]> {
  return new Promise((resolve, reject) => {
    key.values((error: Error, values: Winreg.RegistryItem[]) => {
      if (error)
        reject(error);
      else
        resolve(values);
    });
  });
}

class OriginCrawler extends PotentialGamesCrawler {
  private regDetails: any[];
  private gamesFolder: string;

  public setPlayableGames(playableGames?: PlayableGame[]): this {
    super.setPlayableGames(playableGames);
    this.regDetails = [];
    return this;
  }

  public async search(moduleConfig: any) {
    super.search(moduleConfig);

    this.gamesFolder = path.resolve(this.moduleConfig.installFolder);
    const regKey = new Registry({
      hive: Registry[this.moduleConfig.regHive],
      key: this.moduleConfig.regKey
    });
    logger.info('OriginCrawler', `Parsing registry key ${this.moduleConfig.regKey}.`);
    const items: Winreg.Registry[] = await getRegistryKeys(regKey);
    this.regDetails = await Promise.all(items.map(async (key: Winreg.Registry) => {
      const values: Winreg.RegistryItem[] = await getKeyValue(key);
      logger.info('OriginCrawler', `Installed game found in registry (${values[5].value}).`);
      return {
        path: values[1].value,
        exe: values[5].value
      };
    }));

    const files: string[] = await glob(`${this.gamesFolder}/*`);
    if (!files.length) {
      logger.info('OriginCrawler', 'Not Origin games found in this directory.');
      return new GamesCollection<PotentialGame>();
    }
    return new GamesCollection(await this.parseFolders(files));
  }

  private async parseFolders(files: string[]) {
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

    return gameInfos.map (({ gameName, gameFolder }: any) => {
      const gamePath: string = this.getRegGamePath(gameFolder);
      const potentialGame: PotentialGame = new PotentialGame(gameName);
      potentialGame.source = GameSource.ORIGIN;
      potentialGame.commandLine = [ path.resolve(gamePath) ];
      logger.info('OriginCrawler', `Adding ${gameName} to potential Origin games.`);
      return potentialGame;
    });
  }

  private getRegGamePath(gamePath: string): string {
    const regGamePath = this.regDetails.filter((regDetail: any) => path.resolve(gamePath) === path.resolve(regDetail.path));
    if (!regGamePath.length)
      throw new Error('Registry not matching.');
    return regGamePath[0].exe;
  }
}

const originCrawler: OriginCrawler = new OriginCrawler();

export async function searchOriginGames(originConfig: any, playableGames?: PlayableGame[]) {
  try {
    return await originCrawler.setPlayableGames(playableGames).search(originConfig);
  }
  catch (error) {
    throw error;
  }
}
