import { PlayableGame } from './PlayableGame';

export class PotentialGame {
	public commandLine: string[];
	public uuid: string;

	constructor(public name: string, public details?: any) {}
/*
	public toPlayableGame() {
		let playableGame: any = this;
		playableGame.timePlayed = 0;
		return <PlayableGame>playableGame;
	}*/

}
