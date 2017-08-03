import * as path from 'path';
import * as fs from 'fs';

import { IgdbWrapper } from './api/IgdbWrapper';
import { GamesCollection } from '../models/GamesCollection';
import { PotentialGame } from '../models/PotentialGame';
import { PlayableGame } from '../models/PlayableGame';
import { getSteamCrawlerPromise } from './games/SteamGamesCrawler';
import { getPlayableGamesCrawlerPromise } from './games/PlayableGamesCrawler';
import { uuidV5, downloadFile, getGamesFolder } from './helpers';
import { getGameLauncherPromise } from './GameLauncher';

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
	'client.add-game': (event, gameId) => {
		potentialGames.getGame(gameId, (error, potentialSteamGame) => {
			if (error)
				throw new Error(error);
			let gameDirectory = path.resolve(getGamesFolder(), potentialSteamGame.uuid);
			let configFilePath = path.resolve(gameDirectory, 'config.json');

			if (fs.existsSync(configFilePath))
				return;
			fs.mkdirSync(gameDirectory);

			let addedGame: any = PlayableGame.toPlayableGame(potentialSteamGame);
			let screenPath = path.resolve(gameDirectory, 'background.jpg');
			let coverPath = path.resolve(gameDirectory, 'cover.jpg');

			downloadFile(addedGame.details.cover, coverPath, true, () => {
				addedGame.details.cover = coverPath;
				downloadFile(addedGame.details.screenshots[0].replace('t_screenshot_med', 't_screenshot_huge'), screenPath, true,() => {
					addedGame.details.backgroundScreen = screenPath;
					delete addedGame.details.screenshots;
					fs.writeFile(configFilePath, JSON.stringify(addedGame, null, 2), (err) => {
						if (err)
							throw err;
						event.sender.send('server.remove-potential-game', potentialSteamGame.uuid);
						event.sender.send('server.add-playable-game', addedGame);
					});
				});
			});
		});
	},
	'client.launch-game': (event, gameId) => {
		playableGames.getGame(gameId, (error, game: PlayableGame) => {
			if (error)
				throw new Error(error);
			if (game.uuid !== uuidV5(game.name))
				throw new Error('Hashed codes do\'nt match. Your game is probably corrupted.');
			getGameLauncherPromise(game).then((minutesPlayed) => {
				console.log('You played', minutesPlayed, 'minutes.');
				event.sender.send('server.stop-game', true);
			}).catch((error) => {
				if (error)
					throw new Error(error);
			});
		});
	},
};
