import { connect, Dispatch } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { ContextMenu as VisualContextMenu } from '../components/ContextMenu';
import { Action } from '../actions/actionsTypes';
import { launchGame, removePlayableGame, setGameToEdit } from '../actions/games';
import { openAddGameModal, openTimePlayedEditionModal } from '../actions/modals';
import { PlayableGame } from '../../../models/PlayableGame';

const mapStateToProps = (state: VitrineState) => ({
	playableGames: state.playableGames
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	launchGame: (launchedGame: PlayableGame) => {
		dispatch(launchGame(launchedGame))
	},
	setGameToEdit: (gameToEdit: PlayableGame) => {
		dispatch(setGameToEdit(gameToEdit))
	},
	openAddGameModal: () => {
		dispatch(openAddGameModal())
	},
	openTimePlayedEditionModal: () => {
		dispatch(openTimePlayedEditionModal())
	},
	removePlayableGame: (gameUuid: string, selectedGame: PlayableGame) => {
		dispatch(removePlayableGame(gameUuid, selectedGame))
	}
});

export const ContextMenu = connect(mapStateToProps, mapDispatchToProps)(VisualContextMenu);
