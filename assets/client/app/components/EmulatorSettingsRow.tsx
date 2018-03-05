import * as React from 'react';
import { Button, Checkbox, Input, Table } from 'semantic-ui-react';
import { StyleSheet, css } from 'aphrodite';
import { rgba } from 'css-verbose';
import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';

import { VitrineComponent } from './VitrineComponent';
import { openExecutableDialog } from '../helpers';

import { faFolderOpen } from '@fortawesome/fontawesome-free-solid';

interface Props {
	id: string,
	emulator: any,
	platforms: any[],
	onChange: (emulatorId: number, emulatorConfig: any) => void
}

interface State {
	name: string,
	platforms: any[],
	active: boolean,
	path: string,
	command: string,
	glob: string
}

export class EmulatorSettingsRow extends VitrineComponent<Props, State> {
	public constructor(props: Props) {
		super(props);

		this.state = {
			name: props.emulator.name,
			platforms: props.platforms,
			active: props.emulator.active,
			path: props.emulator.path,
			command: props.emulator.command,
			glob: props.emulator.glob
		};
	}

	private activeCheckBoxHandler(event: any, data: any) {
		this.setState({
			active: data.checked
		}, () => {
			this.props.onChange(parseInt(this.props.id), this.getEmulatorFromState());
		});
	}

	private programBtnClickHandler() {
		let dialogRet: string = openExecutableDialog();
		if (!dialogRet)
			return;
		this.setState({
			path: dialogRet
		}, () => {
			this.props.onChange(parseInt(this.props.id), this.getEmulatorFromState());
		});
	}

	private commandLineChangeHandler(event: any) {
		this.setState({
			command: event.target.value
		}, () => {
			this.props.onChange(parseInt(this.props.id), this.getEmulatorFromState());
		});
	}

	private getEmulatorFromState() {
		return {
			...this.state,
			platforms: this.state.platforms.map((platforms: any) => platforms.id)
		};
	}

	public render(): JSX.Element {
		return (
			<Table.Row
				className={`${css(styles.emulatorTr)} ${(!this.state.active) ? (css(styles.inactiveTr)) : ('')}`}
			>
				<Table.Cell>
					<strong>{this.state.name}</strong>
				</Table.Cell>
				<Table.Cell>
					{this.state.platforms.map((platforms: any) => platforms.name).join(', ')}
				</Table.Cell>
				<Table.Cell>
					<Checkbox
						checked={this.state.active}
						onChange={this.activeCheckBoxHandler.bind(this)}
					/>
				</Table.Cell>
				<Table.Cell>
					<Input
						label={
							<Button
								secondary={true}
								onClick={this.programBtnClickHandler.bind(this)}
								disabled={!this.state.active}
							>
								<FontAwesomeIcon icon={faFolderOpen}/>
							</Button>
						}
						labelPosition={'right'}
						size={'small'}
						className={(!this.state.active) ? (css(styles.inactiveInput)) : ('')}
						readOnly={true}
						value={this.state.path}
						onClick={(this.state.active) ? (this.programBtnClickHandler.bind(this)) : (null)}
					/>
				</Table.Cell>
				<Table.Cell>
					<div className="ui small input">
						<input
							value={this.state.command}
							className={`${css(styles.commandInput)} ${(!this.state.active) ? (css(styles.inactiveInput)) : ('')}`}
							disabled={!this.state.active}
							onChange={this.commandLineChangeHandler.bind(this)}
						/>
					</div>
				</Table.Cell>
			</Table.Row>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	emulatorTr: {
		transition: `${150}ms ease`
	},
	inactiveTr: {
		color: rgba(119, 119, 119, 0.75),
		backgroundColor: rgba(56, 56, 56, 0.45)
	},
	inactiveInput: {
		color: rgba(202, 202, 202, 0.35),
		backgroundColor: '#2d2b28'
	},
	commandInput: {
		fontFamily: 'Inconsolata'
	}
});
