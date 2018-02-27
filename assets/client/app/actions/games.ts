import { Action, ActionType } from './actionsTypes';
import { PlayableGame } from '../../../models/PlayableGame';
import { PotentialGame } from '../../../models/PotentialGame';

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

export function addPlayableGames(playableGames: PlayableGame[]): Action {
	return {
		type: ActionType.ADD_PLAYABLE_GAMES,
		payload: {
			playableGames,
			selectedGame: (playableGames.length) ? (playableGames[0]) : (null),
			potentialGameToAdd: null
		}
	};
}

export function editPlayableGame(playableGame: PlayableGame): Action {
	return {
		type: ActionType.EDIT_PLAYABLE_GAME,
		payload: {
			playableGame,
			potentialGameToAdd: null,
			gameToEdit: null
		}
	};
}

export function removePlayableGame(gameUuid: string, selectedGame: PlayableGame): Action {
	return {
		type: ActionType.REMOVE_PLAYABLE_GAME,
		payload: {
			gameUuid,
			selectedGame
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
	}
}
