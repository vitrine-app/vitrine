import { GamesCollection } from '../../../models/GamesCollection';
import { PlayableGame, SortParameter } from '../../../models/PlayableGame';
import { PotentialGame } from '../../../models/PotentialGame';
import { Action, ActionType } from '../actions/actionsTypes';

export function refreshingGames(state: boolean = false, action: Action): boolean {
  switch (action.type) {
    case ActionType.REFRESH_GAMES:
      return action.payload.refreshingGames;
    case ActionType.ADD_POTENTIAL_GAMES:
      return action.payload.refreshingGames;
    default:
      return state;
  }
}

export function potentialGames(state: GamesCollection<PotentialGame> = null, action: Action): GamesCollection<PotentialGame> {
  switch (action.type) {
    case ActionType.ADD_POTENTIAL_GAMES:
      return new GamesCollection<PotentialGame>(action.payload.potentialGames);
    case ActionType.SET_POTENTIAL_GAMES:
      return new GamesCollection<PotentialGame>(action.payload.potentialGames);
    default:
      return state;
  }
}

export function playableGames(state: GamesCollection<PlayableGame> = null, action: Action): GamesCollection<PlayableGame> {
  switch (action.type) {
    case ActionType.ADD_PLAYABLE_GAMES:
      return new GamesCollection<PlayableGame>(action.payload.playableGames);
    case ActionType.EDIT_PLAYABLE_GAME:
      return new GamesCollection<PlayableGame>(action.payload.playableGames);
    case ActionType.REMOVE_PLAYABLE_GAME:
      return new GamesCollection<PlayableGame>(state.getGames()).removeGame(action.payload.gameUuid);
    case ActionType.SET_PLAYABLE_GAMES:
      return new GamesCollection<PlayableGame>(action.payload.playableGames);
    case ActionType.STOP_GAME:
      return new GamesCollection<PlayableGame>(state.getGames()).editGame(action.payload.playedGame);
    case ActionType.SORT_GAMES:
      return new GamesCollection<PlayableGame>(action.payload.playableGames);
    default:
      return state;
  }
}

export function selectedGame(state: PlayableGame = null, action: Action): PlayableGame {
  switch (action.type) {
    case ActionType.SELECT_GAME:
      return action.payload.selectedGame;
    case ActionType.ADD_PLAYABLE_GAMES:
      return action.payload.selectedGame;
    case ActionType.STOP_GAME:
      return action.payload.playedGame;
    default:
      return state;
  }
}

export function launchedGame(state: PlayableGame = null, action: Action): PlayableGame {
  switch (action.type) {
    case ActionType.LAUNCH_GAME:
      return action.payload.launchedGame;
    case ActionType.STOP_GAME:
      return action.payload.launchedGame;
    default:
      return state;
  }
}

export function potentialGameToAdd(state: PotentialGame = null, action: Action): PotentialGame {
  switch (action.type) {
    case ActionType.SET_POTENTIAL_GAME_TO_ADD:
      return action.payload.potentialGameToAdd;
    case ActionType.ADD_PLAYABLE_GAMES:
      return action.payload.potentialGameToAdd;
    case ActionType.EDIT_PLAYABLE_GAME:
      return action.payload.potentialGameToAdd;
    default:
      return state;
  }
}

export function gameToEdit(state: PlayableGame = null, action: Action): PlayableGame {
  switch (action.type) {
    case ActionType.SET_GAME_TO_EDIT:
      return action.payload.gameToEdit;
    case ActionType.EDIT_PLAYABLE_GAME:
      return action.payload.gameToEdit;
    default:
      return state;
  }
}

export function gamesSortParameter(state: SortParameter = null, action: Action): SortParameter {
  switch (action.type) {
    case ActionType.SORT_GAMES:
      return action.payload.gamesSortParameter;
    default:
      return state;
  }
}
