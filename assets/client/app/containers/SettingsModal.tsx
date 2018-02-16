import { connect, Dispatch } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { Action } from '../actions/actionsTypes';
import { updateSettings } from '../actions/settings';
import { SettingsModal as VisualSettingsModal } from '../components/SettingsModal';

const mapStateToProps = (state: VitrineState) => ({
	settings: state.settings
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	updateSettings: (settings: any) => {
		dispatch(updateSettings(settings))
	}
});

export const SettingsModal = connect(mapStateToProps, mapDispatchToProps)(VisualSettingsModal);
