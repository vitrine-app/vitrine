import * as fs from 'fs-extra';
import * as path from 'path';

import { getEnvFolder } from '../../models/env';
import { GamesCollection } from '../../models/GamesCollection';
import { PlayableGame } from '../../models/PlayableGame';
import { GameSource } from '../../models/PotentialGame';
import { getGamePlayTime } from '../api/SteamPlayTimeWrapper';
import { logger } from '../Logger';

class PlayableGamesCrawler {
	private readonly playableGames: PlayableGame[];
	private readonly gamesDirectory: string;
	private readonly configFileName: string;

	public constructor(private steamUserId: string | undefined) {
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
					playableGame.source = rawGame.source;
					if (playableGame.source === GameSource.STEAM)
						playableGame.timePlayed = await getGamePlayTime(this.steamUserId, playableGame.details.steamId);
					else
						playableGame.timePlayed = parseInt(rawGame.timePlayed);

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

export function getPlayableGames(steamConfig?: any): Promise<any> {
	return new Promise((resolve, reject) => {
		const steamUserId: string = (steamConfig && steamConfig.userId) ? (steamConfig.userId) : (undefined);
		new PlayableGamesCrawler(steamUserId).search((error: Error, playableGames: GamesCollection<PlayableGame>) => {
			if (error)
				reject(error);
			else
				resolve(playableGames);
		});
	});
}
