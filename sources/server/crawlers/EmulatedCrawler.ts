import { promise as glob } from 'glob-promise';
import * as path from 'path';

import { GamesCollection } from '@models/GamesCollection';
import { PlayableGame } from '@models/PlayableGame';
import { GameSource, PotentialGame } from '@models/PotentialGame';
import { spatStr } from '../helpers';
import { logger } from '../Logger';

class EmulatedCrawler {
  private playableGames: PlayableGame[];
  private folders: any[];
  private emulatedConfig: any;

  public constructor(playableGames?: PlayableGame[]) {
    this.playableGames = playableGames || [];
    this.folders = [];
  }

  public async search(emulatedConfig: any) {
    this.emulatedConfig = emulatedConfig;
    logger.info('EmulatedCrawler', `Searching roms folders in ${this.emulatedConfig.romsFolder}.`);
    const aliveEmulators: any[] = this.emulatedConfig.aliveEmulators.map((aliveEmulator: any) => ({
      ...this.emulatedConfig.emulators.filter((emulator: any) => emulator.id === aliveEmulator.id)[0],
      ...aliveEmulator
    }));
    const folders: string[] = await glob(`${this.emulatedConfig.romsFolder}/*`);
    this.folders = folders
      .map((folder: string) => ({
        ...this.emulatedConfig.platforms.filter((platform: any) => platform.folder.toUpperCase() === path.basename(folder).toUpperCase())[0],
        folder
      }))
      .filter((platform: any) => platform.id)
      .map((platform: any) => {
        return {
          emulator: aliveEmulators.filter((aliveEmulator: any) => aliveEmulator.platforms.includes(platform.id))[0],
          folder: platform.folder
        };
      })
      .filter((folderData: any) => {
        if (!folderData.emulator) {
          return false;
        }
        logger.info('EmulatedCrawler', `Roms folder ${folderData.folder} found and bound to ${folderData.emulator.name}.`);
        return true;
      });
    return new GamesCollection(await this.analyzeFolders());
  }

  private async analyzeFolders() {
    const potentialGames: any[] = await Promise.all(
      this.folders.map(async ({ folder: romFolder, emulator: romEmulator }: any) => {
        logger.info('EmulatedCrawler', `Parsing roms in ${romFolder} with ${romEmulator.name} glob (${romEmulator.glob}).`);
        const roms: string[] = await glob(`${romFolder}/${romEmulator.glob}`);
        const romInfos: any[] = roms
          .map((romPath: string) => {
            const parsedPath: string[] = romPath.split('/');
            const romName: string = parsedPath[parsedPath.length - romEmulator.glob.split('/').length].replace(/(\w+)\.(\w+)/g, '$1');
            return { romName, romPath };
          })
          .filter(({ romName }: any) => {
            const found: boolean = this.playableGames.filter((playableGame: any) => spatStr(romName) === spatStr(playableGame.name)).length > 0;
            if (found) {
              logger.info('EmulatedCrawler', `Emulated game ${romName} is already a playable game.`);
            }
            return !found;
          });
        return romInfos.map(({ romName, romPath }: any) => {
          const potentialGame: PotentialGame = new PotentialGame(romName);
          potentialGame.source = GameSource.EMULATED;
          potentialGame.commandLine = [romEmulator.path, romEmulator.command.replace('%g', romPath)];
          logger.info('EmulatedCrawler', `Adding ${romName} to potential emulated games.`);
          return potentialGame;
        });
      })
    );
    return [].concat(...potentialGames);
  }
}

export async function searchEmulatedGames(emulatedConfig: any, playableGames?: PlayableGame[]): Promise<any> {
  try {
    return await new EmulatedCrawler(playableGames).search(emulatedConfig);
  } catch (error) {
    throw error;
  }
}
