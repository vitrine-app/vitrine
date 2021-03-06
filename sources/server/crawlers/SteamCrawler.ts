import { promise as glob } from 'glob-promise';
import * as path from 'path';

import { GamesCollection } from '@models/GamesCollection';
import { PlayableGame } from '@models/PlayableGame';
import { GameSource, PotentialGame } from '@models/PotentialGame';
import { parseAcf } from '../api/AcfParser';
import { steamApiClient } from '../api/SteamApiClient';
import { logger } from '../Logger';
import { steamAppIdsCacher } from '../SteamAppIdsCacher';

class SteamCrawler {
  private readonly manifestRegEx: string;
  private readonly steamBinary: string;
  private playableGames: PlayableGame[];
  private steamConfig: any;

  public constructor(playableGames?: PlayableGame[]) {
    this.playableGames = playableGames || [];
    this.manifestRegEx = 'appmanifest_*.acf';
    this.steamBinary = process.platform === 'win32' ? 'steam.exe' : 'steam.sh';
  }

  public async search(steamConfig: any) {
    this.steamConfig = steamConfig;

    const games: any[] = await Promise.all(this.steamConfig.gamesFolders.map((folder: string) => this.processGames(folder)));
    const potentialGames: PotentialGame[] = [].concat(...games);
    return new GamesCollection([...potentialGames, ...(this.steamConfig.searchCloud ? await this.searchUninstalledGames(potentialGames) : [])]);
  }

  private async processGames(folder: string) {
    const gamesFolder: string = path.resolve(folder, this.manifestRegEx);
    logger.info('SteamCrawler', `Looking for Steam games manifests in ${gamesFolder}.`);
    try {
      const files: string[] = await glob(gamesFolder);
      if (!files.length) {
        logger.info('SteamCrawler', `No Steam games found in this directory.`);
        return [];
      }
      const gameManifests: any[] = (await Promise.all(files.map(async (appManifest: any) => (await parseAcf(appManifest)).appState))).filter(
        (appManifest: any) => {
          const found: boolean =
            this.playableGames.filter((playableGame: any) => parseInt(appManifest.appid) === playableGame.details.steamId).length > 0;
          if (found) {
            logger.info('SteamCrawler', `Steam game ${appManifest.name} is already a playable game.`);
          }
          return !found;
        }
      );
      return gameManifests.map((gameManifest: any) => {
        logger.info('SteamCrawler', `Steam game ${gameManifest.name} (Steam ID ${gameManifest.appid}) found.`);
        const potentialGame: PotentialGame = new PotentialGame(gameManifest.name);
        potentialGame.source = GameSource.STEAM;
        potentialGame.commandLine = [
          path.resolve(this.steamConfig.installFolder, this.steamBinary),
          this.steamConfig.launchCommand.replace('%id', gameManifest.appid)
        ];
        potentialGame.details.steamId = parseInt(gameManifest.appid);
        logger.info('SteamCrawler', `Adding ${gameManifest.name} to potential Steam games.`);
        return potentialGame;
      });
    } catch (error) {
      logger.info('SteamCrawler', `An error happened in ${gamesFolder}.`);
      throw error;
    }
  }

  private async searchUninstalledGames(potentialGames: PotentialGame[]) {
    try {
      const games: any[] = await steamApiClient.getOwnedGames(this.steamConfig.userId);
      const appIds: number[] = games.map(({ appid: appId }: any) => appId);
      const appsData: any[] = (await steamAppIdsCacher.cache(appIds)).filter((appData: any) => {
        const found: boolean =
          this.playableGames.filter((playableGame: any) => parseInt(appData.appId) === playableGame.details.steamId).length > 0 ||
          potentialGames.filter((potentialGame: PotentialGame) => parseInt(appData.appId) === potentialGame.details.steamId).length > 0;
        return !found;
      });
      return appsData.map((appData: any) => {
        const potentialGame: PotentialGame = new PotentialGame(appData.name);
        potentialGame.source = GameSource.STEAM;
        potentialGame.commandLine = [
          path.resolve(this.steamConfig.installFolder, this.steamBinary),
          this.steamConfig.launchCommand.replace('%id', appData.appId)
        ];
        potentialGame.details.steamId = parseInt(appData.appId);
        logger.info('SteamCrawler', `Adding ${appData.name} to potential Steam games as non-installed.`);
        return potentialGame;
      });
    } catch (error) {
      logger.info('SteamCrawler', 'Request to Steam API failed.');
      throw error;
    }
  }
}

export async function searchSteamGames(steamConfig: any, playableGames?: PlayableGame[]) {
  try {
    return await new SteamCrawler(playableGames).search(steamConfig);
  } catch (error) {
    throw error;
  }
}
