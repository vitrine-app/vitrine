import { uuidV5 } from '../server/helpers';

export enum GameSource {
	LOCAL,
	STEAM,
	BATTLE_NET,
	ORIGIN
}

export class PotentialGame {
	public commandLine: string[];
	public uuid: string;
	public source: GameSource;

	public constructor(public name: string, public details?: any) {
		this.commandLine = [];
		this.uuid = uuidV5(this.name);
		if (!this.details)
			this.details = {};
	}
}
