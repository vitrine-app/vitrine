import { Action, ActionType } from '../actions/actionsTypes';
import { PlayableGame } from '../../../models/PlayableGame';

export function launchedGame(state: PlayableGame = null, action: Action): PlayableGame {
	switch (action.type) {
		case ActionType.LAUNCH_GAME:
			return action.payload.launchedGame;
		default:
			return state;
	}
}
