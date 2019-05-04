import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { css, StyleSheet } from 'aphrodite';
import * as React from 'react';
import { FormattedMessage, InjectedIntl, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Button, Checkbox, Form, Grid, Input, Tab } from 'semantic-ui-react';

import { openDirectory } from '../../helpers';
import { SplitBar } from '../../ui/atoms';
import { EmulatorsSettings, LocaleSettings, ModulesSettings } from '../../ui/ecosystems';
import { FadingModal } from '../../ui/FadingModal';
import { Action } from '../redux/actions/actionsTypes';
import { closeSettingsModal } from '../redux/actions/modals';
import { setLocale, updateSettings } from '../redux/actions/settings';
import { AppState } from '../redux/AppState';
import { serverListener } from '../serverListener';
import { VitrineComponent } from '../VitrineComponent';

import { faFolderOpen } from '@fortawesome/fontawesome-free-solid';

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

    this.closeModal = this.closeModal.bind(this);
    this.moduleIconClick = this.moduleIconClick.bind(this);
    this.steamPathButton = this.steamPathButton.bind(this);
    this.steamSearchCloudCheckbox = this.steamSearchCloudCheckbox.bind(this);
    this.originPathButton = this.originPathButton.bind(this);
    this.emulatedPathButton = this.emulatedPathButton.bind(this);
    this.localeChange = this.localeChange.bind(this);
    this.emulatorConfigChange = this.emulatorConfigChange.bind(this);
    this.submitButton = this.submitButton.bind(this);
  }

  private closeModal() {
    if (this.props.firstLaunch) {
      return;
    }
    this.props.closeSettingsModal();
    this.setState(this.emptyState);
  }

  private moduleIconClick(moduleName: string) {
    return (checked: boolean) => {
      if ((checked && !this.state[`${moduleName}Enabled`]) || (!checked && this.state[`${moduleName}Enabled`])) {
        // @ts-ignore
        this.setState({
          [`${moduleName}Enabled`]: !this.state[`${moduleName}Enabled`],
          [`${moduleName}Error`]: false
        });
      }
    };
  }

  private steamPathButton() {
    const steamPath: string = openDirectory();
    if (steamPath) {
      this.setState({
        steamPath
      });
    }
  }

  private steamSearchCloudCheckbox(event: any, { checked: steamSearchCloud }: any) {
    this.setState({
      steamSearchCloud
    });
  }

  private originPathButton() {
    const originPath: string = openDirectory();
    if (originPath) {
      this.setState({
        originPath
      });
    }
  }

  private emulatedPathButton() {
    const emulatedPath: string = openDirectory();
    if (emulatedPath) {
      this.setState({
        emulatedPath
      });
    }
  }

  private localeChange(event: any, data: any) {
    this.setState({
      lang: data.value
    });
  }

  private emulatorConfigChange(emulatorConfig: any) {
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
  }

  private submitButton() {
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
  }

  public render(): JSX.Element {
    const modulesSettings: JSX.Element = (
      <Tab.Pane className={css(styles.settingsPane)}>
        <ModulesSettings
          battleNetEnabled={this.state.battleNetEnabled}
          emulatedEnabled={this.state.emulatedEnabled}
          moduleIconClick={this.moduleIconClick}
          originEnabled={this.state.originEnabled}
          steamEnabled={this.state.steamEnabled}
        />
        <Form>
          <div style={{ display: this.state.steamEnabled ? 'block' : 'none' }}>
            <SplitBar />
            <h3>
              <FormattedMessage id={'settings.steamConfig'} />
            </h3>
            <Form.Field error={this.state.steamError}>
              <label>
                <FormattedMessage id={'settings.steamPath'} />
              </label>
              <Input
                label={
                  <Button secondary={true} onClick={this.steamPathButton}>
                    <FontAwesomeIcon icon={faFolderOpen} />
                  </Button>
                }
                labelPosition={'right'}
                name={'steam'}
                size={'large'}
                placeholder={this.props.intl.formatMessage({ id: 'settings.steamPath' })}
                value={this.state.steamPath}
                onClick={this.steamPathButton}
                readOnly={true}
              />
              <span className={css(styles.modulesError)} style={{ display: this.state.steamError ? 'inline' : 'none' }}>
                <FormattedMessage id={'settings.pathError'} />
              </span>
            </Form.Field>
            <Form.Field>
              <Checkbox
                checked={this.state.steamSearchCloud}
                onChange={this.steamSearchCloudCheckbox}
                label={this.props.intl.formatMessage({ id: 'settings.steamSearchCloud' })}
                toggle={true}
              />
            </Form.Field>
          </div>
          <div style={{ display: this.state.originEnabled ? 'block' : 'none' }}>
            <SplitBar />
            <h3>
              <FormattedMessage id={'settings.originConfig'} />
            </h3>
            <Form.Field error={this.state.originError}>
              <label>
                <FormattedMessage id={'settings.originGamesPath'} />
              </label>
              <Input
                label={
                  <Button secondary={true} onClick={this.originPathButton}>
                    <FontAwesomeIcon icon={faFolderOpen} />
                  </Button>
                }
                labelPosition={'right'}
                name={'origin'}
                size={'large'}
                placeholder={this.props.intl.formatMessage({ id: 'settings.originGamesPath' })}
                value={this.state.originPath}
                onClick={this.originPathButton}
                readOnly={true}
              />
              <span className={css(styles.modulesError)} style={{ display: this.state.originError ? 'inline-block' : 'none' }}>
                <FormattedMessage id={'settings.pathError'} />
              </span>
            </Form.Field>
          </div>
          <div style={{ display: this.state.emulatedEnabled ? 'block' : 'none' }}>
            <SplitBar />
            <h3>
              <FormattedMessage id={'settings.emulatedConfig'} />
            </h3>
            <Form.Field error={this.state.emulatedError}>
              <label>
                <FormattedMessage id={'settings.emulatedGamesPath'} />
              </label>
              <Input
                label={
                  <Button secondary={true} onClick={this.emulatedPathButton}>
                    <FontAwesomeIcon icon={faFolderOpen} />
                  </Button>
                }
                labelPosition={'right'}
                name={'emulated'}
                size={'large'}
                placeholder={this.props.intl.formatMessage({ id: 'settings.emulatedGamesPath' })}
                value={this.state.emulatedPath}
                onClick={this.emulatedPathButton}
                readOnly={true}
              />
              <span className={css(styles.modulesError)} style={{ display: this.state.emulatedError ? 'inline-block' : 'none' }}>
                <FormattedMessage id={'settings.pathError'} />
              </span>
            </Form.Field>
          </div>
        </Form>
      </Tab.Pane>
    );
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
              render: () => modulesSettings
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
    height: (64).vh(),
    overflowY: 'auto'
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
