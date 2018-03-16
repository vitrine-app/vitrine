import * as path from 'path';

import { GameSource } from '../models/PotentialGame';
import { PlayableGame } from '../models/PlayableGame';
import { launchGame as nativeLaunchGame, GameLauncherOptions } from '../../scripts/gameLauncher.node';
import { watchRegKey } from '../../scripts/regWatcher.node'

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
		let [ executable, args ]: string[] = this.game.commandLine;
		let launcherOptions: GameLauncherOptions = {
			program: executable,
			cwd: path.parse(executable).dir
		};
		if (args)
			launcherOptions.args = args;

		nativeLaunchGame(launcherOptions, (error: string, secondsPlayed: number) => {
			if (error)
				this.callback(new Error(error), null);
			else
				this.callback(null, secondsPlayed);
		});
	}

	private launchSteamGame() {
		if (!this.game.details.steamId) {
			this.callback(new Error('The game Steam id is not provided. Make sure your game is correctly installed.'), null);
			return;
		}

		let regNest: string = 'HKEY_CURRENT_USER';
		let regKey: string = `Software\\Valve\\Steam\\Apps\\${this.game.details.steamId}`;

		watchRegKey(regNest, regKey, (error: string) => {
			if (error) {
				this.callback(new Error(error), null);
				return;
			}

			watchRegKey(regNest, regKey, (error: string, secondsPlayed: number) => {
				if (error)
					this.callback(new Error(error), null);
				else
					this.callback(null, secondsPlayed);
			});
		});

		let [ program, args ]: string[] = this.game.commandLine;
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
