import { css, StyleSheet } from 'aphrodite';
import { padding } from 'css-verbose';
import * as React from 'react';
import { FormattedMessage, InjectedIntl, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Button, Tab } from 'semantic-ui-react';

import { openDirectory } from '../../helpers';
import { EmulatorsSettings, LocaleSettings, ModulesSettings } from '../../ui/ecosystems';
import { FadingModal } from '../../ui/FadingModal';
import { Action } from '../redux/actions/actionsTypes';
import { closeSettingsModal } from '../redux/actions/modals';
import { setLocale, updateSettings } from '../redux/actions/settings';
import { AppState } from '../redux/AppState';
import { serverListener } from '../serverListener';
import { VitrineComponent } from '../VitrineComponent';

interface Props {
  settings: any;
  locales: any[];
  currentLocale: string;
  emulators: any[];
  visible: boolean;
  firstLaunch: boolean;
  updateSettings: (settings: any) => void;
  closeSettingsModal: () => void;
  intl: InjectedIntl;
}

interface State {
  langs: any[];
  lang: string;
  steamEnabled: boolean;
  originEnabled: boolean;
  battleNetEnabled: boolean;
  emulatedEnabled: boolean;
  steamPath: string;
  steamSearchCloud: boolean;
  originPath: string;
  emulatedPath: string;
  steamError: boolean;
  originError: boolean;
  emulatedError: boolean;
  aliveEmulators: any[];
  emulatorsError: string;
}

class SettingsModal extends VitrineComponent<Props, State> {
  private readonly emptyState: State;

  public constructor(props: Props) {
    super(props);

    this.emptyState = {
      aliveEmulators: this.props.settings.emulated ? this.props.settings.emulated.aliveEmulators : [],
      battleNetEnabled: !!(this.props.settings && this.props.settings.battleNet),
      emulatedEnabled: !!(this.props.settings && this.props.settings.emulated),
      emulatedError: false,
      emulatedPath: this.props.settings.emulated ? this.props.settings.emulated.romsFolder : '',
      emulatorsError: '',
      lang: this.props.currentLocale,
      langs: this.props.locales,
      originEnabled: !!(this.props.settings && this.props.settings.origin),
      originError: false,
      originPath: this.props.settings && this.props.settings.origin ? this.props.settings.origin.installFolder : '',
      steamEnabled: !!(this.props.settings && this.props.settings.steam),
      steamError: false,
      steamPath: this.props.settings && this.props.settings.steam ? this.props.settings.steam.installFolder : '',
      steamSearchCloud: this.props.settings && this.props.settings.steam ? this.props.settings.steam.searchCloud : true
    };
    this.state = this.emptyState;
  }

  private closeModal = () => {
    if (this.props.firstLaunch) {
      return;
    }
    this.props.closeSettingsModal();
    this.setState(this.emptyState);
  };

  private moduleIconClick = (moduleName: string) => {
    return () => {
      // @ts-ignore
      this.setState(({ [`${moduleName}Enabled`]: moduleEnabled }: State) => ({
        [`${moduleName}Enabled`]: !moduleEnabled
      }));
    };
  };

  private modulePathButton = (moduleName: string) => () => {
    const modulePath: string = openDirectory();
    if (modulePath) {
      // @ts-ignore
      this.setState({
        [`${moduleName}Path`]: modulePath
      });
    }
  };

  private steamSearchCloudCheckbox = () => {
    this.setState(({ steamSearchCloud }: State) => ({
      steamSearchCloud: !steamSearchCloud
    }));
  };

  private localeChange = (event: any, data: any) => {
    this.setState({
      lang: data.value
    });
  };

  private emulatorConfigChange = (emulatorConfig: any) => {
    let aliveEmulators: any[] = this.state.aliveEmulators;
    if (emulatorConfig.path !== undefined) {
      const found: boolean = this.state.aliveEmulators.filter((aliveEmulator: any) => aliveEmulator.id === emulatorConfig.id).length > 0;
      if (!found) {
        aliveEmulators.push(emulatorConfig);
      } else {
        aliveEmulators = aliveEmulators.map((aliveEmulator: any) => (aliveEmulator.id !== emulatorConfig.id ? aliveEmulator : emulatorConfig));
      }
    } else {
      aliveEmulators = aliveEmulators.filter((aliveEmulator: any) => aliveEmulator.id !== emulatorConfig.id);
    }
    this.setState({
      aliveEmulators
    });
  };

