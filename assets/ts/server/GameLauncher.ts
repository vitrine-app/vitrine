import { execFile } from 'child_process';
import * as path from 'path';

import { GameSource } from '../models/PotentialGame';
import { PlayableGame } from '../models/PlayableGame';
import { getEnvFolder } from './helpers';

class GameLauncher {
	private scriptPath: string;
	private watcherPath: string;

	public constructor(private game: PlayableGame) {
		this.scriptPath = path.resolve(getEnvFolder('scripts'), 'gameLauncher.exe');
		this.watcherPath = path.resolve(getEnvFolder('scripts'), 'regWatcher.exe');
	}

	public launch(callback: Function) {
		console.log(this.game.source);
		switch (this.game.source) {
			case GameSource.LOCAL: {
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
		let beginTime: Date = new Date();
		let gameProcess = execFile(this.scriptPath, this.game.commandLine, null,(error) => {
			if (error)
				callback(error, null);
		});
		gameProcess.on('exit', () => {
			let endTime: Date = new Date();
			let secondsPlayed: number = Math.round((endTime.getTime() - beginTime.getTime()) / 1000);
			callback(null, secondsPlayed);
		});
	}

	private launchSteamGame(callback: Function) {
		let inWatcherProcess = execFile(this.watcherPath, [this.game.details.steamId], null,(error) => {
			if (error)
				callback(error, null);
		});
		execFile(this.scriptPath, this.game.commandLine, null, (error) => {
			if (error)
				callback(error, null);
		});
		inWatcherProcess.on('exit', () => {
			let beginTime: Date = new Date();
			let outWatcherProcess = execFile(this.watcherPath, [this.game.details.steamId], null, (error) => {
				if (error)
					callback(error, null);
			});
			outWatcherProcess.on('exit', () => {
				let endTime: Date = new Date();
				let secondsPlayed: number = Math.round((endTime.getTime() - beginTime.getTime()) / 1000);
				callback(null, secondsPlayed);
			});
		});
	}
}

export function getGameLauncher(game: PlayableGame): Promise<any> {
	return new Promise((resolve, reject) => {
		new GameLauncher(game).launch((error, minutesPlayed) => {
			if (error)
				reject(error);
			else
				resolve(minutesPlayed);
		});
	});
}
