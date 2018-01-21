import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';

import { VitrineComponent } from './VitrineComponent';
import { NumberPicker } from './NumberPicker';
import { CloseIcon } from './icons/CloseIcon';
import { localizer } from '../Localizer';

export class PlayedTimeModal extends VitrineComponent {
	public constructor(props: any) {
		super(props);

		this.state = {
			hours: 0,
			minutes: 0,
			seconds: 0
		};
	}

	public componentWillReceiveProps(props: any) {
		if (props.editedGame) {
			let timePlayed: number = props.editedGame.timePlayed;
			let seconds: number = timePlayed % 60;
			let minutes: number = Math.floor(timePlayed / 60);
			let hours: number = Math.floor(minutes / 60);
			minutes = minutes % 60;
			this.setState({
				hours,
				minutes,
				seconds
			});
		}
	}

	private changeHoursHandler(value: number) {
		this.setState({
			hours: value
		});
	}

	private changeMinutesHandler(value: number) {
		this.setState({
			minutes: value
		});
	}

	private changeSecondsHandler(value: number) {
		this.setState({
			seconds: value
		});
	}

	public render(): JSX.Element {
		return (
			<div id="played-time-modal" className={`modal fade ${css(styles.modal)}`} role="dialog">
				<div className="modal-dialog modal-sm">
					<div className="modal-content">
						<div className="modal-header">
							<CloseIcon onClick={'#played-time-modal'}/>
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
										onChange={this.changeHoursHandler.bind(this)}
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
										onChange={this.changeMinutesHandler.bind(this)}
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
										onChange={this.changeSecondsHandler.bind(this)}
									/>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button className="btn btn-primary">
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
