import * as path from 'path';
import * as fs from 'fs';
import { execFile } from 'child_process';

import { IgdbWrapper } from './api/IgdbWrapper';
import { GamesCollection } from '../models/GamesCollection';
import { PotentialGame } from '../models/PotentialGame';
import { PlayableGame } from '../models/PlayableGame';
import { getSteamCrawlerPromise } from './games/SteamGamesCrawler';
import { getPlayableGamesCrawlerPromise } from './games/PlayableGamesCrawler';
import { uuidV5, downloadFile } from './helpers';

let igdbWrapper: IgdbWrapper = new IgdbWrapper();
let potentialGames: GamesCollection<PotentialGame>;
let playableGames: GamesCollection<PlayableGame>;

export const events = {
	'client.ready': (event) => {
		potentialGames = new GamesCollection();
		playableGames = new GamesCollection();

		getSteamCrawlerPromise().then((games: GamesCollection<PotentialGame>) => {
			potentialGames = games;
			event.sender.send('server.add-potential-games', potentialGames.games);
		}).catch((error) => {
			throw error;
		});

		getPlayableGamesCrawlerPromise().then((games: GamesCollection<PlayableGame>) => {
			playableGames = games;
			event.sender.send('server.add-playable-games', playableGames.games);
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
			if (counter == potentialGames.games.length && !gameFound)
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

				downloadFile(addedGame.details.cover, coverPath, true, () => {
					addedGame.details.cover = coverPath;
					downloadFile(addedGame.details.screenshots[0].replace('t_screenshot_med', 't_screenshot_huge'), screenPath, true,() => {
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
