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
import { internetConnection, locale, locales, modulesConfig, settings } from './reducers/settings';

export interface AppState {
  locale: string;
  settings: any;
  modulesConfig: any;
  locales: any[];
  internetConnection: boolean;
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

export const vitrineStore: Store<any> = createStore(combineReducers({
  settings,
  modulesConfig,
  locales,
  locale,
  internetConnection,
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
  locales: [],
  locale: 'en',
  internetConnection: true,
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

export function getSortedGamesFromStore(dispatchedData: any): PlayableGame[] {
  const { playableGames, editedGame, gamesSortParameter }: any = dispatchedData;
  const sortedGames: GamesCollection<PlayableGame> = new GamesCollection();

  if (playableGames && playableGames.length > 1)
    sortedGames.addGames(playableGames);
  else
    sortedGames.addGames(vitrineStore.getState().playableGames.getGames());

  if (playableGames && playableGames.length === 1)
    sortedGames.addGame(playableGames[0]);
  if (editedGame)
    sortedGames.editGame(editedGame);

  const sortParameter = gamesSortParameter || vitrineStore.getState().gamesSortParameter;
  switch (sortParameter) {
    case (SortParameter.NAME): {
      return sortedGames.getGames().sort((gameA: PlayableGame, gameB: PlayableGame): number => {
        return (gameA.name > gameB.name) ? (1) : (-1);
      });
    }
    case (SortParameter.TIME_PLAYED): {
      return sortedGames.getGames().sort((gameA: PlayableGame, gameB: PlayableGame): number => {
        return (gameA.timePlayed < gameB.timePlayed) ? (1) : (-1);
      });
    }
    default:
      return sortedGames.getGames().sort((gameA: PlayableGame, gameB: PlayableGame): number => {
        if (!gameA.details[sortParameter])
          return 1;
        if (!gameB.details[sortParameter])
          return -1;
        const result: number = (sortParameter !== SortParameter.RATING && sortParameter !== SortParameter.RELEASE_DATE) ? (1) : (-1);
        return (gameA.details[sortParameter] > gameB.details[sortParameter]) ? (result) : (-result);
      });
  }
}
