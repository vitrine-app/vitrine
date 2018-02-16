import { Action, ActionType } from '../actions/actionsTypes';

export function settings(state: any = {}, action: Action): any {
	switch (action.type) {
		case ActionType.UPDATE_SETTINGS:
			return action.payload.settings;
		default:
			return state;
	}
}
