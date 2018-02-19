import { connect, Dispatch } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { SideBar as VisualSideBar } from '../components/SideBar';
import { Action } from '../actions/actionsTypes';
import { refreshGames, selectGame } from '../actions/games';
import { PlayableGame } from '../../../models/PlayableGame';

const mapStateToProps = (state: VitrineState) => ({
	potentialGames: state.potentialGames,
	playableGames: state.playableGames,
	selectedGame: state.selectedGame,
	refreshingGames: state.refreshingGames
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	selectGame: (selectedGame: PlayableGame) => dispatch(selectGame(selectedGame)),
	refreshGames: () => dispatch(refreshGames())
});

export const SideBar = connect(mapStateToProps, mapDispatchToProps)(VisualSideBar);
