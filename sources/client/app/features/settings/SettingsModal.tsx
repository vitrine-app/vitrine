import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { css, StyleSheet } from 'aphrodite';
import { border, margin, padding, rgba } from 'css-verbose';
import * as React from 'react';
import { FormattedMessage, InjectedIntl, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Button, Checkbox, Form, Grid, Input, Tab, Table } from 'semantic-ui-react';

import { openDirectory } from '../../helpers';
import { FadingModal } from '../../ui/FadingModal';
import { Action } from '../redux/actions/actionsTypes';
import { closeSettingsModal } from '../redux/actions/modals';
import { setLocale, updateSettings } from '../redux/actions/settings';
import { AppState } from '../redux/AppState';
import { serverListener } from '../serverListener';
import { VitrineComponent } from '../VitrineComponent';
import { EmulatorSettingsRow } from './EmulatorSettingsRow';
import { GamesModule } from './GamesModule';

import { faFolderOpen } from '@fortawesome/fontawesome-free-solid';
import * as battleNetIcon from '../../../resources/images/battle_net_icon.png';
import * as emulatedIcon from '../../../resources/images/emulated_icon.png';
import * as originIcon from '../../../resources/images/origin_icon.png';
import * as steamIcon from '../../../resources/images/steam_icon.png';

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
    this.steamIconClick = this.steamIconClick.bind(this);
    this.originIconClick = this.originIconClick.bind(this);
    this.battleNetIconClick = this.battleNetIconClick.bind(this);
    this.emulatedIconClick = this.emulatedIconClick.bind(this);
    this.steamPathButton = this.steamPathButton.bind(this);
    this.steamSearchCloudCheckbox = this.steamSearchCloudCheckbox.bind(this);
    this.originPathButton = this.originPathButton.bind(this);
    this.emulatedPathButton = this.emulatedPathButton.bind(this);
    this.langSelect = this.langSelect.bind(this);
    this.emulatorConfigChange = this.emulatorConfigChange.bind(this);
    this.submitButton = this.submitButton.bind(this);
  }

  private closeModal() {
    console.log(':c', this.props.firstLaunch);
    if (this.props.firstLaunch) {
      return;
    }
    this.props.closeSettingsModal();
    this.setState(this.emptyState);
  }

  private steamIconClick(checked: boolean) {
    if ((checked && !this.state.steamEnabled) || (!checked && this.state.steamEnabled)) {
      this.setState({
        steamEnabled: !this.state.steamEnabled,
        steamError: false
      });
    }
  }

  private originIconClick(checked: boolean) {
    if ((checked && !this.state.originEnabled) || (!checked && this.state.originEnabled)) {
      this.setState({
        originEnabled: !this.state.originEnabled,
        originError: false
      });
    }
  }

  private battleNetIconClick(checked: boolean) {
    if ((checked && !this.state.battleNetEnabled) || (!checked && this.state.battleNetEnabled)) {
      this.setState({
        battleNetEnabled: !this.state.battleNetEnabled
      });
    }
  }

  private emulatedIconClick(checked: boolean) {
    if ((checked && !this.state.emulatedEnabled) || (!checked && this.state.emulatedEnabled)) {
      this.setState({
        emulatedEnabled: !this.state.emulatedEnabled,
        emulatedError: false
      });
    }
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

  private langSelect(event: any, data: any) {
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
        aliveEmulators = aliveEmulators.map((aliveEmulator: any) => (aliveEmulator.id !== emulatorConfig.i ? aliveEmulator : emulatorConfig));
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
        <Grid>
          <Grid.Column width={4}>
            <GamesModule clicked={this.state.steamEnabled} iconFile={steamIcon} iconAlt={'Steam'} clickHandler={this.steamIconClick} />
          </Grid.Column>
          <Grid.Column width={4}>
            <GamesModule clicked={this.state.originEnabled} iconFile={originIcon} iconAlt={'Origin'} clickHandler={this.originIconClick} />
          </Grid.Column>
          <Grid.Column width={4}>
            <GamesModule
              clicked={this.state.battleNetEnabled}
              iconFile={battleNetIcon}
              iconAlt={'Battle.net'}
              clickHandler={this.battleNetIconClick}
            />
          </Grid.Column>
          <Grid.Column width={4}>
            <GamesModule clicked={this.state.emulatedEnabled} iconFile={emulatedIcon} iconAlt={'Origin'} clickHandler={this.emulatedIconClick} />
          </Grid.Column>
        </Grid>
        <Form>
          <div style={{ display: this.state.steamEnabled ? 'block' : 'none' }}>
            <hr className={css(styles.formHr)} />
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
                placeholder={this.props.intl.formatMessage({
                  id: 'settings.steamPath'
                })}
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
                label={this.props.intl.formatMessage({
                  id: 'settings.steamSearchCloud'
                })}
                toggle={true}
              />
            </Form.Field>
          </div>
          <div style={{ display: this.state.originEnabled ? 'block' : 'none' }}>
            <hr className={css(styles.formHr)} />
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
                placeholder={this.props.intl.formatMessage({
                  id: 'settings.originGamesPath'
                })}
                value={this.state.originPath}
                onClick={this.originPathButton}
                readOnly={true}
              />
              <span
                className={css(styles.modulesError)}
                style={{
                  display: this.state.originError ? 'inline-block' : 'none'
                }}
              >
                <FormattedMessage id={'settings.pathError'} />
              </span>
            </Form.Field>
          </div>
          <div style={{ display: this.state.emulatedEnabled ? 'block' : 'none' }}>
            <hr className={css(styles.formHr)} />
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
                placeholder={this.props.intl.formatMessage({
                  id: 'settings.emulatedGamesPath'
                })}
                value={this.state.emulatedPath}
                onClick={this.emulatedPathButton}
                readOnly={true}
              />
              <span
                className={css(styles.modulesError)}
                style={{
                  display: this.state.emulatedError ? 'inline-block' : 'none'
                }}
              >
                <FormattedMessage id={'settings.pathError'} />
              </span>
            </Form.Field>
          </div>
        </Form>
      </Tab.Pane>
    );

    const emulatorsSettings: JSX.Element = (
      <Tab.Pane className={css(styles.settingsPane)}>
        <p className={css(styles.emulatorsError)}>{this.state.emulatorsError}</p>
        <Table celled={true}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell width={3}>
                <FormattedMessage id={'emulator.name'} />
              </Table.HeaderCell>
              <Table.HeaderCell width={3}>
                <FormattedMessage id={'emulator.platforms'} />
              </Table.HeaderCell>
              <Table.HeaderCell width={2}>
                <FormattedMessage id={'emulator.active'} />
              </Table.HeaderCell>
              <Table.HeaderCell width={4}>
                <FormattedMessage id={'emulator.path'} />
              </Table.HeaderCell>
              <Table.HeaderCell width={4}>
                <FormattedMessage id={'emulator.command'} />
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {this.props.emulators.map((emulator: any, index: number) => (
              <EmulatorSettingsRow
                key={index}
                emulatorData={emulator}
                emulator={
                  this.props.settings.emulated
                    ? this.props.settings.emulated.aliveEmulators.filter((aliveEmulator: any) => aliveEmulator.id === emulator.id)[0]
                    : null
                }
                onChange={this.emulatorConfigChange}
              />
            ))}
          </Table.Body>
        </Table>
        <p className={css(styles.emulatorsCommandLineInstruction)}>
          <FormattedMessage id={'emulator.commandLineInstruction'} />
        </p>
      </Tab.Pane>
    );

    const langsSettings: JSX.Element = (
      <Tab.Pane className={css(styles.settingsPane)}>
        <Form.Select
          name={'lang'}
          fluid={true}
          value={this.state.lang}
          onChange={this.langSelect}
          className={css(styles.langSelect)}
          options={this.state.langs.map((locale: any, index: number) => ({
            key: index,
            text: locale.messages.language,
            value: locale.locale
          }))}
        />
      </Tab.Pane>
    );
    return (
      <FadingModal
        actions={
          <React.Fragment>
            <Button
              secondary={true}
              style={{
                display: !this.props.firstLaunch ? 'inline-block' : 'none'
              }}
              onClick={this.closeModal}
            >
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
        style={{ margin: margin((5).rem(), 'auto'), width: (70).vw() }}
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
              menuItem: this.props.intl.formatMessage({
                id: 'settings.modules'
              }),
              render: () => modulesSettings
            },
            {
              menuItem: this.props.intl.formatMessage({
                id: 'settings.emulators'
              }),
              render: () => emulatorsSettings
            },
            {
              menuItem: this.props.intl.formatMessage({
                id: 'settings.locale'
              }),
              render: () => langsSettings
            }
          ]}
        />
        {this.checkErrors()}
      </FadingModal>
    );
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
  emulatorsCommandLineInstruction: {
    float: 'right',
    fontSize: 14,
    marginBottom: 10,
    opacity: 0.5,
    paddingLeft: 10
  },
  emulatorsError: {
    color: '#A94442',
    marginTop: 15
  },
  formHr: {
    border: 'none',
    borderTop: border(1, 'solid', rgba(238, 238, 238, 0.15)),
    margin: margin(20, -14)
  },
  langSelect: {
    padding: padding(20, 0, 100),
    width: (100).percents()
  },
  modal: {
    cursor: 'default',
    margin: margin((5).rem(), 'auto'),
    userSelect: 'none',
    width: (70).vw()
  },
  modalHeader: {
    border: 'none'
  },
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
