import { connect } from 'react-redux';

import { AppState } from '../AppState';
import { GameContainer as VisualGameContainer } from '../components/GameContainer';

const mapStateToProps = (state: AppState) => ({
	selectedGame: state.selectedGame
});

const mapDispatchToProps = () => ({});

export const GameContainer = connect(mapStateToProps, mapDispatchToProps)(VisualGameContainer);
