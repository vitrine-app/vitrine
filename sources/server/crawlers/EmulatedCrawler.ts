import { promise as glob } from 'glob-promise';
import * as path from 'path';

import { GamesCollection } from '../../models/GamesCollection';
import { PlayableGame } from '../../models/PlayableGame';
import { GameSource, PotentialGame } from '../../models/PotentialGame';
import { spatStr } from '../helpers';
import { logger } from '../Logger';
import { PotentialGamesCrawler } from './PotentialGamesCrawler';

class EmulatedCrawler extends PotentialGamesCrawler {
  private folderDatas: any[];

  public setPlayableGames(playableGames?: PlayableGame[]): this {
    super.setPlayableGames(playableGames);
    this.folderDatas = [];
    return this;
  }

  public async search(moduleConfig: any) {
    super.search(moduleConfig);
    logger.info('EmulatedCrawler', `Searching roms folders in ${this.moduleConfig.romsFolder}.`);
    const aliveEmulators: any[] = this.moduleConfig.aliveEmulators.map((aliveEmulator: any) => ({
      ...this.moduleConfig.emulators.filter((emulator: any) => emulator.id === aliveEmulator.id)[0],
      ...aliveEmulator
    }));
    try {
      const folders: string[] = await glob(`${this.moduleConfig.romsFolder}/*`);
      this.folderDatas = folders.map((folder: string) => ({
        ...this.moduleConfig.platforms.filter((platform: any) => platform.folder.toUpperCase() === path.basename(folder).toUpperCase())[0],
        folder
      })).filter((platform: any) => platform.id).map((platform: any) => {
        return ({
          emulator: aliveEmulators.filter((aliveEmulator: any) => aliveEmulator.platforms.includes(platform.id))[0],
          folder: platform.folder
        });
      }).filter((folderData: any) => {
        if (!folderData.emulator)
          return false;
        logger.info('EmulatedCrawler', `Roms folder ${folderData.folder} found and binded to ${folderData.emulator.name}.`);
        return true;
      });
      return new GamesCollection(await this.analyzeFolders());
    }
    catch (error) {
      throw error;
    }
  }

  private async analyzeFolders() {
    const potentialGames: any[] = await Promise.all(this.folderDatas.map(async ({ folder: romFolder, emulator: romEmulator }: any) => {
      logger.info('EmulatedCrawler', `Parsing roms in ${romFolder} with ${romEmulator.name} glob (${romEmulator.glob}).`);
      const roms: string[] = await glob(`${romFolder}/${romEmulator.glob}`);
      const romInfos: any[] = roms.map((romPath: string) => {
        const parsedPath: string[] = romPath.split('/');
        const romName: string = parsedPath[parsedPath.length - romEmulator.glob.split('/').length]
          .replace(/(\w+)\.(\w+)/g, '$1');
        return { romName, romPath };
      }).filter(({ romName }: any) => {
        const found: boolean = this.playableGames.filter((playableGame: any) =>
          spatStr(romName) === spatStr(playableGame.name)
        ).length > 0;
        if (found)
          logger.info('EmulatedCrawler', `Emulated game ${romName} is already a playable game.`);
        return !found;
      });
      return romInfos.map(({ romName, romPath }: any) => {
        const potentialGame: PotentialGame = new PotentialGame(romName);
        potentialGame.source = GameSource.EMULATED;
        potentialGame.commandLine = [
          romEmulator.path,
          romEmulator.command.replace('%g', romPath)
        ];
        logger.info('EmulatedCrawler', `Adding ${romName} to potential emulated games.`);
        return potentialGame;
      });
    }));
    return [].concat(...potentialGames);
  }
}

const emulatedGamesCrawler: EmulatedCrawler = new EmulatedCrawler();

export async function searchEmulatedGames(emulatedConfig: any, playableGames?: PlayableGame[]): Promise<any> {
  try {
    return await emulatedGamesCrawler.setPlayableGames(playableGames).search(emulatedConfig);
  }
  catch (error) {
    throw error;
  }
}
