import * as SteamWeb from 'steam-web-promise';

import { steamKey } from '../../modules/keysProvider';
import { logger } from '../Logger';

class SteamPlayTimeWrapper {
  private client: SteamWeb;
  private timedGames: any[];

  public constructor() {
    this.client = new SteamWeb({
      apiKey: steamKey(),
      format: 'json'
    });
    this.timedGames = [];
  }

  public async getAllGamesPlayTimes(steamUserId: string) {
    try {
      logger.info('SteamPlayTimeWrapper', 'Timed games never queried, asking Steam...');
      const { response: { games } }: any = await this.client.getOwnedGames({ steamid: steamUserId });
      this.timedGames = games;
    }
    catch (error) {
      throw new Error('Steam API failed to retrieve playing times for games.');
    }
  }

  public getPlayTime(steamId: number) {
    try {
      const timedGame: any[] = this.timedGames.filter((game: any) => game.appid === steamId);
      if (!timedGame.length)
        throw new Error('Your Steam games files are corrupted. Please reinstall your game');
      return timedGame[0].playtime_forever * 60;
    }
    catch (error) {
      throw new Error(error);
    }
  }
}

const steamPlayTimeWrapper: SteamPlayTimeWrapper = new SteamPlayTimeWrapper();

export async function getSteamGamesPlayTimes(steamUserId: string) {
  return await steamPlayTimeWrapper.getAllGamesPlayTimes(steamUserId);
}

export function getSteamGamePlayTime(steamId: number) {
  return steamPlayTimeWrapper.getPlayTime(steamId);
}
