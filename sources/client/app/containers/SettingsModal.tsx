import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { Action } from '../features/redux/actions/actionsTypes';
import { closeSettingsModal } from '../features/redux/actions/modals';
import { setLocale, updateSettings } from '../features/redux/actions/settings';
import { AppState } from '../features/redux/AppState';
import { SettingsModal as SettingsModalComponent } from '../features/settings/SettingsModal';

const mapStateToProps = (state: AppState) => ({
  settings: state.settings,
  locales: state.locales,
  currentLocale: state.locale,
  emulators: state.modulesConfig.emulated.emulators,
  visible: state.settingsModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  updateSettings(settings: any) {
    dispatch(updateSettings(settings));
    dispatch(setLocale(settings.lang));
  },
  closeSettingsModal() {
    dispatch(closeSettingsModal());
  }
});

export const SettingsModal = injectIntl(connect(mapStateToProps, mapDispatchToProps)(SettingsModalComponent));
