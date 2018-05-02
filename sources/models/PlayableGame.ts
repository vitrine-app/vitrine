import * as fs from 'fs-extra';
import * as path from 'path';

import { getEnvFolder } from './env';
import { PotentialGame } from './PotentialGame';

export enum SortParameter {
	NAME = 'name',
	DEVELOPER = 'developer',
	PUBLISHER = 'publisher',
	RELEASE_DATE = 'releaseDate',
	RATING = 'rating'
}

export class PlayableGame extends PotentialGame {
	public timePlayed: number;

	public constructor(name: string, details?: any) {
		super(name, details);
		this.timePlayed = 0;
	}

	public addPlayTime(timePlayed: number, errorCallback?: (error: Error) => void) {
		this.timePlayed += timePlayed;

		const configFilePath: string = path.resolve(getEnvFolder('games'), this.uuid, 'config.json');
		fs.writeFile(configFilePath, JSON.stringify(this, null, 2), (error: Error) => {
			if (error && errorCallback)
				errorCallback(error);
		});
	}
}
