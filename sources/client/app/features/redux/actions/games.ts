import { PlayableGame, SortParameter } from '../../../../../models/PlayableGame';
import { PotentialGame } from '../../../../../models/PotentialGame';
import { getSortedGamesFromStore } from '../AppState';
import { Action, ActionType } from './actionsTypes';

export function refreshGames(): Action {
  return {
    type: ActionType.REFRESH_GAMES,
    payload: {
      refreshingGames: true
    }
  };
}

export function addPotentialGames(potentialGames: PotentialGame[]): Action {
  return {
    type: ActionType.ADD_POTENTIAL_GAMES,
    payload: {
      potentialGames,
      refreshingGames: false
    }
  };
}

export function addPlayableGames(unsortedGames: PlayableGame[]): Action {
  const playableGames: PlayableGame[] = getSortedGamesFromStore({
    playableGames: unsortedGames
  });
  return {
    type: ActionType.ADD_PLAYABLE_GAMES,
    payload: {
      playableGames,
      selectedGame: unsortedGames.length ? (unsortedGames.length > 1 ? playableGames[0] : unsortedGames[0]) : null,
      potentialGameToAdd: null
    }
  };
}

export function editPlayableGame(editedGame: PlayableGame): Action {
  const playableGames: PlayableGame[] = getSortedGamesFromStore({ editedGame });
  return {
    type: ActionType.EDIT_PLAYABLE_GAME,
    payload: {
      playableGames,
      editedGame,
      potentialGameToAdd: null,
      gameToEdit: null
    }
  };
}

export function removePlayableGame(gameUuid: string): Action {
  return {
    type: ActionType.REMOVE_PLAYABLE_GAME,
    payload: {
      gameUuid
    }
  };
}

export function setPotentialGames(potentialGames: PotentialGame[]): Action {
  return {
    type: ActionType.SET_POTENTIAL_GAMES,
    payload: {
      potentialGames
    }
  };
}

export function setPlayableGames(playableGames: PlayableGame[]): Action {
  return {
    type: ActionType.SET_PLAYABLE_GAMES,
    payload: {
      playableGames
    }
  };
}

export function launchGame(launchedGame: PlayableGame): Action {
  return {
    type: ActionType.LAUNCH_GAME,
    payload: {
      launchedGame
    }
  };
}

export function stopGame(playedGame: PlayableGame): Action {
  return {
    type: ActionType.STOP_GAME,
    payload: {
      playedGame,
      launchedGame: null
    }
  };
}

export function selectGame(selectedGame: PlayableGame): Action {
  return {
    type: ActionType.SELECT_GAME,
    payload: {
      selectedGame
    }
  };
}

export function setPotentialGameToAdd(potentialGameToAdd: PotentialGame): Action {
  return {
    type: ActionType.SET_POTENTIAL_GAME_TO_ADD,
    payload: {
      potentialGameToAdd
    }
  };
}

export function setGameToEdit(gameToEdit: PlayableGame): Action {
  return {
    type: ActionType.SET_GAME_TO_EDIT,
    payload: {
      gameToEdit
    }
  };
}

export function sortGames(gamesSortParameter: SortParameter): Action {
  const playableGames: PlayableGame[] = getSortedGamesFromStore({ gamesSortParameter });
  return {
    type: ActionType.SORT_GAMES,
    payload: {
      gamesSortParameter,
      playableGames
    }
  };
}
