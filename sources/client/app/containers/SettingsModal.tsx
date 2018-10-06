import { injectIntl } from 'react-intl';
import { connect, Dispatch } from 'react-redux';

import { Action } from '../actions/actionsTypes';
import { closeSettingsModal } from '../actions/modals';
import { setLocale, updateSettings } from '../actions/settings';
import { AppState } from '../AppState';
import { SettingsModal as SettingsModalComponent } from '../components/SettingsModal';

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
