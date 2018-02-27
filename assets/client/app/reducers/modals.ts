import { Action, ActionType } from '../actions/actionsTypes';

export function addGameModalVisible(state: boolean = false, action: Action): boolean {
	switch (action.type) {
		case ActionType.OPEN_ADD_GAME_MODAL:
			return action.payload.addGameModalVisible;
		case ActionType.CLOSE_ADD_GAME_MODAL:
			return action.payload.addGameModalVisible;
		default:
			return state;
	}
}

export function igdbResearchModalVisible(state: boolean = false, action: Action): boolean {
	switch (action.type) {
		case ActionType.OPEN_IGDB_RESEARCH_MODAL:
			return action.payload.igdbResearchModalVisible;
		case ActionType.CLOSE_IGDB_RESEARCH_MODAL:
			return action.payload.igdbResearchModalVisible;
		default:
			return state;
	}
}

export function timePlayedEditionModalVisible(state: boolean = false, action: Action): boolean {
	switch (action.type) {
		case ActionType.OPEN_TIME_PLAYED_EDITION_MODAL:
			return action.payload.timePlayedEditionModalVisible;
		case ActionType.CLOSE_TIME_PLAYED_EDITION_MODAL:
			return action.payload.timePlayedEditionModalVisible;
		default:
			return state;
	}
}
