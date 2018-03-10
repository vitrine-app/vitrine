import * as fs from 'fs-extra';
import * as path from 'path';

import { PotentialGame } from '../../models/PotentialGame';
import { PlayableGame } from '../../models/PlayableGame';
import { GamesCollection } from '../../models/GamesCollection';
import { getEnvFolder, uuidV5 } from '../../models/env';

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
		let potentialGames: GamesCollection<PotentialGame> = new GamesCollection(this.potentialGames);
		this.callback(null, potentialGames);
	}

	protected isGameAlreadyAdded(name: string): boolean {
		let gameUuid: string = uuidV5(name);

		let gameDirectory: string = path.resolve(getEnvFolder('games'), gameUuid);
		let configFilePath: string = path.resolve(gameDirectory, 'config.json');

		return fs.existsSync(configFilePath);
	}
}
