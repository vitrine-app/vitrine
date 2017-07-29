import { PotentialGame } from './PotentialGame';

export class PlayableGame extends PotentialGame {
	public timePlayed: number;

	public static toPlayableGame(game: PotentialGame) {
		let playableGame: PlayableGame = <PlayableGame>game;
		playableGame.timePlayed = 0;
		return playableGame;
	}
}
