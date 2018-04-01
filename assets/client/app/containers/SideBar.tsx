import { connect, Dispatch } from 'react-redux';

import { PlayableGame } from '../../../models/PlayableGame';
import { Action } from '../actions/actionsTypes';
import { refreshGames, selectGame } from '../actions/games';
import { openGameAddModal, openPotentialGamesAddModal, openSettingsModal } from '../actions/modals';
import { AppState } from '../AppState';
import { SideBar as VisualSideBar } from '../components/SideBar';

const mapStateToProps = (state: AppState) => ({
	potentialGames: state.potentialGames,
	playableGames: state.playableGames,
	selectedGame: state.selectedGame,
	refreshingGames: state.refreshingGames
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	selectGame: (selectedGame: PlayableGame) => {
		dispatch(selectGame(selectedGame));
	},
	refreshGames: () => {
		dispatch(refreshGames());
	},
	openGameAddModal: () => {
		dispatch(openGameAddModal());
	},
	openPotentialGamesAddModal: () => {
		dispatch(openPotentialGamesAddModal());
	},
	openSettingsModal: () => {
		dispatch(openSettingsModal());
	}
});

export const SideBar = connect(mapStateToProps, mapDispatchToProps)(VisualSideBar);
