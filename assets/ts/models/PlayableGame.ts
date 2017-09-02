import * as fs from 'fs-extra';
import * as path from 'path';

import { GameSource, PotentialGame } from './PotentialGame';
import { getGamesFolder } from '../server/helpers';

export class PlayableGame extends PotentialGame {
	public timePlayed: number;

	public constructor(name: string, details?: any) {
		super(name, details);
		this.timePlayed = 0;
	}

	public addPlayTime(timePlayed: number, errorCallback?: Function) {
		this.timePlayed += timePlayed;

		let configFilePath: string = path.resolve(getGamesFolder(), this.uuid, 'config.json');
		fs.writeFile(configFilePath, JSON.stringify(this, null, 2), (error) => {
			if (error && errorCallback)
				errorCallback(error);
		});
	}

	public static toPlayableGame(game: PotentialGame): PlayableGame {
		let playableGame: PlayableGame =  new PlayableGame(game.name, game.details);
		playableGame.uuid = game.uuid;
		playableGame.source = game.source;
		playableGame.commandLine = game.commandLine;
		playableGame.timePlayed = 0;

		return playableGame;
	}
}
