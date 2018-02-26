import { PlayableGame } from '../../models/PlayableGame';
import { PotentialGame } from '../../models/PotentialGame';
import { GamesCollection } from '../../models/GamesCollection';

export interface VitrineState {
	settings: any,
	potentialGames: GamesCollection<PotentialGame>,
	playableGames: GamesCollection<PlayableGame>,
	selectedGame: PlayableGame,
	launchedGame: PlayableGame,
	refreshingGames: boolean,
	potentialGameToAdd: PotentialGame,
	addGameModalVisible: boolean
}

export const initialState: VitrineState = {
	settings: null,
	potentialGames: new GamesCollection<PotentialGame>(),
	playableGames: new GamesCollection<PlayableGame>(),
	selectedGame: null,
	launchedGame: null,
	refreshingGames: false,
	potentialGameToAdd: null,
	addGameModalVisible: false
};
