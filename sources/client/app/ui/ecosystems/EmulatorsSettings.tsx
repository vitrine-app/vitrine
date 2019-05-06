import { css, StyleSheet } from 'aphrodite';
import * as React from 'react';
import { FormattedMessage, InjectedIntl, injectIntl } from 'react-intl';
import { Table } from 'semantic-ui-react';

import { EmulatorSettingsRow } from '../organisms';

interface Props {
  emulated: any;
  emulators: any[];
  error: string;
  intl: InjectedIntl;
  onChange: (emulatorConfig: any) => void;
}

const EmulatorsSettings: React.StatelessComponent<Props> = ({ emulated, emulators, error, onChange }: Props) => (
  <React.Fragment>
    {error && <p className={css(styles.emulatorsError)}>{error}</p>}
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
        {emulators.map((emulator: any, index: number) => (
          <EmulatorSettingsRow
            key={index}
            emulatorData={emulator}
            emulator={emulated ? emulated.aliveEmulators.filter((aliveEmulator: any) => aliveEmulator.id === emulator.id)[0] : null}
            onChange={onChange}
          />
        ))}
      </Table.Body>
    </Table>
    <p className={css(styles.emulatorsCommandLineInstruction)}>
      <FormattedMessage id={'emulator.commandLineInstruction'} />
    </p>
  </React.Fragment>
);

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
  }
});

const EmulatorsSettingsContainer = injectIntl(EmulatorsSettings);

export { EmulatorsSettingsContainer as EmulatorsSettings };
