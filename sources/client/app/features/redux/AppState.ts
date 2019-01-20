import { applyMiddleware, combineReducers, createStore, Store } from 'redux';

import { GamesCollection } from '@models/GamesCollection';
import { PlayableGame, SortParameter } from '@models/PlayableGame';
import { PotentialGame } from '@models/PotentialGame';
import { reduxLog } from '../../helpers';
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

export const vitrineStore: Store<any> = createStore(
  combineReducers({
    gameAddModalVisible,
    gameToEdit,
    gamesSortParameter,
    igdbResearchModalVisible,
    internetConnection,
    launchedGame,
    locale,
    locales,
    modulesConfig,
    playableGames,
    potentialGameToAdd,
    potentialGames,
    potentialGamesAddModalVisible,
    refreshingGames,
    selectedGame,
    settings,
    settingsModalVisible,
    timePlayedEditionModalVisible
  }),
  {
    gameAddModalVisible: false,
    gameToEdit: null,
    gamesSortParameter: SortParameter.NAME,
    igdbResearchModalVisible: false,
    internetConnection: true,
    launchedGame: null,
    locale: 'en',
    locales: [],
    modulesConfig: null,
    playableGames: new GamesCollection<PlayableGame>(),
    potentialGameToAdd: null,
    potentialGames: new GamesCollection<PotentialGame>(),
    potentialGamesAddModalVisible: false,
    refreshingGames: false,
    selectedGame: null,
    settings: null,
    settingsModalVisible: false,
    timePlayedEditionModalVisible: false
  },
  applyMiddleware(reduxLog)
);

export function getSortedGamesFromStore(dispatchedData: any): PlayableGame[] {
  const { playableGames, editedGame, gamesSortParameter }: any = dispatchedData;
  const sortedGames: GamesCollection<PlayableGame> = new GamesCollection();

  if (playableGames && playableGames.length > 1) {
    sortedGames.addGames(playableGames);
  } else {
    sortedGames.addGames(vitrineStore.getState().playableGames.getGames());
  }

  if (playableGames && playableGames.length === 1) {
    sortedGames.addGame(playableGames[0]);
  }
  if (editedGame) {
    sortedGames.editGame(editedGame);
  }

  const sortParameter = gamesSortParameter || vitrineStore.getState().gamesSortParameter;
  switch (sortParameter) {
    case SortParameter.NAME: {
      return sortedGames.getGames().sort(
        (gameA: PlayableGame, gameB: PlayableGame): number => {
          return gameA.name > gameB.name ? 1 : -1;
        }
      );
    }
    case SortParameter.TIME_PLAYED: {
      return sortedGames.getGames().sort(
        (gameA: PlayableGame, gameB: PlayableGame): number => {
          return gameA.timePlayed < gameB.timePlayed ? 1 : -1;
        }
      );
    }
    default:
      return sortedGames.getGames().sort(
        (gameA: PlayableGame, gameB: PlayableGame): number => {
          if (!gameA.details[sortParameter]) {
            return 1;
          }
          if (!gameB.details[sortParameter]) {
            return -1;
          }
          const result: number = sortParameter !== SortParameter.RATING && sortParameter !== SortParameter.RELEASE_DATE ? 1 : -1;
          return gameA.details[sortParameter] > gameB.details[sortParameter] ? result : -result;
        }
      );
  }
}
