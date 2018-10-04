import * as SteamWeb from 'steam-web-promise';

import { steamKey } from '../../modules/keysProvider';
import { logger } from '../Logger';

export async function getSteamGamePlayTime(steamUserId: string, steamId: number) {
  const client: SteamWeb = new SteamWeb({
    apiKey: steamKey(),
    format: 'json'
  });
  logger.info('SteamPlayTimeWrapper', `Looking for played time for Steam game ${steamId}.`);
  try {
    const { response: { games } }: any = await client.getOwnedGames({ steamid: steamUserId });
    const timedGame: any[] = games.filter((game: any) => game.appid === steamId);
    if (!timedGame.length)
      throw new Error('Your Steam games files are corrupted. Please reinstall your game');
    return timedGame[0].playtime_forever * 60;
  }
  catch (error) {
    throw new Error(error);
  }
}
