import { connect } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { GameContainer as VisualGameContainer } from '../components/GameContainer';

const mapStateToProps = (state: VitrineState) => ({
	selectedGame: state.selectedGame
});

const mapDispatchToProps = () => ({});

export const GameContainer = connect(mapStateToProps, mapDispatchToProps)(VisualGameContainer);
