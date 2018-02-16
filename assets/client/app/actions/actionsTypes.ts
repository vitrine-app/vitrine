export interface Action {
	type: ActionType,
	payload: any
}

export enum ActionType {
	UPDATE_SETTINGS
}
