import * as fs from 'fs-extra';
import * as path from 'path';

import { getEnvFolder } from '../../models/env';
import { GamesCollection } from '../../models/GamesCollection';
import { PlayableGame } from '../../models/PlayableGame';
import { GameSource } from '../../models/PotentialGame';
import { getSteamGamePlayTime } from '../api/SteamPlayTimeWrapper';
import { logger } from '../Logger';

export async function getPlayableGames(steamConfig?: any) {
  const steamUserId: string | undefined = steamConfig && steamConfig.userId ? steamConfig.userId : undefined;
  const gamesDirectory: string = getEnvFolder('games');
  const configFileName: string = 'config.json';
  const files: string[] = await fs.readdir(gamesDirectory);

  if (!files.length)
    return new GamesCollection<PlayableGame>();
  const playableGames: PlayableGame[] = await Promise.all(files.map(async (gameUuid: string) => {
    const configFilePath: any = path.resolve(gamesDirectory, gameUuid, configFileName);
    if (!await fs.pathExists(configFilePath))
      return null;
    const rawGame = await fs.readJson(configFilePath);
    const playableGame: PlayableGame = new PlayableGame(rawGame.name, rawGame.details);
    playableGame.uuid = rawGame.uuid;
    playableGame.commandLine = rawGame.commandLine;
    playableGame.source = rawGame.source;
    if (playableGame.source === GameSource.STEAM && steamUserId)
      playableGame.timePlayed = getSteamGamePlayTime(playableGame.details.steamId);
    else
      playableGame.timePlayed = parseInt(rawGame.timePlayed);
    logger.info('PlayableGamesCrawler', `Playable game ${playableGame.name} (${playableGame.uuid}) found.`);
    return playableGame;
  }));
  return new GamesCollection(playableGames.filter((playableGame: PlayableGame) => playableGame));
}
