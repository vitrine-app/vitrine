import { connect, Dispatch } from 'react-redux';

import { Action } from '../actions/actionsTypes';
import { closeSettingsModal } from '../actions/modals';
import { updateSettings } from '../actions/settings';
import { AppState } from '../AppState';
import { SettingsModal as VisualSettingsModal } from '../components/SettingsModal';

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
