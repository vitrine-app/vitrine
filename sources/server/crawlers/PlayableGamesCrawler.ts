import * as fs from 'fs-extra';
import * as path from 'path';

import { getEnvFolder } from '../../models/env';
import { GamesCollection } from '../../models/GamesCollection';
import { PlayableGame } from '../../models/PlayableGame';
import { GameSource } from '../../models/PotentialGame';
import { getSteamGamePlayTime } from '../api/SteamPlayTimeWrapper';
import { logger } from '../Logger';

class PlayableGamesCrawler {
  private readonly gamesDirectory: string;
  private readonly configFileName: string;

  public constructor(private steamUserId: string | undefined) {
    this.gamesDirectory = getEnvFolder('games');
    this.configFileName = 'config.json';
  }

  public async search() {
    try {
      const files: string[] = await fs.readdir(this.gamesDirectory);
      if (!files.length) {
        return new GamesCollection<PlayableGame>();
      }
      const playableGames: PlayableGame[] = (await Promise.all(files.map(async (gameUuid: string) => {
        const configFilePath: any = path.resolve(this.gamesDirectory, gameUuid, this.configFileName);
        if (!await fs.pathExists(configFilePath))
          return null;
        const rawGame = await fs.readJson(configFilePath);
        const playableGame: PlayableGame = new PlayableGame(rawGame.name, rawGame.details);
        playableGame.uuid = rawGame.uuid;
        playableGame.commandLine = rawGame.commandLine;
        playableGame.source = rawGame.source;
        if (playableGame.source === GameSource.STEAM)
          playableGame.timePlayed = await getSteamGamePlayTime(this.steamUserId, playableGame.details.steamId);
        else
          playableGame.timePlayed = parseInt(rawGame.timePlayed);
        logger.info('PlayableGamesCrawler', `Playable game ${playableGame.name} (${playableGame.uuid}) found.`);
        return playableGame;
      }))).filter((playableGame: PlayableGame) => playableGame);
      return new GamesCollection(playableGames);
    }
    catch (error) {
      throw error;
    }
  }
}

export async function getPlayableGames(steamConfig?: any) {
  const steamUserId: string = (steamConfig && steamConfig.userId) ? (steamConfig.userId) : (undefined);
  try {
    return await new PlayableGamesCrawler(steamUserId).search();
  }
  catch (error) {
    throw error;
  }
}
