import { GamesCollection } from '../../models/GamesCollection';
import { PlayableGame, SortParameter } from '../../models/PlayableGame';
import { PotentialGame } from '../../models/PotentialGame';

export interface AppState {
	settings: any;
	modulesConfig: any;
	potentialGames: GamesCollection<PotentialGame>;
	playableGames: GamesCollection<PlayableGame>;
	selectedGame: PlayableGame;
	launchedGame: PlayableGame;
	refreshingGames: boolean;
	potentialGameToAdd: PotentialGame;
	gameToEdit: PlayableGame;
	gamesSortParameter: SortParameter;
	gameAddModalVisible: boolean;
	igdbResearchModalVisible: boolean;
	timePlayedEditionModalVisible: boolean;
	potentialGamesAddModalVisible: boolean;
	settingsModalVisible: boolean;
}

export const initialState: AppState = {
	settings: null,
	modulesConfig: null,
	potentialGames: new GamesCollection<PotentialGame>(),
	playableGames: new GamesCollection<PlayableGame>(),
	selectedGame: null,
	launchedGame: null,
	refreshingGames: false,
	potentialGameToAdd: null,
	gameToEdit: null,
	gamesSortParameter: SortParameter.NAME,
	gameAddModalVisible: false,
	igdbResearchModalVisible: false,
	timePlayedEditionModalVisible: false,
	potentialGamesAddModalVisible: false,
	settingsModalVisible: false
};
