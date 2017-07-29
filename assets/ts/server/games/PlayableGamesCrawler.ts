import * as fs from 'fs';
import * as path from 'path';

import { PlayableGame } from '../../models/PlayableGame';

class PlayableGamesCrawler {
	private playableGames: PlayableGame[];
	private gamesDirectory: string;
	private callback: Function;

	constructor() {
		this.playableGames = [];
		this.gamesDirectory = path.join(__dirname, 'games');
	}

	public search(callback) {
		this.callback = callback;
		console.log(this.gamesDirectory);
		fs.readdir(this.gamesDirectory, (err, files) => {
			if (err) {
				this.callback(err, null);
				return;
			}
			if (!files.length)
				this.callback(null, []);
			let counter: number = 0;
			files.forEach((gameId) => {
				let configFilePath: any = path.join(this.gamesDirectory, gameId, 'config.json');
				if (fs.existsSync(configFilePath)) {
					let playableGame: PlayableGame = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
					this.playableGames.push(playableGame);
				}
				counter++;
				if (counter == files.length)
					this.callback(null, this.playableGames);
			});
		});
	}
}

export function getPlayableGamesCrawlerPromise() {
	return new Promise((resolve, reject) => {
		new PlayableGamesCrawler().search((error, playableGames: PlayableGame[]) => {
			if (error)
				reject(error);
			else
				resolve(playableGames);
		});
	});
}