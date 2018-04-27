import * as fs from 'fs-extra';
import * as path from 'path';

import { getEnvFolder, uuidV5 } from '../../models/env';
import { GamesCollection } from '../../models/GamesCollection';
import { PlayableGame } from '../../models/PlayableGame';
import { PotentialGame } from '../../models/PotentialGame';
import { logger } from '../Logger';

export abstract class PotentialGamesCrawler {
	protected potentialGames: PotentialGame[];
	protected playableGames: PlayableGame[];
	protected moduleConfig: any;
	protected callback: (error: Error, potentialGames: GamesCollection<PotentialGame>) => void;

	public setPlayableGames(playableGames?: PlayableGame[]) {
		this.potentialGames = [];
		this.playableGames = playableGames || [];
	}

	public search(moduleConfig: any, callback: (error: Error, potentialGames: GamesCollection<PotentialGame>) => void) {
		this.moduleConfig = moduleConfig;
		this.callback = callback;
	}

	protected sendResults() {
		const potentialGames: GamesCollection<PotentialGame> = new GamesCollection(this.potentialGames);
		logger.info('PotentialGamesCrawler', `Potential games search for this module completed.`);
		this.callback(null, potentialGames);
	}

	protected gameDirExists(name: string): boolean {
		const gameUuid: string = uuidV5(name);

		const gameDirectory: string = path.resolve(getEnvFolder('games'), gameUuid);
		const configFilePath: string = path.resolve(gameDirectory, 'config.json');

		return fs.pathExistsSync(configFilePath);
	}
}
