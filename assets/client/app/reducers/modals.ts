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

export function igdbResearchModalVisible(state: boolean = false, action: Action) {
	switch (action.type) {
		case ActionType.OPEN_IGDB_RESEARCH_MODAL:
			return action.payload.igdbResearchModalVisible;
		case ActionType.CLOSE_IGDB_RESEARCH_MODAL:
			return action.payload.igdbResearchModalVisible;
		default:
			return state;
	}
}
