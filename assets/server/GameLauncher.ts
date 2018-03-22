import * as path from 'path';

import { GameSource } from '../models/PotentialGame';
import { PlayableGame } from '../models/PlayableGame';
import { launchGame as nativeLaunchGame, GameLauncherOptions } from '../../scripts/gameLauncher.node';
import { watchRegKey } from '../../scripts/regWatcher.node'
import { logger } from './Logger';

class GameLauncher {
	private game: PlayableGame;
	private callback: (error: Error, minutesPlayed: number) => void;

	public launch(game: PlayableGame, callback: (error: Error, minutesPlayed: number) => void) {
		this.callback = callback;
		this.game = game;
		if (this.game.source == GameSource.STEAM)
			this.launchSteamGame();
		else
			this.launchStandardGame();
	}

	private launchStandardGame() {
		logger.info('GameLauncher', 'Launching non-Steam game.');

		let [ executable, args ]: string[] = this.game.commandLine;
		let launcherOptions: GameLauncherOptions = {
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
				this.callback(null, secondsPlayed);
			}
		});
	}

	private launchSteamGame() {
		if (!this.game.details.steamId) {
			this.callback(new Error('The game Steam id is not provided. Make sure your game is correctly installed.'), null);
			return;
		}

		logger.info('GameLauncher', 'Launching Steam game.');

		let regNest: string = 'HKEY_CURRENT_USER';
		let regKey: string = `Software\\Valve\\Steam\\Apps\\${this.game.details.steamId}`;
		logger.info('GameLauncher', `Watching Steam registry key for game begin (${this.game.details.steamId}).`);
		watchRegKey(regNest, regKey, (error: string) => {
			if (error) {
				this.callback(new Error(error), null);
				return;
			}

			logger.info('GameLauncher', `Watching Steam registry key for game end (${this.game.details.steamId}).`);
			watchRegKey(regNest, regKey, (error: string, secondsPlayed: number) => {
				if (error)
					this.callback(new Error(error), null);
				else {
					logger.info('GameLauncher', `Game terminated (played during ${secondsPlayed} seconds).`);
					this.callback(null, secondsPlayed);
				}
			});
		});

		let [ program, args ]: string[] = this.game.commandLine;
		logger.info('GameLauncher', `Launching Steam game (${this.game.details.steamId}}) with native module.`);
		nativeLaunchGame({ program, args });
	}
}

let gameLauncher: GameLauncher = new GameLauncher();

export function launchGame(game: PlayableGame): Promise<any> {
	return new Promise((resolve, reject) => {
		gameLauncher.launch(game,(error, minutesPlayed) => {
			if (error)
				reject(error);
			else
				resolve(minutesPlayed);
		});
	});
}
