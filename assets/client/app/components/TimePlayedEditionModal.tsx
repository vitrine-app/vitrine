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
		if (props.gameToEdit) {
			const timePlayed: number = props.gameToEdit.timePlayed;
			const hours: number = Math.floor(timePlayed / 3600);
			const minutes: number = Math.floor((timePlayed - (hours * 3600)) / 60);
			const seconds: number = timePlayed - (hours * 3600) - (minutes * 60);
			this.setState({
				hours,
				minutes,
				seconds
			});
		}
	}

	private submitButton() {
		const timePlayed: number = this.state.hours * 3600 + this.state.minutes * 60 + this.state.seconds;
		serverListener.send('edit-game-time-played', this.props.gameToEdit.uuid, timePlayed);
	}

	public render(): JSX.Element {
		return (
			<Modal
				open={this.props.visible}
				onClose={this.closeModal.bind(this)}
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
						onClick={this.submitButton.bind(this)}
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
	},

});
