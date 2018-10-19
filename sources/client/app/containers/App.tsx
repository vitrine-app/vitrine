import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { Action } from '../actions/actionsTypes';
import { setLocale, setLocales, updateModulesConfig, updateSettings } from '../actions/settings';
import { AppState } from '../AppState';
import { App as AppComponent } from '../components/App';

const mapStateToProps = (state: AppState) => ({
  settings: state.settings,
  locales: state.locales,
  currentLocale: state.locale
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  updateSettings(settings: any) {
    dispatch(updateSettings(settings));
    dispatch(setLocale(settings.lang));
  },
  setLocales(locales: any) {
    dispatch(setLocales(locales));
  },
  updateModulesConfig(modulesConfig: any) {
    dispatch(updateModulesConfig(modulesConfig));
  }
});

export const App = connect(mapStateToProps, mapDispatchToProps)(AppComponent);
