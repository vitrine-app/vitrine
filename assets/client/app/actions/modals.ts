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

export function openIgdbResearchModal(): Action {
	return {
		type: ActionType.OPEN_IGDB_RESEARCH_MODAL,
		payload: {
			igdbResearchModalVisible: true
		}
	}
}

export function closeIgdbResearchModal(): Action {
	return {
		type: ActionType.CLOSE_IGDB_RESEARCH_MODAL,
		payload: {
			igdbResearchModalVisible: false
		}
	}
}

export function openTimePlayedEditionModal(): Action {
	return {
		type: ActionType.OPEN_TIME_PLAYED_EDITION_MODAL,
		payload: {
			timePlayedEditionModalVisible: true
		}
	};
}

export function closeTimePlayedEditionModal(): Action {
	return {
		type: ActionType.CLOSE_TIME_PLAYED_EDITION_MODAL,
		payload: {
			timePlayedEditionModalVisible: false
		}
	};
}
