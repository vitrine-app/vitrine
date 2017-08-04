import * as fs from 'fs';
import * as path from 'path';

import { PotentialGame } from './PotentialGame';
import { getEnvFolder } from '../server/helpers';

export class PlayableGame extends PotentialGame {
	public timePlayed: number;

	constructor(name: string, details?: any) {
		super(name, details);
	}

	public addPlayTime(timePlayed: number) {
		this.timePlayed += timePlayed;

		let configFilePath: string = path.resolve(getEnvFolder('games'), this.uuid, 'config.json');
		fs.writeFile(configFilePath, JSON.stringify(this, null, 2), (error) => {
			if (error)
				throw error;
		});
	}

	public static toPlayableGame(game: PotentialGame) {
		let playableGame: PlayableGame =  new PlayableGame(game.name, game.details);
		playableGame.uuid = game.uuid;
		playableGame.commandLine = game.commandLine;
		playableGame.timePlayed = 0;

		return playableGame;
	}
}
