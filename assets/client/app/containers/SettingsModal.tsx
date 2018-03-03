import { connect, Dispatch } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { SettingsModal as VisualSettingsModal } from '../components/SettingsModal';
import { Action } from '../actions/actionsTypes';
import { updateSettings } from '../actions/settings';
import { closeSettingsModal } from '../actions/modals';

const mapStateToProps = (state: VitrineState) => ({
	settings: state.settings,
	visible: state.settingsModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	updateSettings: (settings: any) => {
		dispatch(updateSettings(settings));
	},
	closeSettingsModal: () => {
		dispatch(closeSettingsModal());
	}
});

export const SettingsModal = connect(mapStateToProps, mapDispatchToProps)(VisualSettingsModal);
