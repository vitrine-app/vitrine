import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { rgba } from 'css-verbose';

import { VitrineComponent } from './VitrineComponent';
import { openExecutableDialog } from '../helpers';

export class EmulatorSettingsRow extends VitrineComponent {
	public constructor(props: any) {
		super(props);

		this.state = {
			name: props.name,
			active: props.active,
			path: props.path,
			command: props.command
		};
	}

	private activeCheckBoxHandler(event: any) {
		this.setState({
			active: event.target.checked
		}, () => {
			this.props.onChange(this.props.id, this.state);
		});
	}

	private programBtnClickHandler() {
		let dialogRet: string = openExecutableDialog();
		if (!dialogRet)
			return;
		this.setState({
			path: dialogRet
		}, () => {
			this.props.onChange(this.props.id, this.state);
		});
	}

	private commandLineChangeHandler(event: any) {
		this.setState({
			command: event.target.value
		}, () => {
			this.props.onChange(this.props.id, this.state);
		});
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
								<i className="fa fa-folder-open-o"/>
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
		fontFamily: 'Courier New'
	}
});