  private submitButton = () => {
    let sendable: boolean = true;
    const settingsForm: any = {
      lang: this.state.lang
    };
    if (this.state.steamEnabled) {
      if (this.state.steamPath) {
        settingsForm.steam = {
          installFolder: this.state.steamPath,
          searchCloud: this.state.steamSearchCloud
        };
        this.setState({
          steamError: false
        });
      } else {
        sendable = false;
        this.setState({
          steamError: true
        });
      }
    }
    if (this.state.originEnabled) {
      if (this.state.originPath) {
        settingsForm.origin = {
          installFolder: this.state.originPath
        };
        this.setState({
          originError: false
        });
      } else {
        sendable = false;
        this.setState({
          originError: true
        });
      }
    }
    if (this.state.battleNetEnabled) {
      settingsForm.battleNet = {};
    }
    if (this.state.emulatedEnabled) {
      if (this.state.emulatedPath) {
        settingsForm.emulated = {
          aliveEmulators: this.state.aliveEmulators,
          romsFolder: this.state.emulatedPath
        };
        this.setState({
          emulatedError: false
        });
      } else {
        sendable = false;
        this.setState({
          emulatedError: true
        });
      }
    }
    const emulatorsError: string = this.state.aliveEmulators
      .map((aliveEmulator: any) => {
        if (!aliveEmulator.path || (aliveEmulator.command !== undefined && !aliveEmulator.command)) {
          sendable = false;
          const emulatorName: string = this.props.emulators.filter((emulator: any) => emulator.id === aliveEmulator.id)[0].name;
          return this.props.intl.formatMessage({ id: 'emulator.configError' }, { emulator: emulatorName });
        }
        return;
      })
      .filter((error: string) => error)
      .join(' ');
    this.setState({
      emulatorsError
    });
    if (sendable) {
      serverListener.send('update-settings', settingsForm);
    }
  };

  public render(): JSX.Element {
    const {
      intl: { formatMessage }
    } = this.props;
    const {
      battleNetEnabled,
      emulatedEnabled,
      emulatedError,
      emulatedPath,
      originEnabled,
      originError,
      originPath,
      steamEnabled,
      steamError,
      steamPath,
      steamSearchCloud
    } = this.state;
    return (
      <FadingModal
        actions={
          <React.Fragment>
            <Button secondary={true} style={{ display: !this.props.firstLaunch ? 'inline-block' : 'none' }} onClick={this.closeModal}>
              <FormattedMessage id={'actions.cancel'} />
            </Button>
            <Button primary={true} onClick={this.submitButton}>
              <FormattedMessage id={'actions.confirm'} />
            </Button>
          </React.Fragment>
        }
        onClose={this.closeModal}
        title={this.props.intl.formatMessage({ id: 'settings.settings' })}
        size={'large'}
        visible={this.props.visible}
      >
        <div style={{ display: this.props.firstLaunch ? 'block' : 'none' }}>
          <h1>
            <FormattedMessage id={'welcomeMessage'} />
          </h1>
          <p>
            <FormattedMessage id={'wizardText'} />
          </p>
        </div>
        <Tab
          menu={{
            fluid: true,
            tabular: true,
            vertical: true
          }}
          panes={[
            {
              menuItem: this.props.intl.formatMessage({ id: 'settings.modules' }),
              render: () => (
                <Tab.Pane className={css(styles.settingsPane)}>
                  <ModulesSettings
                    battleNetEnabled={battleNetEnabled}
                    emulatedEnabled={emulatedEnabled}
                    emulatedError={emulatedError}
                    emulatedPath={emulatedPath}
                    emulatedPathButtonClick={this.modulePathButton('emulated')}
                    formatMessage={formatMessage}
                    moduleIconClick={this.moduleIconClick}
                    originEnabled={originEnabled}
                    originError={originError}
                    originPath={originPath}
                    originPathButtonClick={this.modulePathButton('origin')}
                    steamEnabled={steamEnabled}
                    steamError={steamError}
                    steamPath={steamPath}
                    steamPathButtonClick={this.modulePathButton('steam')}
                    steamSearchCloud={steamSearchCloud}
                    steamSearchCloudCheckbox={this.steamSearchCloudCheckbox}
                  />
                </Tab.Pane>
              )
            },
            {
              menuItem: this.props.intl.formatMessage({ id: 'settings.emulators' }),
              render: () => (
                <Tab.Pane className={css(styles.settingsPane)}>
                  <EmulatorsSettings
                    emulated={this.props.settings.emulated}
                    emulators={this.props.emulators}
                    error={this.state.emulatorsError}
                    onChange={this.emulatorConfigChange}
                  />
                </Tab.Pane>
              )
            },
            {
              menuItem: this.props.intl.formatMessage({ id: 'settings.locale' }),
              render: () => (
                <Tab.Pane className={css(styles.settingsPane)}>
                  <LocaleSettings locale={this.state.lang} locales={this.state.langs} onChange={this.localeChange} />
                </Tab.Pane>
              )
            }
          ]}
        />
        {this.checkErrors()}
      </FadingModal>
    );
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
  modulesError: {
    color: '#A94442',
    fontWeight: 600,
    marginTop: 5
  },
  settingsPane: {
    border: 'none',
    height: (70).vh(),
    overflowY: 'auto',
    padding: padding(0, 14)
  }
});

const mapStateToProps = (state: AppState) => ({
  currentLocale: state.locale,
  emulators: state.modulesConfig.emulated.emulators,
  locales: state.locales,
  settings: state.settings,
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

const SettingsModalContainer = injectIntl(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SettingsModal)
);

export { SettingsModalContainer as SettingsModal };
