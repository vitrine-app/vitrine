import { Action, ActionType } from './actionsTypes';
import { PlayableGame } from '../../../models/PlayableGame';
import { PotentialGame } from '../../../models/PotentialGame';

export function launchGame(launchedGame: PlayableGame): Action {
	return {
		type: ActionType.LAUNCH_GAME,
		payload: {
			launchedGame
		}
	}
}

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
