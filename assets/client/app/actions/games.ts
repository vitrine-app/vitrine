import { Action, ActionType } from './actionsTypes';
import { PlayableGame } from '../../../models/PlayableGame';

export function launchGame(launchedGame: PlayableGame): Action {
	return {
		type: ActionType.LAUNCH_GAME,
		payload: {
			launchedGame
		}
	}
}
