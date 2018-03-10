import * as childProcess from 'child_process';
import * as path from 'path';

import { GameSource } from '../models/PotentialGame';
import { PlayableGame } from '../models/PlayableGame';
import { launchGame as nativeLaunchGame, GameLauncherOptions } from '../../scripts/gameLauncher.node';
import { getEnvFolder } from '../models/env';

class GameLauncher {
	private watcherPath: string;
	private game: PlayableGame;

	public constructor() {
		this.watcherPath = path.resolve(getEnvFolder('scripts'), 'regWatcher.exe');
	}

	public launch(game: PlayableGame, callback: (error: Error, minutesPlayed: number) => void) {
		this.game = game;
		switch (+this.game.source) {
			case GameSource.LOCAL: {
				this.launchStandardGame(callback);
				break;
			}
			case GameSource.ROM: {
				this.launchStandardGame(callback);
				break;
			}
			case GameSource.ORIGIN: {
				this.launchStandardGame(callback);
				break;
			}
			case GameSource.BATTLE_NET: {
				this.launchStandardGame(callback);
				break;
			}
			case GameSource.STEAM: {
				this.launchSteamGame(callback);
				break;
			}
		}
	}

	private launchStandardGame(callback: (error: Error, minutesPlayed: number) => void) {
		let [ executable, args ]: string[] = this.game.commandLine;
		let launcherOptions: GameLauncherOptions = {
			program: executable,
			cwd: path.parse(executable).dir
		};
		if (args)
			launcherOptions.args = args;

		nativeLaunchGame(launcherOptions, (error: string, secondsPlayed: number) => {
			if (error)
				callback(new Error(error), null);
			else
				callback(null, secondsPlayed);
		});
	}

	private launchSteamGame(callback: (error: Error, minutesPlayed: number) => void) {
		childProcess.exec(`"${this.watcherPath}" ${this.game.details.steamId}`, (error: Error) => {
			if (error) {
				callback(error, null);
				return;
			}
			let beginTime: Date = new Date();
			childProcess.exec(`"${this.watcherPath}" ${this.game.details.steamId}`, (error: Error) => {
				if (error) {
					callback(error, null);
					return;
				}
				let endTime: Date = new Date();
				let secondsPlayed: number = Math.round((endTime.getTime() - beginTime.getTime()) / 1000);
				callback(null, secondsPlayed);
			});
		});

		let [ executable, args ]: string[] = this.game.commandLine;
		childProcess.exec(`"${executable}" ${args.replace(/\\/g, '/')}`, (error: Error) => {
			if (error)
				callback(error, null);
			return;
		});
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
