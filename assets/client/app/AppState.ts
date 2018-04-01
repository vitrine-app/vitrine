import { GamesCollection } from '../../models/GamesCollection';
import { PlayableGame } from '../../models/PlayableGame';
import { PotentialGame } from '../../models/PotentialGame';

export interface AppState {
	settings: any;
	potentialGames: GamesCollection<PotentialGame>;
	playableGames: GamesCollection<PlayableGame>;
	selectedGame: PlayableGame;
	launchedGame: PlayableGame;
	refreshingGames: boolean;
	potentialGameToAdd: PotentialGame;
	gameToEdit: PlayableGame;
	gameAddModalVisible: boolean;
	igdbResearchModalVisible: boolean;
	timePlayedEditionModalVisible: boolean;
	potentialGamesAddModalVisible: boolean;
	settingsModalVisible: boolean;
}

export const initialState: AppState = {
	settings: null,
	potentialGames: new GamesCollection<PotentialGame>(),
	playableGames: new GamesCollection<PlayableGame>(),
	selectedGame: null,
	launchedGame: null,
	refreshingGames: false,
	potentialGameToAdd: null,
	gameToEdit: null,
	gameAddModalVisible: false,
	igdbResearchModalVisible: false,
	timePlayedEditionModalVisible: false,
	potentialGamesAddModalVisible: false,
	settingsModalVisible: false
};
