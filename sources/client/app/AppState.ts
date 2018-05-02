import { applyMiddleware, combineReducers, createStore, Store } from 'redux';

import { GamesCollection } from '../../models/GamesCollection';
import { PlayableGame, SortParameter } from '../../models/PlayableGame';
import { PotentialGame } from '../../models/PotentialGame';
import { reduxLog } from './helpers';
import {
	gamesSortParameter,
	gameToEdit,
	launchedGame,
	playableGames,
	potentialGames,
	potentialGameToAdd,
	refreshingGames,
	selectedGame
} from './reducers/games';
import {
	gameAddModalVisible,
	igdbResearchModalVisible,
	potentialGamesAddModalVisible,
	settingsModalVisible,
	timePlayedEditionModalVisible
} from './reducers/modals';
import { modulesConfig, settings } from './reducers/settings';

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

export const vitrineStore: Store<AppState> = createStore(combineReducers({
	settings,
	modulesConfig,
	potentialGames,
	playableGames,
	selectedGame,
	launchedGame,
	refreshingGames,
	potentialGameToAdd,
	gameToEdit,
	gamesSortParameter,
	gameAddModalVisible,
	igdbResearchModalVisible,
	timePlayedEditionModalVisible,
	potentialGamesAddModalVisible,
	settingsModalVisible
}), {
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
}, applyMiddleware(reduxLog));

export function getSortedGamesFromStore(playableGames?: PlayableGame[], sortParameter?: SortParameter): PlayableGame[] {
	const sortedGames: PlayableGame[] = [ ...(playableGames) ? (playableGames) : (vitrineStore.getState().playableGames.getGames()) ];
	sortParameter = sortParameter || vitrineStore.getState().gamesSortParameter;
	switch (sortParameter) {
		case (SortParameter.NAME): {
			return sortedGames.sort((gameA: PlayableGame, gameB: PlayableGame): number => {
				return (gameA.name > gameB.name) ? (1) : (-1);
			});
		}
		default:
			return sortedGames.sort((gameA: PlayableGame, gameB: PlayableGame): number => {
				if (!gameA.details[sortParameter])
					return 1;
				if (!gameB.details[sortParameter])
					return -1;
				const result: number = (sortParameter !== SortParameter.RATING && sortParameter !== SortParameter.RELEASE_DATE) ? (1) : (-1);
				return (gameA.details[sortParameter] > gameB.details[sortParameter]) ? (result) : (-result);
			});
	}
}
