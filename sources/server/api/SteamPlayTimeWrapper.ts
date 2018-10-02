import * as SteamWeb from 'steam-web';

import { steamKey } from '../../modules/keysProvider';
import { logger } from '../Logger';

class SteamPlayTimeWrapper {
  private client: SteamWeb;

  public constructor() {
    this.client = new SteamWeb({
      apiKey: steamKey(),
      format: 'json'
    });
  }

  public getOwnedGames(steamUserId: string, steamId: number, callback: (error: Error, timePlayed: number) => void) {
    logger.info('SteamPlayTimeWrapper', `Looking for played time for Steam game ${steamId}.`);
    this.client.getOwnedGames({
      steamid: steamUserId,
      callback: (error: string, data: any) => {
        if (error)
          callback(new Error(error), null);
        else
          this.handleGames(steamId, data.response.games, callback);
      }
    });
  }

  private handleGames(steamId: number, timedGames: any[], callback: (error: Error, timePlayed: number) => void) {
    let found: boolean = false;
    timedGames.forEachEnd((timedGame: any, done: () => void) => {
      if (steamId === timedGame.appid) {
        logger.info('SteamPlayTimeWrapper', `Played time for ${steamId} found (${timedGame.playtime_forever} mins).`);
        found = true;
        callback(null, timedGame.playtime_forever * 60);
      }
      done();
    }, () => {
      if (!found)
        callback(new Error('Your Steam games files are corrupted. Please reinstall your game'), null);
    });
  }
}

const steamPlayTimeWrapper: SteamPlayTimeWrapper = new SteamPlayTimeWrapper();

export function getSteamGamePlayTime(steamUserId: string, steamId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    steamPlayTimeWrapper.getOwnedGames(steamUserId, steamId, (error: Error, timePlayed: number) => {
      if (error)
        reject(error);
      else
        resolve(timePlayed);
    });
  });
}
