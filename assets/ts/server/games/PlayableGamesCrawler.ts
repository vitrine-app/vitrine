import * as fs from 'fs';
import * as path from 'path';

import { PlayableGame } from '../../models/PlayableGame';
import { GamesCollection } from '../../models/GamesCollection';
import { getEnvFolder } from '../helpers';

class PlayableGamesCrawler {
	private playableGames: PlayableGame[];
	private gamesDirectory: string;
	private callback: Function;

	constructor() {
		this.playableGames = [];
		this.gamesDirectory = getEnvFolder('games');
	}

	public search(callback) {
		this.callback = callback;
		fs.readdir(this.gamesDirectory, (error, files) => {
			if (error) {
				this.callback(error, null);
				return;
			}
			if (!files.length) {
				let playableGames: GamesCollection<PlayableGame> = new GamesCollection();
				this.callback(null, playableGames);
				return;
			}
			let counter: number = 0;
			files.forEach((gameId) => {
				let configFilePath: any = path.resolve(this.gamesDirectory, gameId, 'config.json');
				if (fs.existsSync(configFilePath)) {
					let rawGame = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
					let playableGame: PlayableGame = new PlayableGame(rawGame.name, rawGame.details);
					playableGame.uuid = rawGame.uuid;
					playableGame.commandLine = rawGame.commandLine;
					playableGame.timePlayed = 0;

					this.playableGames.push(playableGame);
				}
				counter++;
				if (counter === files.length) {
					let playableGames: GamesCollection<PlayableGame> = new GamesCollection();
					playableGames.games = this.playableGames;
					this.callback(null, playableGames);
					delete this.callback;
				}
			});
		});
	}
}

export function getPlayableGamesCrawler() {
	return new Promise((resolve, reject) => {
		new PlayableGamesCrawler().search((error, playableGames: PlayableGame[]) => {
			if (error)
				reject(error);
			else
				resolve(playableGames);
		});
	});
}
