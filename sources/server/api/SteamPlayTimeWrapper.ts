import { logger } from '../Logger';
import { steamApiClient } from './SteamApiClient';

class SteamPlayTimeWrapper {
  private timedGames: any[];

  public constructor() {
    this.timedGames = [];
  }

  public async getAllGamesPlayTimes(steamUserId: string) {
    try {
      logger.info('SteamPlayTimeWrapper', 'Timed games never queried, asking Steam...');
      this.timedGames = await steamApiClient.getOwnedGames(steamUserId);
    } catch (error) {
      throw new Error('Steam API failed to retrieve playing times for games.');
    }
  }

  public getPlayTime(steamId: number) {
    try {
      const timedGame: any[] = this.timedGames.filter((game: any) => game.appid === steamId);
      if (!timedGame.length) {
        throw new Error('Your Steam games files are corrupted. Please reinstall your game');
      }
      return timedGame[0].playtime_forever * 60;
    } catch (error) {
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
