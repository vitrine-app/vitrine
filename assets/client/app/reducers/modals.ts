import { Action, ActionType } from '../actions/actionsTypes';

export function gameAddModalVisible(state: boolean = false, action: Action): boolean {
	switch (action.type) {
		case ActionType.OPEN_GAME_ADD_MODAL:
			return action.payload.GameAddModalVisible;
		case ActionType.CLOSE_GAME_ADD_MODAL:
			return action.payload.GameAddModalVisible;
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

export function potentialGamesAddModalVisible(state: boolean = false, action: Action): boolean {
	switch (action.type) {
		case ActionType.OPEN_POTENTIAL_GAMES_ADD_MODAL:
			return action.payload.potentialGamesAddModalVisible;
		case ActionType.CLOSE_POTENTIAL_GAMES_ADD_MODAL:
			return action.payload.potentialGamesAddModalVisible;
		default:
			return state;
	}
}

export function settingsModalVisible(state: boolean = false, action: Action): boolean {
	switch (action.type) {
		case ActionType.OPEN_SETTINGS_MODAL:
			return action.payload.settingsModalVisible;
		case ActionType.CLOSE_SETTINGS_MODAL:
			return action.payload.settingsModalVisible;
		default:
			return state;
	}
}
