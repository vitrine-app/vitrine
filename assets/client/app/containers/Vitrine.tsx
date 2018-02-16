import { connect, Dispatch } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { Action } from '../actions/actionsTypes';
import { updateSettings } from '../actions/settings';
import { Vitrine as VisualVitrine } from '../components/Vitrine';

const mapStateToProps = (state: VitrineState) => ({
	settings: state.settings
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	updateSettings: (settings: any) => {
		dispatch(updateSettings(settings))
	}
});

export const Vitrine = connect(mapStateToProps, mapDispatchToProps)(VisualVitrine);
