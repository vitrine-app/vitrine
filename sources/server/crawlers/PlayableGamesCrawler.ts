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

	public constructor() {
		this.playableGames = [];
		this.gamesDirectory = getEnvFolder('games');
		this.configFileName = 'config.json';
	}

	public async search(callback: (error: Error, playableGames: GamesCollection<PlayableGame>) => void) {
		try {
			const files: string[] = await fs.readdir(this.gamesDirectory);
			if (!files.length) {
				callback(null, new GamesCollection());
				return;
			}
			await files.forEachEnd(async (gameUuid: string, done: () => void) => {
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
			});
			const playableGames: GamesCollection<PlayableGame> = new GamesCollection();
			playableGames.setGames(this.playableGames);
			callback(null, playableGames);
		}
		catch (error) {
			callback(error, null);
		}
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
