import { Action, ActionType } from '../actions/actionsTypes';
import { PlayableGame } from '../../../models/PlayableGame';
import { PotentialGame } from '../../../models/PotentialGame';
import { GamesCollection } from '../../../models/GamesCollection';

export function launchedGame(state: PlayableGame = null, action: Action): PlayableGame {
	switch (action.type) {
		case ActionType.LAUNCH_GAME:
			return action.payload.launchedGame;
		default:
			return state;
	}
}

export function refreshingGames(state: boolean = false, action: Action): boolean {
	switch (action.type) {
		case ActionType.REFRESH_GAMES:
			return action.payload.refreshingGames;
		case ActionType.ADD_POTENTIAL_GAMES:
			return action.payload.refreshingGames;
		default:
			return state;
	}
}

export function potentialGames(state: GamesCollection<PotentialGame> = null, action: Action): GamesCollection<PotentialGame> {
	switch (action.type) {
		case ActionType.ADD_POTENTIAL_GAMES:
			return new GamesCollection<PotentialGame>(action.payload.potentialGames);
		default:
			return state;
	}
}
