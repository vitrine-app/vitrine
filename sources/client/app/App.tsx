import * as React from 'react';
import { IntlProvider } from 'react-intl';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { ErrorsWrapper } from './features/errors/ErrorsWrapper';
import { Vitrine } from './features/homescreen/Vitrine';
import { Action } from './features/redux/actions/actionsTypes';
import { setLocale, setLocales, updateModulesConfig, updateSettings } from './features/redux/actions/settings';
import { AppState } from './features/redux/AppState';
import { serverListener } from './features/serverListener';

interface Props {
  settings: any;
  locales: any[];
  currentLocale: string;
  updateSettings: (settings: any) => void;
  setLocales: (locales: any) => void;
  updateModulesConfig: (modulesConfig: any) => void;
}

interface State {
  settingsReceived: boolean;
}

class App extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = {
      settingsReceived: false
    };
  }

  public async componentDidMount() {
    serverListener.listen('init-settings', (settings: any, modulesConfig: any, locales: any[]) => {
      this.props.setLocales(locales);
      this.props.updateSettings(settings);
      this.props.updateModulesConfig(modulesConfig);
      this.setState(
        {
          settingsReceived: true
        },
        () => {
          serverListener.send('ready');
        }
      );
    });

    serverListener.send('settings-asked');
  }

  public render(): JSX.Element {
    const locale: any = this.props.locales.find((currentLocale: any) => currentLocale.locale === this.props.currentLocale);

    return this.state.settingsReceived ? (
      <IntlProvider locale={this.props.currentLocale} messages={locale.messages}>
        <ErrorsWrapper>
          <Vitrine />
        </ErrorsWrapper>
      </IntlProvider>
    ) : null;
  }
}

const mapStateToProps = (state: AppState) => ({
  currentLocale: state.locale,
  locales: state.locales,
  settings: state.settings
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

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export { AppContainer as App };
