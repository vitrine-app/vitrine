import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { css, StyleSheet } from 'aphrodite';
import { rgba } from 'css-verbose';
import * as React from 'react';
import { InjectedIntl, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button, Checkbox, Input, Table } from 'semantic-ui-react';

import { AppState } from '../../features/redux/AppState';
import { openExecutableDialog } from '../../helpers';

import { faFolderOpen } from '@fortawesome/fontawesome-free-solid';

interface Props {
  platforms: any[];
  emulatorData: any;
  emulator: any;
  intl: InjectedIntl;
  onChange: (emulatorConfig: any) => void;
}

interface State {
  active: boolean;
  path: string;
  command?: string;
}

class EmulatorSettingsRow extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = {
      active: !!this.props.emulator,
      command: this.props.emulator ? this.props.emulator.command || this.props.emulatorData.command : this.props.emulatorData.command,
      path: this.props.emulator ? this.props.emulator.path : this.props.emulatorData.pat
    };
  }

  private activeCheckBox = (event: any, data: any) => {
    this.setState(
      {
        active: data.checked
      },
      () => {
        this.props.onChange(this.getEmulatorFromState());
      }
    );
  };

  private programButton = () => {
    const path: string = openExecutableDialog(this.props.intl.formatMessage);
    if (!path) {
      return;
    }
    this.setState(
      {
        path
      },
      () => {
        this.props.onChange(this.getEmulatorFromState());
      }
    );
  };

  private commandLineChange = (event: any) => {
    this.setState(
      {
        command: event.target.value
      },
      () => {
        this.props.onChange(this.getEmulatorFromState());
      }
    );
  };

  private getEmulatorFromState = () => {
    const emulator: any = { id: this.props.emulatorData.id };
    if (this.state.active) {
      emulator.path = this.state.path || null;
    } else {
      return emulator;
    }
    if (this.state.command !== this.props.emulatorData.command) {
      emulator.command = this.state.command;
    }
    return emulator;
  };

  public render(): JSX.Element {
    const platforms: string[] = this.props.emulatorData.platforms.map(
      (platformId: any) => this.props.platforms.filter((platform: any) => platform.id === platformId)[0].name
    );
    return (
      <Table.Row className={`${css(styles.emulatorTr)} ${!this.state.active ? css(styles.inactiveTr) : ''}`}>
        <Table.Cell>
          <strong>{this.props.emulatorData.name}</strong>
        </Table.Cell>
        <Table.Cell>{platforms.join(', ')}</Table.Cell>
        <Table.Cell>
          <Checkbox checked={this.state.active} onChange={this.activeCheckBox} />
        </Table.Cell>
        <Table.Cell>
          <Input
            label={
              <Button secondary={true} onClick={this.programButton} disabled={!this.state.active}>
                <FontAwesomeIcon icon={faFolderOpen} />
              </Button>
            }
            labelPosition={'right'}
            size={'small'}
            className={!this.state.active ? css(styles.inactiveInput) : ''}
            readOnly={true}
            value={this.state.path}
            onClick={this.state.active ? this.programButton : null}
          />
        </Table.Cell>
        <Table.Cell>
          <div className={'ui small input'}>
            <input
              value={this.state.command}
              className={`${css(styles.commandInput)} ${!this.state.active ? css(styles.inactiveInput) : ''}`}
              disabled={!this.state.active}
              onChange={this.commandLineChange}
            />
          </div>
        </Table.Cell>
      </Table.Row>
    );
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
  commandInput: {
    fontFamily: 'Inconsolata'
  },
  emulatorTr: {
    transition: `${150}ms ease`
  },
  inactiveInput: {
    backgroundColor: '#2d2b28',
    color: rgba(202, 202, 202, 0.35)
  },
  inactiveTr: {
    backgroundColor: rgba(56, 56, 56, 0.45),
    color: rgba(119, 119, 119, 0.75)
  }
});

const mapStateToProps = (state: AppState) => ({
  platforms: state.modulesConfig.emulated.platforms
});

const mapDispatchToProps = () => ({});

const EmulatorSettingsRowContainer = injectIntl(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(EmulatorSettingsRow)
);

export { EmulatorSettingsRowContainer as EmulatorSettingsRow };
