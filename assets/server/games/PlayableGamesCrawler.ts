import * as fs from 'fs-extra';
import * as path from 'path';

import { PlayableGame } from '../../models/PlayableGame';
import { GamesCollection } from '../../models/GamesCollection';
import { getEnvFolder } from '../../models/env';

class PlayableGamesCrawler {
	private playableGames: PlayableGame[];
	private gamesDirectory: string;
	private callback: Function;

	public constructor() {
		this.playableGames = [];
		this.gamesDirectory = getEnvFolder('games');
	}

	public search(callback: Function) {
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
			files.forEach((gameUuid) => {
				let configFilePath: any = path.resolve(this.gamesDirectory, gameUuid, 'config.json');
				if (fs.existsSync(configFilePath)) {
					let rawGame = fs.readJsonSync(configFilePath);
					let playableGame: PlayableGame = new PlayableGame(rawGame.name, rawGame.details);
					playableGame.uuid = rawGame.uuid;
					playableGame.commandLine = rawGame.commandLine;
					playableGame.timePlayed = parseInt(rawGame.timePlayed);
					playableGame.source = rawGame.source;
					playableGame.ambientColor = rawGame.ambientColor;

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

export function getPlayableGames(): Promise<any> {
	return new Promise((resolve, reject) => {
		new PlayableGamesCrawler().search((error, playableGames: PlayableGame[]) => {
			if (error)
				reject(error);
			else
				resolve(playableGames);
		});
	});
}
