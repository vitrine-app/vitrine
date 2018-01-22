import * as fs from 'fs-extra';
import * as path from 'path';

import { PotentialGame } from '../../models/PotentialGame';
import { PlayableGame } from '../../models/PlayableGame';
import { getEnvFolder, uuidV5 } from '../../models/env';

export abstract class PotentialGamesCrawler {
	protected potentialGames: PotentialGame[];
	protected playableGames: PlayableGame[];
	protected moduleConfig: any;
	protected callback: Function;

	public setPlayableGames(playableGames?: PlayableGame[]) {
		this.potentialGames = [];
		this.playableGames = playableGames || [];
	}

	public search(moduleConfig: any, callback: Function) {
		this.moduleConfig = moduleConfig;
		this.callback = callback;
	}

	protected isGameAlreadyAdded(name: string): boolean {
		let gameUuid: string = uuidV5(name);

		let gameDirectory: string = path.resolve(getEnvFolder('games'), gameUuid);
		let configFilePath: string = path.resolve(gameDirectory, 'config.json');

		return fs.existsSync(configFilePath);
	}
}
