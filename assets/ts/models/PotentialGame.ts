import {uuidV5} from '../server/helpers';

export class PotentialGame {
	public commandLine: string[];
	public uuid: string;

	public constructor(public name: string, public details?: any) {
		this.commandLine = [];
		this.uuid = uuidV5(this.name);
	}
}
