import { connect, Dispatch } from 'react-redux';

import { AppState } from '../AppState';
import { SettingsModal as VisualSettingsModal } from '../components/SettingsModal';
import { Action } from '../actions/actionsTypes';
import { updateSettings } from '../actions/settings';
import { closeSettingsModal } from '../actions/modals';

const mapStateToProps = (state: AppState) => ({
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
