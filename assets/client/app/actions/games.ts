import { Action, ActionType } from './actionsTypes';
import { PlayableGame } from '../../../models/PlayableGame';
import { PotentialGame } from '../../../models/PotentialGame';

export function refreshGames(): Action {
	return {
		type: ActionType.REFRESH_GAMES,
		payload: {
			refreshingGames: true
		}
	}
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
			playableGames
		}
	}
}

export function editPlayableGame(playableGame: PlayableGame): Action {
	return {
		type: ActionType.EDIT_PLAYABLE_GAME,
		payload: {
			playableGame
		}
	};
}

export function removePlayableGame(gameUuid: string): Action {
	return {
		type: ActionType.REMOVE_PLAYABLE_GAME,
		payload: {
			gameUuid
		}
	}
}

export function launchGame(launchedGame: PlayableGame): Action {
	return {
		type: ActionType.LAUNCH_GAME,
		payload: {
			launchedGame
		}
	}
}

export function stopGame(playedGame: PlayableGame): Action {
	return {
		type: ActionType.STOP_GAME,
		payload: {
			playedGame,
			launchedGame: null
		}
	}
}
