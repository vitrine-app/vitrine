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
		console.log(commandLine);
		const gameProcess = execFile('explorer', (err: string, stdout, stderr) => {
			if (err) {
				console.error(err);
				throw err;
			}
			console.log(stdout);
		});
		console.log('Started.');
		gameProcess.on('exit', () => {
			console.log('Game ended.');
		});
	}
};
