import { Action, ActionType } from './actionsTypes';

export function updateSettings(settings: any): Action {
	return {
		type: ActionType.UPDATE_SETTINGS,
		payload: {
			settings
		}
	}
}
