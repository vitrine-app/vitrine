import { connect, Dispatch } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { Action } from '../actions/actionsTypes';
import { updateSettings } from '../actions/settings';
import { addPlayableGames, addPotentialGames, launchGame, removePlayableGame, selectGame, stopGame } from '../actions/games';
import { closeSettingsModal, openSettingsModal } from '../actions/modals';
import { Vitrine as VisualVitrine } from '../components/Vitrine';
import { PlayableGame } from '../../../models/PlayableGame';
import { PotentialGame } from '../../../models/PotentialGame';

const mapStateToProps = (state: VitrineState) => ({
	settings: state.settings,
	playableGames: state.playableGames,
	selectedGame: state.selectedGame,
	launchedGame: state.launchedGame
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	updateSettings: (settings: any) => {
		dispatch(updateSettings(settings));
	},
	addPotentialGames: (potentialGames: PotentialGame[]) => {
		dispatch(addPotentialGames(potentialGames));
	},
	addPlayableGames: (playableGames: PlayableGame[]) => {
		dispatch(addPlayableGames(playableGames));
	},
	removePlayableGame: (gameUuid: string, selectedGame: PlayableGame) => {
		dispatch(removePlayableGame(gameUuid, selectedGame));
	},
	launchGame: (launchedGame: PlayableGame) => {
		dispatch(launchGame(launchedGame));
	},
	stopGame: (playedGame: PlayableGame) => {
		dispatch(stopGame(playedGame));
	},
	selectGame: (selectedGame: PlayableGame) => {
		dispatch(selectGame(selectedGame));
	},
	openSettingsModal: () => {
		dispatch(openSettingsModal());
	},
	closeSettingsModal: () => {
		dispatch(closeSettingsModal());
	}
});

export const Vitrine = connect(mapStateToProps, mapDispatchToProps)(VisualVitrine);
