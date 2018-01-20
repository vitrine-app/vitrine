import * as childProcess from 'child_process';
import * as path from 'path';

import { GameSource } from '../models/PotentialGame';
import { PlayableGame } from '../models/PlayableGame';
import { getEnvFolder } from '../models/env';

class GameLauncher {
	private watcherPath: string;
	private game: PlayableGame;

	public constructor() {
		this.watcherPath = path.resolve(getEnvFolder('scripts'), 'regWatcher.exe');
	}

	public launch(game: PlayableGame, callback: Function) {
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
			case GameSource.STEAM: {
				this.launchSteamGame(callback);
				break;
			}
		}
	}

	private launchStandardGame(callback: Function) {
		let [executable, args]: string[] = this.game.commandLine;
		let commandLine: string = (args) ? (`"${executable}" ${args}`) : (`"${executable}"`);

		let beginTime: Date = new Date();
		childProcess.exec(commandLine, () => {
			let endTime: Date = new Date();
			let secondsPlayed: number = Math.round((endTime.getTime() - beginTime.getTime()) / 1000);
			callback(null, secondsPlayed);
		});
	}

	private launchSteamGame(callback: Function) {
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

		let [executable, args]: string[] = this.game.commandLine;
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
