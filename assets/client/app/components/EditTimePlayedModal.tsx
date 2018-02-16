import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';

import { PotentialGame } from '../../../models/PotentialGame';
import { PlayableGame } from '../../../models/PlayableGame';
import { serverListener } from '../ServerListener';
import { VitrineComponent } from './VitrineComponent';
import { NumberPicker } from './NumberPicker';
import { CloseIcon } from './icons/CloseIcon';
import { localizer } from '../Localizer';

interface Props {
	editedGame: PotentialGame
}

interface State {
	hours: number,
	minutes: number,
	seconds: number
}

export class EditTimePlayedModal extends VitrineComponent<Props, State> {
	public constructor(props: Props) {
		super(props);

		this.state = {
			hours: 0,
			minutes: 0,
			seconds: 0
		};
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

	private changeTimeHandler(field: any, value: number) {
		this.setState({
			[field]: value
		});
	}

	private submitBtnClickHandler() {
		let timePlayed: number = this.state.hours * 3600 + this.state.minutes * 60 + this.state.seconds;
		serverListener.send('edit-game-time-played', this.props.editedGame.uuid, timePlayed);
	}

	public render(): JSX.Element {
		return (
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
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	modal: {
		top: 26..vh()
	},

});
