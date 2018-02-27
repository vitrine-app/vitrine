import * as React from 'react';
import { Button, Form, Grid, Modal } from 'semantic-ui-react';
import { StyleSheet, css } from 'aphrodite';
import { margin } from 'css-verbose';

import { PotentialGame } from '../../../models/PotentialGame';
import { PlayableGame } from '../../../models/PlayableGame';
import { serverListener } from '../ServerListener';
import { VitrineComponent } from './VitrineComponent';
import { NumberPicker } from './NumberPicker';
import { localizer } from '../Localizer';

interface Props {
	editedGame: PotentialGame,
	visible: boolean,
	openTimePlayedEditionModal: () => void,
	closeTimePlayedEditionModal: () => void
}

interface State {
	hours: number,
	minutes: number,
	seconds: number
}

export class TimePlayedEditionModal extends VitrineComponent<Props, State> {
	public constructor(props: Props) {
		super(props);

		this.state = {
			hours: 0,
			minutes: 0,
			seconds: 0
		};
	}

	private closeModal() {
		this.props.closeTimePlayedEditionModal();
		this.setState({
			hours: 0,
			minutes: 0,
			seconds: 0
		});
	}

	private changeTimeHandler(field: any, value: number) {
		this.setState({
			[field]: value
		});
	}

	public componentWillReceiveProps(props: Props) {
		if (props.editedGame) {
			let timePlayed: number = (props.editedGame as PlayableGame).timePlayed;
			let hours: number = Math.floor(timePlayed / 3600);
			let minutes: number = Math.floor((timePlayed - (hours * 3600)) / 60);
			let seconds: number = timePlayed - (hours * 3600) - (minutes * 60);
			this.setState({
				hours,
				minutes,
				seconds
			});
		}
	}

	private submitBtnClickHandler() {
		let timePlayed: number = this.state.hours * 3600 + this.state.minutes * 60 + this.state.seconds;
		serverListener.send('edit-game-time-played', this.props.editedGame.uuid, timePlayed);
	}

	public render(): JSX.Element {
		/*return (
			<div id="edit-time-played-modal" className={`modal fade ${css(styles.modal)}`} role="dialog">
				<div className="modal-dialog modal-sm">
					<div className="modal-content">
						<div className="modal-header">
							<CloseIcon onClick={'#edit-time-played-modal'}/>
							<h4 className="modal-title">{(this.props.editedGame) ? (this.props.editedGame.name) : ('')}</h4>
						</div>
						<div className={`modal-body`}>
							<div className="row">
								<div className="form-group col-md-4">
									<label>{localizer.f('hours')}</label>
									<NumberPicker
										min={0}
										max={Infinity}
										value={this.state.hours}
										name="hours"
										placeholder={localizer.f('hours')}
										onChange={(value: number) => this.changeTimeHandler('hours', value)}
									/>
								</div>
								<div className="form-group col-md-4">
									<label>{localizer.f('minutes')}</label>
									<NumberPicker
										min={0}
										max={60}
										value={this.state.minutes}
										name="minutes"
										placeholder={localizer.f('minutes')}
										onChange={(value: number) => this.changeTimeHandler('minutes', value)}
									/>
								</div>
								<div className="form-group col-md-4">
									<label>{localizer.f('seconds')}</label>
									<NumberPicker
										min={0}
										max={60}
										value={this.state.seconds}
										name="seconds"
										placeholder={localizer.f('seconds')}
										onChange={(value: number) => this.changeTimeHandler('seconds', value)}
									/>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button
								className="btn btn-primary"
								onClick={this.submitBtnClickHandler.bind(this)}
							>
								{localizer.f('confirm')}
							</button>
						</div>
					</div>
				</div>
				{this.checkErrors()}
			</div>
		);*/

		return (
			<Modal
				open={this.props.visible}
				onClose={this.closeModal.bind(this)}
				className={css(styles.modal)}
			>
				<Modal.Header>Title</Modal.Header>
				<Modal.Content>
					<Form>
						<Grid>
							<Grid.Column width={5}>
								<Form.Field>
									<label>{localizer.f('hours')}</label>
									<NumberPicker
										min={0}
										max={Infinity}
										value={this.state.hours}
										name={'hours'}
										placeholder={localizer.f('hours')}
										onChange={(value: number) => this.changeTimeHandler('hours', value)}
									/>
								</Form.Field>
							</Grid.Column>
							<Grid.Column width={5}>
								<Form.Field>
									<label>{localizer.f('minutes')}</label>
									<NumberPicker
										min={0}
										max={60}
										value={this.state.minutes}
										name={'minutes'}
										placeholder={localizer.f('minutes')}
										onChange={(value: number) => this.changeTimeHandler('minutes', value)}
									/>
								</Form.Field>
							</Grid.Column>
							<Grid.Column width={5}>
								<Form.Field>
									<label>{localizer.f('seconds')}</label>
									<NumberPicker
										min={0}
										max={60}
										value={this.state.seconds}
										name={'seconds'}
										placeholder={localizer.f('seconds')}
										onChange={(value: number) => this.changeTimeHandler('seconds', value)}
									/>
								</Form.Field>
							</Grid.Column>
						</Grid>
					</Form>
				</Modal.Content>
				<Modal.Actions>
					<Button
						primary={true}
					>
						Yes
					</Button>
				</Modal.Actions>
			</Modal>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	modal: {
		width: 300,
		margin: margin(20..rem(), 'auto')
	},

});
