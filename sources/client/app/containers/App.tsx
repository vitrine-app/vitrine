import { connect, Dispatch } from 'react-redux';

import { Action } from '../actions/actionsTypes';
import { setInternetConnection, setLocales, updateModulesConfig, updateSettings } from '../actions/settings';
import { AppState } from '../AppState';
import { App as AppComponent } from '../components/App';

const mapStateToProps = (state: AppState) => ({
  settings: state.settings
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  updateSettings(settings: any) {
    dispatch(updateSettings(settings));
  },
  setLocales(locales: any) {
    dispatch(setLocales(locales));
  },
  updateModulesConfig(modulesConfig: any) {
    dispatch(updateModulesConfig(modulesConfig));
  },
  setInternetConnection(internetConnection: boolean) {
    dispatch(setInternetConnection(internetConnection));
  }
});

export const App = connect(mapStateToProps, mapDispatchToProps)(AppComponent);
