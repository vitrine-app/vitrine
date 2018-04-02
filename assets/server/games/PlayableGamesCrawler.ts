import * as fs from 'fs-extra';
import * as path from 'path';

import { getEnvFolder } from '../../models/env';
import { GamesCollection } from '../../models/GamesCollection';
import { PlayableGame } from '../../models/PlayableGame';
import { logger } from '../Logger';

class PlayableGamesCrawler {
	private readonly playableGames: PlayableGame[];
	private readonly gamesDirectory: string;
	private callback: (error: Error, playableGames: GamesCollection<PlayableGame>) => void;

	public constructor() {
		this.playableGames = [];
		this.gamesDirectory = getEnvFolder('games');
	}

	public search(callback: (error: Error, playableGames: GamesCollection<PlayableGame>) => void) {
		this.callback = callback;
		fs.readdir(this.gamesDirectory, (error: Error, files: string[]) => {
			if (error) {
				this.callback(error, null);
				return;
			}
			if (!files.length) {
				this.callback(null, new GamesCollection());
				return;
			}
			files.forEachEnd((gameUuid: string, done: () => void) => {
				const configFilePath: any = path.resolve(this.gamesDirectory, gameUuid, 'config.json');
				if (fs.existsSync(configFilePath)) {
					const rawGame = fs.readJsonSync(configFilePath);
					const playableGame: PlayableGame = new PlayableGame(rawGame.name, rawGame.details);
					playableGame.uuid = rawGame.uuid;
					playableGame.commandLine = rawGame.commandLine;
					playableGame.timePlayed = parseInt(rawGame.timePlayed);
					playableGame.source = rawGame.source;
					playableGame.ambientColor = rawGame.ambientColor;

					logger.info('PlayableGamesCrawler', `Playable game ${playableGame.name} (${playableGame.uuid}) found.`);
					this.playableGames.push(playableGame);
				}
				done();
			}, () => {
				const playableGames: GamesCollection<PlayableGame> = new GamesCollection();
				playableGames.setGames(this.playableGames);
				this.callback(null, playableGames);
				delete this.callback;
			});
		});
	}
}

export function getPlayableGames(): Promise<any> {
	return new Promise((resolve, reject) => {
		new PlayableGamesCrawler().search((error: Error, playableGames: GamesCollection<PlayableGame>) => {
			if (error)
				reject(error);
			else
				resolve(playableGames);
		});
	});
}
