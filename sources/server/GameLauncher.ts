import * as discordRichPresence from 'discord-rich-presence';
import * as path from 'path';

import { PlayableGame } from '../models/PlayableGame';
import { GameSource } from '../models/PotentialGame';
import { GameLauncherOptions, launchGame as nativeLaunchGame } from '../modules/gameLauncher';
import { discordRpcKey } from '../modules/keysProvider';
import { monitorSteamApp } from '../modules/steamMonitor';
import { logger } from './Logger';

class GameLauncher {
  private game: PlayableGame;
  private callback: (error: Error, minutesPlayed: number) => void;
  private discordClient: any;

  public constructor() {
    this.discordClient = discordRichPresence(discordRpcKey());
  }

  public launch(game: PlayableGame, callback: (error: Error, minutesPlayed: number) => void) {
    this.callback = callback;
    this.game = game;

    this.discordClient.updatePresence({
      state: game.name,
      largeImageKey: 'default',
      largeImageText: game.name,
      startTimestamp: Math.round(Date.now() / 1000),
      instance: true,
    });
    if (this.game.source === GameSource.STEAM)
      this.launchSteamGame();
    else
      this.launchStandardGame();
  }

  private launchStandardGame() {
    logger.info('GameLauncher', 'Launching non-Steam game.');

    const [ executable, args ]: string[] = this.game.commandLine;
    const launcherOptions: GameLauncherOptions = {
      program: executable,
      cwd: path.parse(executable).dir
    };
    if (args)
      launcherOptions.args = args;

    logger.info('GameLauncher', `Launching game ${executable} with native module.`);
    nativeLaunchGame(launcherOptions, (error: string, secondsPlayed: number) => {
      if (error)
        this.callback(new Error(error), null);
      else {
        logger.info('GameLauncher', `Game terminated (played during ${secondsPlayed} seconds).`);
        this.quitGame(secondsPlayed);
      }
    });
  }

  private launchSteamGame() {
    if (!this.game.details.steamId) {
      this.callback(new Error('The game Steam id is not provided. Make sure your game is correctly installed.'), null);
      return;
    }
    logger.info('GameLauncher', 'Launching Steam game.');
    monitorSteamApp(this.game.details.steamId.toString(), (error: string, secondsPlayed: number) => {
      if (error)
        this.callback(new Error(error), null);
      else {
        logger.info('GameLauncher', `Game ended (played during ${secondsPlayed} seconds).`);
        this.quitGame(secondsPlayed);
      }
    });

    const [ program, args ]: string[] = this.game.commandLine;
    logger.info('GameLauncher', `Launching Steam game (${this.game.details.steamId}) with native module.`);
    nativeLaunchGame({ program, args });
  }

  private quitGame(secondsPlayed: number) {
    this.discordClient.disconnect();
    this.callback(null, secondsPlayed);
  }
}

const gameLauncher: GameLauncher = new GameLauncher();

export function launchGame(game: PlayableGame): Promise<any> {
  return new Promise((resolve, reject) => {
    gameLauncher.launch(game, (error, minutesPlayed) => {
      if (error)
        reject(error);
      else
        resolve(minutesPlayed);
    });
  });
}
