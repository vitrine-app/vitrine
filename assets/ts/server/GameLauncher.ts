import { execFile } from 'child_process';
import * as path from 'path';

import { PlayableGame } from '../models/PlayableGame';

export class GameLauncher {
	private scriptPath: string;
	private watcherPath: string;

	constructor(private game: PlayableGame) {
		this.scriptPath = path.resolve(__dirname, '../scripts/gameLauncher.exe');
		this.watcherPath = path.resolve(__dirname, '../scripts/regWatcher.exe');
	}

	launch(callback) {
		let beginTime: Date = new Date();

		execFile(this.scriptPath, this.game.commandLine, (error) => {
			if (error)
				throw new Error(error);
		});
		console.log('Waiting for timeout');
		setTimeout(() => {
			console.log('time outed!');
			let gameProcess = execFile(this.watcherPath, [this.game.details.steamId], (err, stdout, stderr) => {
				if (err)
					callback(err, null);
				console.log(stdout, '|', stderr)
			});
			gameProcess.on('exit', () => {
				let endTime: Date = new Date();
				let minutesPlayed: number = Math.round((endTime.getTime() - beginTime.getTime()) / 60000);
				callback(null, minutesPlayed);
			});
		}, 16500);
	}
}

export function getGameLauncherPromise(game: PlayableGame) {
	return new Promise((resolve, reject) => {
		new GameLauncher(game).launch((error, minutesPlayed) => {
			if (error)
				reject(error);
			else
				resolve(minutesPlayed);
		});
	});
}
