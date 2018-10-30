import { promise as glob } from 'glob-promise';
import * as path from 'path';
import * as SteamWeb from 'steam-web-promise';

import { GamesCollection } from '../../models/GamesCollection';
import { PlayableGame } from '../../models/PlayableGame';
import { GameSource, PotentialGame } from '../../models/PotentialGame';
import { steamKey } from '../../modules/keysProvider';
import { parseAcf } from '../api/AcfParser';
import { logger } from '../Logger';
import { steamAppIdsCacher } from '../SteamAppIdsCacher';
import { PotentialGamesCrawler } from './PotentialGamesCrawler';

class SteamCrawler extends PotentialGamesCrawler {
  private client: SteamWeb;
  private manifestRegEx: string;
  private apiEndPoint: string;
  private steamBinary: string;

  public setPlayableGames(playableGames?: PlayableGame[]): this {
    super.setPlayableGames(playableGames);
    this.client = new SteamWeb({
      apiKey: steamKey(),
      format: 'json'
    });
    this.manifestRegEx = 'appmanifest_*.acf';
    this.apiEndPoint = 'https://store.steampowered.com/api/appdetails/';
    this.steamBinary = process.platform === 'win32' ? 'steam.exe' : 'steam.sh';
    return this;
  }

  public async search(moduleConfig: any) {
    super.search(moduleConfig);

    const games: any[] = await Promise.all(this.moduleConfig.gamesFolders.map((folder: string) => this.processGames(folder)));
    const potentialGames: PotentialGame[] = [].concat(...games);
    return new GamesCollection([
      ...potentialGames,
      ...(this.moduleConfig.searchCloud ? await this.searchUninstalledGames(potentialGames) : [])
    ]);
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
      const gameManifests: any[] = (await Promise.all(files.map(async (appManifest: any) => (await parseAcf(appManifest)).appState)))
        .filter((appManifest: any) => {
          const found: boolean = this.playableGames.filter((playableGame: any) =>
            parseInt(appManifest.appid) === playableGame.details.steamId
          ).length > 0;
          if (found)
            logger.info('SteamCrawler', `Steam game ${appManifest.name} is already a playable game.`);
          return !found;
        });
      return gameManifests.map((gameManifest: any) => {
        logger.info('SteamCrawler', `Steam game ${gameManifest.name} (Steam ID ${gameManifest.appid}) found.`);
        const potentialGame: PotentialGame = new PotentialGame(gameManifest.name);
        potentialGame.source = GameSource.STEAM;
        potentialGame.commandLine = [
          path.resolve(this.moduleConfig.installFolder, this.steamBinary),
          this.moduleConfig.launchCommand.replace('%id', gameManifest.appid)
        ];
        potentialGame.details.steamId = parseInt(gameManifest.appid);
        logger.info('SteamCrawler', `Adding ${gameManifest.name} to potential Steam games.`);
        return potentialGame;
      });
    }
    catch (error) {
      logger.info('SteamCrawler', `An error happened in ${gamesFolder}.`);
      throw error;
    }
  }

  private async searchUninstalledGames(potentialGames: PotentialGame[]) {
    try {
      const { response }: any = await this.client.getOwnedGames({ steamid: this.moduleConfig.userId });
      const appIds: number[] = response.games.map(({ appid: appId }: any) => appId);
      const appDatas: any[] = (await steamAppIdsCacher.cache(appIds)).filter((appData: any) => {
        const found: boolean = this.playableGames.filter((playableGame: any) =>
          parseInt(appData.appId) === playableGame.details.steamId
        ).length > 0 || potentialGames.filter((potentialGame: PotentialGame) =>
          parseInt(appData.appId) === potentialGame.details.steamId
        ).length > 0;
        return !found;
      });
      return appDatas.map((appData: any) => {
        const potentialGame: PotentialGame = new PotentialGame(appData.name);
        potentialGame.source = GameSource.STEAM;
        potentialGame.commandLine = [
          path.resolve(this.moduleConfig.installFolder, this.steamBinary),
          this.moduleConfig.launchCommand.replace('%id', appData.appId)
        ];
        potentialGame.details.steamId = parseInt(appData.appId);
        logger.info('SteamCrawler', `Adding ${appData.name} to potential Steam games as non-installed.`);
        return potentialGame;
      });
    }
    catch (error) {
      logger.info('SteamCrawler', 'Request to Steam API failed.');
      throw error;
    }
  }
}

const steamCrawler: SteamCrawler = new SteamCrawler();

export async function searchSteamGames(steamConfig: any, playableGames?: PlayableGame[]) {
  try {
    return await steamCrawler.setPlayableGames(playableGames).search(steamConfig);
  }
  catch (error) {
    throw error;
  }
}
