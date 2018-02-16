import { connect } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { LaunchedGameContainer as VisualLaunchedGameContainer } from '../components/LaunchedGameContainer';

const mapStateToProps = (state: VitrineState) => ({
	launchedGame: state.launchedGame
});

const mapDispatchToProps = () => ({});

export const LaunchedGameContainer = connect(mapStateToProps, mapDispatchToProps)(VisualLaunchedGameContainer);
