import * as fs from 'fs-extra';
import * as path from 'path';

import { getEnvFolder } from '../../models/env';
import { GamesCollection } from '../../models/GamesCollection';
import { PlayableGame } from '../../models/PlayableGame';
import { logger } from '../Logger';

class PlayableGamesCrawler {
	private readonly playableGames: PlayableGame[];
	private readonly gamesDirectory: string;
	private readonly configFileName: string;
	private callback: (error: Error, playableGames: GamesCollection<PlayableGame>) => void;

	public constructor() {
		this.playableGames = [];
		this.gamesDirectory = getEnvFolder('games');
		this.configFileName = 'config.json';
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
			files.forEachEnd(async (gameUuid: string, done: () => void) => {
				const configFilePath: any = path.resolve(this.gamesDirectory, gameUuid, this.configFileName);
				if (await fs.pathExists(configFilePath)) {
					const rawGame = await fs.readJson(configFilePath);
					const playableGame: PlayableGame = new PlayableGame(rawGame.name, rawGame.details);
					playableGame.uuid = rawGame.uuid;
					playableGame.commandLine = rawGame.commandLine;
					playableGame.timePlayed = parseInt(rawGame.timePlayed);
					playableGame.source = rawGame.source;

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
