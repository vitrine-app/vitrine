export interface Action {
	type: ActionType,
	payload: any
}

export enum ActionType {
	UPDATE_SETTINGS,

	REFRESH_GAMES,
	ADD_POTENTIAL_GAMES,
	ADD_PLAYABLE_GAMES,
	EDIT_PLAYABLE_GAME,
	REMOVE_PLAYABLE_GAME,
	LAUNCH_GAME,
	STOP_GAME
}
