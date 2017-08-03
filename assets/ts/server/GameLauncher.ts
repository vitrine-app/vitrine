import { execFile } from 'child_process';

import { PlayableGame } from '../models/PlayableGame';

export class GameLauncher {
	private commandArgs: string[];
	private programName: string;

	constructor(private game: PlayableGame) {
		this.commandArgs = this.game.commandLine.slice(0);
		this.programName = this.commandArgs.shift()
	}

	launch(callback) {
		let beginTime: Date = new Date();

		let gameProcess = execFile(this.programName, this.commandArgs, (err, stdout, stderr) => {
			if (err)
				callback(err, null);
		});
		gameProcess.on('exit', () => {
			let endTime: Date = new Date();
			let minutesPlayed: number = Math.round((endTime.getTime() - beginTime.getTime()) / 60000);
			callback(null, minutesPlayed);
		});
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
