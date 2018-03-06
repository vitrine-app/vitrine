import { connect, Dispatch } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { ContextMenu as VisualContextMenu } from '../components/ContextMenu';
import { Action } from '../actions/actionsTypes';
import { launchGame, setGameToEdit } from '../actions/games';
import { openGameAddModal, openTimePlayedEditionModal } from '../actions/modals';
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
	openGameAddModal: () => {
		dispatch(openGameAddModal())
	},
	openTimePlayedEditionModal: () => {
		dispatch(openTimePlayedEditionModal())
	}
});

export const ContextMenu = connect(mapStateToProps, mapDispatchToProps)(VisualContextMenu);
