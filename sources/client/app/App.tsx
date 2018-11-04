import * as React from 'react';
import { IntlProvider } from 'react-intl';

import { Vitrine } from './containers/Vitrine';
import { ErrorsWrapper } from './features/errors/ErrorsWrapper';
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

export class App extends React.Component<Props, State> {
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
      this.setState({
        settingsReceived: true
      }, () => {
        serverListener.send('ready');
      });
    });

    serverListener.send('settings-asked');
  }

  public render(): JSX.Element {
    const locale: any = this.props.locales.find((locale: any) => locale.locale === this.props.currentLocale);

    return this.state.settingsReceived ? (
      <IntlProvider
        locale={this.props.currentLocale}
        messages={locale.messages}
      >
        <ErrorsWrapper>
          <Vitrine/>
        </ErrorsWrapper>
      </IntlProvider>
    ) : null;
  }
}
