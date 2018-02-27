import { connect, Dispatch } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { ContextMenu as VisualContextMenu } from '../components/ContextMenu';
import { Action } from '../actions/actionsTypes';
import { launchGame, removePlayableGame } from '../actions/games';
import { openTimePlayedEditionModal } from '../actions/modals';
import { PlayableGame } from '../../../models/PlayableGame';

const mapStateToProps = (state: VitrineState) => ({
	playableGames: state.playableGames
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	launchGame: (launchedGame: PlayableGame) => {
		dispatch(launchGame(launchedGame))
	},
	openTimePlayedEditionModal: () => {
		dispatch(openTimePlayedEditionModal())
	},
	removePlayableGame: (gameUuid: string, selectedGame: PlayableGame) => {
		dispatch(removePlayableGame(gameUuid, selectedGame))
	}
});

export const ContextMenu = connect(mapStateToProps, mapDispatchToProps)(VisualContextMenu);
