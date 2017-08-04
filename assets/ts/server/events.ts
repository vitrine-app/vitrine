import * as path from 'path';
import * as fs from 'fs';

import { GamesCollection } from '../models/GamesCollection';
import { PotentialGame } from '../models/PotentialGame';
import { PlayableGame } from '../models/PlayableGame';
import { getIgdbWrapper } from './api/IgdbWrapper';
import { getSteamCrawler } from './games/SteamGamesCrawler';
import { getPlayableGamesCrawler } from './games/PlayableGamesCrawler';
import { uuidV5, downloadFile, getGamesFolder } from './helpers';
import { getGameLauncher } from './GameLauncher';

let potentialGames: GamesCollection<PotentialGame>;
let playableGames: GamesCollection<PlayableGame>;

export const events = {
	'client.ready': (event) => {
		potentialGames = new GamesCollection();
		playableGames = new GamesCollection();

		getSteamCrawler().then((games: GamesCollection<PotentialGame>) => {
			potentialGames = games;
			event.sender.send('server.add-potential-games', potentialGames.games);
		}).catch((error) => {
			throw error;
		});

		getPlayableGamesCrawler().then((games: GamesCollection<PlayableGame>) => {
			playableGames = games;
			event.sender.send('server.add-playable-games', playableGames.games);
		}).catch((error) => {
			throw error;
		});
	},
	'client.get-game': (event, gameName) => {
		getIgdbWrapper(gameName).then((game) => {
			event.sender.send('server.send-game', game);
		}).catch((error) => {
			event.sender.send('server.send-game-error', error);
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
						playableGames.addGame(addedGame);
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
			getGameLauncher(game).then((secondsPlayed: number) => {
				console.log('You played', secondsPlayed, 'seconds.');
				game.addPlayTime(secondsPlayed);
				event.sender.send('server.stop-game', true);
			}).catch((error) => {
				if (error)
					throw new Error(error);
			});
		});
	},
};
