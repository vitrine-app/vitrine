import { execFile } from 'child_process';

import { IgdbWrapper } from './api/IgdbWrapper';
import { getSteamCrawlerPromise } from './games/SteamGamesCrawler';

let igdbWrapper = new IgdbWrapper();

export const events = {
	'client.ready': (event) => {
		getSteamCrawlerPromise().then((potentialGames) => {
			event.sender.send('server.add-potential-games', potentialGames);
		});
	},
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
		commandLine = commandLine.split(',');
		let programName: string = commandLine.shift();
		console.log(programName, commandLine);
		let gameProcess = execFile(programName, commandLine, (err: string, stdout, stderr) => {
			if (err)
				throw err;
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
