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
	gameToEdit: PlayableGame,
	addGameModalVisible: boolean,
	igdbResearchModalVisible: boolean,
	timePlayedEditionModalVisible: boolean
}

export const initialState: VitrineState = {
	settings: null,
	potentialGames: new GamesCollection<PotentialGame>(),
	playableGames: new GamesCollection<PlayableGame>(),
	selectedGame: null,
	launchedGame: null,
	refreshingGames: false,
	potentialGameToAdd: null,
	gameToEdit: null,
	addGameModalVisible: false,
	igdbResearchModalVisible: false,
	timePlayedEditionModalVisible: false
};
