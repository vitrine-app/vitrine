import { promise as glob } from 'glob-promise';
import * as path from 'path';
import * as Registry from 'winreg';

import { GamesCollection } from '@models/GamesCollection';
import { PlayableGame } from '@models/PlayableGame';
import { GameSource, PotentialGame } from '@models/PotentialGame';
import { spatStr } from '../helpers';
import { logger } from '../Logger';

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

class OriginCrawler {
  private playableGames: PlayableGame[];
  private regDetails: any[];
  private gamesFolder: string;
  private originConfig: any;

  public constructor(playableGames?: PlayableGame[]) {
    this.playableGames = playableGames || [];
    this.regDetails = [];
  }

  public async search(originConfig: any) {
    this.originConfig = originConfig;

    this.gamesFolder = path.resolve(this.originConfig.installFolder);
    const regKey = new Registry({
      hive: Registry[this.originConfig.regHive],
      key: this.originConfig.regKey
    });
    logger.info('OriginCrawler', `Parsing registry key ${this.originConfig.regKey}.`);
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

export async function searchOriginGames(originConfig: any, playableGames?: PlayableGame[]) {
  try {
    return await new OriginCrawler(playableGames).search(originConfig);
  }
  catch (error) {
    throw error;
  }
}
