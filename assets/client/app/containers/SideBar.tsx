import { connect, Dispatch } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { SideBar as VisualSideBar } from '../components/SideBar';
import { Action } from '../actions/actionsTypes';
import { refreshGames } from '../actions/games';

const mapStateToProps = (state: VitrineState) => ({
	playableGames: state.playableGames,
	selectedGame: state.selectedGame
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
});

export const SideBar = connect(mapStateToProps, mapDispatchToProps)(VisualSideBar);
