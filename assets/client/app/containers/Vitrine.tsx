import { connect, Dispatch } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { Action } from '../actions/actionsTypes';
import { updateSettings } from '../actions/settings';
import { launchGame } from '../actions/games';
import { Vitrine as VisualVitrine } from '../components/Vitrine';
import { PlayableGame } from '../../../models/PlayableGame';

const mapStateToProps = (state: VitrineState) => ({
	settings: state.settings,
	launchedGame: state.launchedGame
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	updateSettings: (settings: any) => dispatch(updateSettings(settings)),
	launchGame: (launchedGame: PlayableGame) => dispatch(launchGame(launchedGame))
});

export const Vitrine = connect(mapStateToProps, mapDispatchToProps)(VisualVitrine);
