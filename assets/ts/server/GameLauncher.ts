import { execFile } from 'child_process';
import * as path from 'path';

import { PlayableGame } from '../models/PlayableGame';
import { getScriptsFolder } from './helpers';

class GameLauncher {
	private scriptPath: string;
	private watcherPath: string;

	constructor(private game: PlayableGame) {
		this.scriptPath = path.resolve(__dirname, getScriptsFolder(), 'gameLauncher.exe');
		this.watcherPath = path.resolve(__dirname, getScriptsFolder(), 'regWatcher.exe');
	}

	launch(callback) {
		let inWatcherProcess = execFile(this.watcherPath, [this.game.details.steamId], (error) => {
			if (error)
				callback(error, null);
		});
		execFile(this.scriptPath, this.game.commandLine, (error) => {
			if (error)
				callback(error, null);
		});
		inWatcherProcess.on('exit', () => {
			let beginTime: Date = new Date();
			let outWatcherProcess = execFile(this.watcherPath, [this.game.details.steamId], (error) => {
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

export function getGameLauncher(game: PlayableGame) {
	return new Promise((resolve, reject) => {
		new GameLauncher(game).launch((error, minutesPlayed) => {
			if (error)
				reject(error);
			else
				resolve(minutesPlayed);
		});
	});
}
