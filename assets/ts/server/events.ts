import * as path from 'path';
import * as fs from 'fs';
import { execFile } from 'child_process';

import { IgdbWrapper } from './api/IgdbWrapper';
import { getSteamCrawlerPromise } from './games/SteamGamesCrawler';
import { PotentialGame } from './games/PotentialGame';
import { PlayableGame } from './games/PlayableGame';
import { uuidV5, downloadFile } from './helpers';
import { getPlayableGamesCrawlerPromise } from './games/PlayableGamesCrawler';

let igdbWrapper: IgdbWrapper = new IgdbWrapper();
let potentialGames: PotentialGame[];
let playableGames: PlayableGame[];

export const events = {
	'client.ready': (event) => {
		getSteamCrawlerPromise().then((games: PotentialGame[]) => {
			potentialGames = games;
			event.sender.send('server.add-potential-games', potentialGames);
		}).catch((error) => {
			throw error;
		});

		getPlayableGamesCrawlerPromise().then((games: PlayableGame[]) => {
			playableGames = games;
			event.sender.send('server.add-playable-games', playableGames);
		}).catch((error) => {
			throw error;
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

		playableGames.forEach((potentialGame: PotentialGame) => {
			if (potentialGame.uuid == gameId) {
				gameFound = true;
				if (potentialGame.uuid !== uuidV5(potentialGame.name))
					throw new Error('Hashed codes do\'nt match. Your game is probably corrupted.');

				let commandArgs: string[] = potentialGame.commandLine;
				let programName: string = commandArgs.shift();

				let beginTime: Date = new Date();
				console.log(programName, commandArgs);
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
			if (counter == potentialGames.length && !gameFound)
				throw Error('Game not found');
		});
	},
	'client.add-game': (event, gameId) => {
		potentialGames.forEach((potentialSteamGame) => {
			if (potentialSteamGame.uuid == gameId) {
				let gameDirectory = path.join(__dirname, 'games', potentialSteamGame.uuid);
				let configFilePath = path.join(gameDirectory, 'config.json');

				if (fs.existsSync(configFilePath))
					return;
				fs.mkdirSync(gameDirectory);

				let addedGame: any = PlayableGame.toPlayableGame(potentialSteamGame);
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
