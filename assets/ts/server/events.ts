import * as path from 'path';
import * as fs from 'fs';
import { execFile } from 'child_process';

import { IgdbWrapper } from './api/IgdbWrapper';
import { getSteamCrawlerPromise } from './games/SteamGamesCrawler';
import { PotentialSteamGame } from './games/PotentialSteamGame';
import { uuidV5, downloadFile } from './helpers';

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
				if (potentialSteamGame.uuid !== uuidV5(potentialSteamGame.name))
					throw new Error('Hashed codes do\'nt match. Your game is probably corrupted.');

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
	},
	'client.add-game': (event, gameId) => {
		potentialSteamGames.forEach(function(potentialSteamGame) {
			if (potentialSteamGame.uuid == gameId) {
				let gameDirectory = path.join(__dirname, 'games', potentialSteamGame.uuid);
				let configFilePath = path.join(gameDirectory, 'config.json');
				console.log(configFilePath);

				if (fs.existsSync(gameDirectory) || fs.existsSync(configFilePath))
					return;
				fs.mkdirSync(gameDirectory);

				let addedGame: any = potentialSteamGame;
				let screenPath = path.join(gameDirectory, 'background.jpg');
				let coverPath = path.join(gameDirectory, 'cover.jpg');

				downloadFile(addedGame.details.cover, coverPath, () => {
					addedGame.details.cover = coverPath;
					downloadFile(addedGame.details.screenshots[0].replace('t_screenshot_med', 't_screenshot_huge'), screenPath, () => {
						addedGame.details.backgroundScreen = screenPath;
						delete addedGame.details.screenshots;
						fs.writeFile(configFilePath, JSON.stringify(addedGame, null, 2), (err) => {
							if (err)
								throw err;
							event.sender.send('server.remove-potential-game', potentialSteamGame.uuid);
						});
					});
				});
			}
		});
	}
};
