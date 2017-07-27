import { execFile } from 'child_process';

import { IgdbWrapper } from './api/IgdbWrapper';
import { getSteamCrawlerPromise } from './games/SteamGamesCrawler';
import { PotentialSteamGame } from './games/PotentialSteamGame';

let igdbWrapper: IgdbWrapper = new IgdbWrapper();
let potentialSteamGames: PotentialSteamGame[];

export const events = {
	'client.ready': (event) => {
		getSteamCrawlerPromise().then((potentialGames: PotentialSteamGame[]) => {
			potentialSteamGames = potentialGames;
			event.sender.send('server.add-potential-games', potentialSteamGames);
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
	'client.launch-game': (event, gameId) => {
		let counter: number = 0;
		let gameFound: boolean = false;

		potentialSteamGames.forEach(function(potentialSteamGame) {
			if (potentialSteamGame.uuid == gameId) {
				gameFound = true;
				let commandArgs: string[] = potentialSteamGame.commandLine;
				let programName: string = commandArgs.shift();

				let beginTime: Date = new Date();
				let gameProcess = execFile(programName, commandArgs, (err: string, stdout, stderr) => {
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
			counter++;
			if (counter == potentialSteamGames.length && !gameFound)
				throw Error('Game not found');
		});
	}
};
