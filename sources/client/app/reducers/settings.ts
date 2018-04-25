import { Action, ActionType } from '../actions/actionsTypes';

export function settings(state: any = {}, action: Action): any {
	switch (action.type) {
		case ActionType.UPDATE_SETTINGS:
			return action.payload.settings;
		default:
			return state;
	}
}

export function modulesConfig(state: any = {}, action: Action): any {
	switch (action.type) {
		case ActionType.UPDATE_MODULES_CONFIG:
			return action.payload.modulesConfig;
		default:
			return state;
	}
}
