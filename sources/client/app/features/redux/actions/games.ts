import { PlayableGame, SortParameter } from '@models/PlayableGame';
import { PotentialGame } from '@models/PotentialGame';
import { getSortedGamesFromStore } from '../AppState';
import { Action, ActionType } from './actionsTypes';

export function refreshGames(): Action {
  return {
    payload: {
      refreshingGames: true
    },
    type: ActionType.REFRESH_GAMES
  };
}

export function addPotentialGames(potentialGames: PotentialGame[]): Action {
  return {
    payload: {
      potentialGames,
      refreshingGames: false
    },
    type: ActionType.ADD_POTENTIAL_GAMES
  };
}

export function addPlayableGames(unsortedGames: PlayableGame[]): Action {
  const playableGames: PlayableGame[] = getSortedGamesFromStore({
    playableGames: unsortedGames
  });
  return {
    payload: {
      playableGames,
      potentialGameToAdd: null,
      selectedGame: unsortedGames.length ? (unsortedGames.length > 1 ? playableGames[0] : unsortedGames[0]) : null
    },
    type: ActionType.ADD_PLAYABLE_GAMES
  };
}

export function editPlayableGame(editedGame: PlayableGame): Action {
  const playableGames: PlayableGame[] = getSortedGamesFromStore({ editedGame });
  return {
    payload: {
      editedGame,
      gameToEdit: null,
      playableGames,
      potentialGameToAdd: null
    },
    type: ActionType.EDIT_PLAYABLE_GAME
  };
}

export function removePlayableGame(gameUuid: string): Action {
  return {
    payload: {
      gameUuid
    },
    type: ActionType.REMOVE_PLAYABLE_GAME
  };
}

export function setPotentialGames(potentialGames: PotentialGame[]): Action {
  return {
    payload: {
      potentialGames
    },
    type: ActionType.SET_POTENTIAL_GAMES
  };
}

export function setPlayableGames(playableGames: PlayableGame[]): Action {
  return {
    payload: {
      playableGames
    },
    type: ActionType.SET_PLAYABLE_GAMES
  };
}

export function launchGame(launchedGame: PlayableGame): Action {
  return {
    payload: {
      launchedGame
    },
    type: ActionType.LAUNCH_GAME
  };
}

export function stopGame(playedGame: PlayableGame): Action {
  return {
    payload: {
      launchedGame: null,
      playedGame
    },
    type: ActionType.STOP_GAME
  };
}

export function selectGame(selectedGame: PlayableGame): Action {
  return {
    payload: {
      selectedGame
    },
    type: ActionType.SELECT_GAME
  };
}

export function setPotentialGameToAdd(potentialGameToAdd: PotentialGame): Action {
  return {
    payload: {
      potentialGameToAdd
    },
    type: ActionType.SET_POTENTIAL_GAME_TO_ADD
  };
}

export function setGameToEdit(gameToEdit: PlayableGame): Action {
  return {
    payload: {
      gameToEdit
    },
    type: ActionType.SET_GAME_TO_EDIT
  };
}

export function sortGames(gamesSortParameter: SortParameter): Action {
  const playableGames: PlayableGame[] = getSortedGamesFromStore({
    gamesSortParameter
  });
  return {
    payload: {
      gamesSortParameter,
      playableGames
    },
    type: ActionType.SORT_GAMES
  };
}
