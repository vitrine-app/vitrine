import { Action, ActionType } from '../actions/actionsTypes';

export function addGameModalVisible(state: boolean = false, action: Action) {
	switch (action.type) {
		case ActionType.OPEN_ADD_GAME_MODAL:
			return action.payload.addGameModalVisible;
		case ActionType.CLOSE_ADD_GAME_MODAL:
			return action.payload.addGameModalVisible;
		default:
			return state;
	}
}
