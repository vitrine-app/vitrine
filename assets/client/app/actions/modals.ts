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

export function openIgdbModal(): Action {
	return {
		type: ActionType.OPEN_IGDB_RESEARCH_MODAL,
		payload: {
			igdbResearchModalVisible: true
		}
	}
}

export function closeIgdbModal(): Action {
	return {
		type: ActionType.CLOSE_IGDB_RESEARCH_MODAL,
		payload: {
			igdbResearchModalVisible: false
		}
	}
}
