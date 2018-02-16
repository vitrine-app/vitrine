import { connect, Dispatch } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { TaskBar as VisualTaskBar } from '../components/TaskBar';
import { Action } from '../actions/actionsTypes';
import { refreshGames } from '../actions/games';

const mapStateToProps = (state: VitrineState) => ({
	potentialGames: state.potentialGames,
	refreshingGames: state.refreshingGames
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	refreshGames: () => dispatch(refreshGames())
});

export const TaskBar = connect(mapStateToProps, mapDispatchToProps)(VisualTaskBar);
