import * as React from 'react';
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

	private activeCheckBoxHandler(event: any) {
		this.setState({
			active: event.target.checked
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
			<tr
				className={`${css(styles.emulatorTr)} ${(!this.state.active) ? (css(styles.inactiveTr)) : ('')}`}
			>
				<th>
					<strong>{this.state.name}</strong>
				</th>
				<th>
					{this.state.platforms.map((platforms: any) => platforms.name).join(', ')}
				</th>
				<th>
					<input
						type="checkbox"
						checked={this.state.active}
						onChange={this.activeCheckBoxHandler.bind(this)}
					/>
				</th>
				<th>
					<div className="input-group">
						<input
							className={`form-control input-sm ${(!this.state.active) ? (css(styles.inactiveInput)) : ('')}`}
							disabled={true}
							value={this.state.path}
						/>
						<span className="input-group-btn">
							<button
								className="btn btn-default btn-sm"
								type="button"
								onClick={this.programBtnClickHandler.bind(this)}
								disabled={!this.state.active}
							>
								<FontAwesomeIcon icon={faFolderOpen}/>
							</button>
						</span>
					</div>
				</th>
				<th>
					<input
						className={`form-control input-sm ${css(styles.commandInput)} ${(!this.state.active) ? (css(styles.inactiveInput)) : ('')}`}
						value={this.state.command}
						onChange={this.commandLineChangeHandler.bind(this)}
						disabled={!this.state.active}
					/>
				</th>
			</tr>
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
