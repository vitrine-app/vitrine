import { connect } from 'react-redux';

import { AppState } from '../AppState';
import { LaunchedGameContainer as VisualLaunchedGameContainer } from '../components/LaunchedGameContainer';

const mapStateToProps = (state: AppState) => ({
	launchedGame: state.launchedGame
});

const mapDispatchToProps = () => ({});

export const LaunchedGameContainer = connect(mapStateToProps, mapDispatchToProps)(VisualLaunchedGameContainer);
