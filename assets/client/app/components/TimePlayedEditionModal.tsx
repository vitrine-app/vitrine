import { css, StyleSheet } from 'aphrodite';
import { margin } from 'css-verbose';
import * as React from 'react';
import { Button, Form, Grid, Modal } from 'semantic-ui-react';

import { PlayableGame } from '../../../models/PlayableGame';
import { localizer } from '../Localizer';
import { serverListener } from '../ServerListener';
import { NumberPicker } from './NumberPicker';
import { VitrineComponent } from './VitrineComponent';

interface Props {
	gameToEdit: PlayableGame;
	visible: boolean;
	closeTimePlayedEditionModal: () => void;
}

interface State {
	hours: number;
	minutes: number;
	seconds: number;
}

export class TimePlayedEditionModal extends VitrineComponent<Props, State> {
	public constructor(props: Props) {
		super(props);

		this.state = {
			hours: 0,
			minutes: 0,
			seconds: 0
		};

		this.closeModal = this.closeModal.bind(this);
		this.setHours = this.setHours.bind(this);
		this.setMinutes = this.setMinutes.bind(this);
		this.setSeconds = this.setSeconds.bind(this);
		this.submitButton = this.submitButton.bind(this);
	}

	private closeModal() {
		this.props.closeTimePlayedEditionModal();
		this.setState({
			hours: 0,
			minutes: 0,
			seconds: 0
		});
	}

	private setHours(hours: number) {
		this.setState({
			hours
		});
	}

	private setMinutes(minutes: number) {
		this.setState({
			minutes
		});
	}

	private setSeconds(seconds: number) {
		this.setState({
			seconds
		});
	}

	public static getDerivedStateFromProps(nextProps: Props): Partial<State> {
		if (!nextProps.gameToEdit)
			return null;
		const timePlayed: number = nextProps.gameToEdit.timePlayed;
		const hours: number = Math.floor(timePlayed / 3600);
		const minutes: number = Math.floor((timePlayed - (hours * 3600)) / 60);
		const seconds: number = timePlayed - (hours * 3600) - (minutes * 60);
		return {
			hours,
			minutes,
			seconds
		};
	}

	private submitButton() {
		const timePlayed: number = this.state.hours * 3600 + this.state.minutes * 60 + this.state.seconds;
		serverListener.send('edit-game-time-played', this.props.gameToEdit.uuid, timePlayed);
		this.props.closeTimePlayedEditionModal();
	}

	public render(): JSX.Element {
		return (
			<Modal
				open={this.props.visible}
				onClose={this.closeModal}
				className={css(styles.modal)}
			>
				<Modal.Header>
					{(this.props.gameToEdit) ? (this.props.gameToEdit.name) : ('')}
				</Modal.Header>
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
										onChange={this.setHours}
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
										onChange={this.setMinutes}
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
										onChange={this.setSeconds}
									/>
								</Form.Field>
							</Grid.Column>
						</Grid>
					</Form>
				</Modal.Content>
				<Modal.Actions>
					<Button
						primary={true}
						onClick={this.submitButton}
					>
						{localizer.f('confirm')}
					</Button>
				</Modal.Actions>
				{this.checkErrors()}
			</Modal>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	modal: {
		width: 300,
		margin: margin(20..rem(), 'auto')
	}
});
