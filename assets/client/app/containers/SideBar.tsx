import { connect, Dispatch } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { SideBar as VisualSideBar } from '../components/SideBar';
import { Action } from '../actions/actionsTypes';
import { selectGame } from '../actions/games';
import { PlayableGame } from '../../../models/PlayableGame';

const mapStateToProps = (state: VitrineState) => ({
	playableGames: state.playableGames,
	selectedGame: state.selectedGame
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	selectGame: (selectedGame: PlayableGame) => dispatch(selectGame(selectedGame))
});

export const SideBar = connect(mapStateToProps, mapDispatchToProps)(VisualSideBar);
