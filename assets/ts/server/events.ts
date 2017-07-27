import { execFile } from 'child_process';

import { IgdbWrapper } from './api/IgdbWrapper';

let igdbWrapper = new IgdbWrapper();

export const events = {
	'client.get-game': (event, gameName) => {
		igdbWrapper.getGame(gameName, (error, game) => {
			if (error)
				event.sender.send('server.send-game-error', error);
			else
				event.sender.send('server.send-game', game);
		});
	},
	'client.launch-game': (event, commandLine) => {
		let beginTime: Date = new Date();

		let gameProcess = execFile(commandLine, (err: string, stdout, stderr) => {
			if (err)
				throw new Error(err);
			console.log(stdout);
			console.log(stderr);
		});
		gameProcess.on('exit', () => {
			let endTime: Date = new Date();
			let secondsPlayed: number = Math.round((endTime.getTime() - beginTime.getTime()) / 1000);
			console.log('You played', secondsPlayed, 'seconds.');
		});
	}
};
