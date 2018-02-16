import { PlayableGame } from '../../models/PlayableGame';
import { PotentialGame } from '../../models/PotentialGame';
import { GamesCollection } from '../../models/GamesCollection';

export interface VitrineState {
	settings: any,
	potentialGames: GamesCollection<PotentialGame>,
	launchedGame: PlayableGame,
	refreshingGames: boolean
}

export const initialState = {
	settings: null,
	potentialGames: new GamesCollection<PotentialGame>(),
	launchedGame: null,
	refreshingGames: false,
};
