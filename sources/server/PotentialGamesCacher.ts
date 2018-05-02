import * as fs from 'fs-extra';
import * as path from 'path';

import { getEnvFolder } from '../models/env';
import { PotentialGame } from '../models/PotentialGame';
import { searchIgdbGame } from './api/IgdbWrapper';

class PotentialGamesCacher {
	private readonly cacheFilePath: string;

	public constructor() {
		this.cacheFilePath = path.resolve(getEnvFolder('config'), 'potential_games.json');
	}

	public async cache(potentialGames: PotentialGame[]) {
		const potentialGamesCache: any = (await fs.pathExists(this.cacheFilePath)) ?
			(await fs.readJson(this.cacheFilePath, { throws: false }) || {}) : ({});

		let gamesAddedNb: number = 0;
		const populatedPotentialGames: PotentialGame[] = await Promise.all(potentialGames.map(async (potentialGame: PotentialGame) => {
			if (!potentialGamesCache[potentialGame.uuid]) {
				const [ { cover } ]: any[] = await searchIgdbGame(potentialGame.name, 1);
				potentialGamesCache[potentialGame.uuid] = {
					name: potentialGame.name,
					cover
				};
				gamesAddedNb++;
			}
			return {
				...potentialGame,
				details: {
					cover: potentialGamesCache[potentialGame.uuid].cover
				}
			};
		}));
		if (gamesAddedNb)
			await fs.writeJson(this.cacheFilePath, potentialGamesCache, { spaces: 2 });
		return populatedPotentialGames;
	}

	public async invalidCache() {
		await fs.writeJson(this.cacheFilePath, {});
	}
}

export const potentialGamesCacher: PotentialGamesCacher = new PotentialGamesCacher();
