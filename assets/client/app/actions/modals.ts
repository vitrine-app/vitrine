import { Action, ActionType } from './actionsTypes';

export function openAddGameModal(): Action {
	return {
		type: ActionType.OPEN_ADD_GAME_MODAL,
		payload: {
			addGameModalVisible: true
		}
	};
}

export function closeAddGameModal(): Action {
	return {
		type: ActionType.CLOSE_ADD_GAME_MODAL,
		payload: {
			addGameModalVisible: false
		}
	};
}
