import * as React from 'react';
import { ipcRenderer, remote, BrowserWindow } from 'electron';
import { StyleSheet, css } from 'aphrodite';
import { rgba } from 'css-verbose';

import { VitrineComponent } from './VitrineComponent';
import { Button } from './Button';
import { MinimizeIcon } from './icons/MinimizeIcon';
import { MaximizeIcon } from './icons/MaximizeIcon';
import { CloseIcon } from './icons/CloseIcon';
import { localizer } from '../Localizer';

export class TaskBar extends VitrineComponent {
	private currentWindow: BrowserWindow;
	private colorStyles: any;

	public constructor(props: any) {
		super(props);
		this.currentWindow = remote.getCurrentWindow();
		this.colorStyles = {
			color: rgba(255, 255, 255, 0.3),
			hover: rgba(255, 255, 255, 0.6)
		};
	}

	private minimizeBtnClickHandler() {
		this.currentWindow.minimize();
	}

	private maximizeBtnClickHandler() {
		if (this.currentWindow.isMaximized())
			this.currentWindow.unmaximize();
		else
			this.currentWindow.maximize();
	}

	private closeBtnClickHandler() {
		this.currentWindow.close();
	}

	public render(): JSX.Element {
		return (
			<div className={css(styles.taskBar)}>
				<div className="row">
					<div className="col-md-1">
						<div className="row">
							<div className="col-md-4">
								<Button
									iconName={'plus'}
									tooltip={localizer.f('addGameLabel')}
									onClick='#add-game-modal'
								/>
							</div>
							<div className="col-md-4">
								<Button
									iconName={(this.props.refreshingGames) ? ('refresh fa-spin') : ('refresh')}
									tooltip={localizer.f('refreshLabel')}
									onClick={this.props.refreshBtnCallback}
								/>
							</div>
							<div className="col-md-4">
								<Button
									iconName={'cogs'}
									tooltip={localizer.f('settings')}
									onClick='#settings-modal'
								/>
							</div>
						</div>
					</div>
					<div
						className={`potential-games-container col-md-2 ${css(styles.potentialGamesContainer)}`}
						style={{ visibility: (this.props.potentialGames.games.length) ? ('visible') : ('hidden') }}
					>
						<button className={`btn btn-primary ${css(styles.controlBtn)}`} data-toggle="modal" data-target="#add-potential-games-modal">
							{localizer.f('potentialGamesAdd', this.props.potentialGames.games.length)}
						</button>
					</div>
					<div
						className="col-md-2"
						style={{ visibility: (this.props.updateProgress) ? ('visible') : ('hidden') }}
					>
						<div className={`progress ${css(styles.updateBar)}`}>
							<div
								className="progress-bar progress-bar-striped active"
								role="progressbar"
								style={{ width: (this.props.updateProgress) ? (`${Math.round(this.props.updateProgress.percent)}%`) : ('0%') }}
							/>
						</div>
					</div>
					<div className={`col-md-1 ${css(styles.windowControlBtnGroup)}`}>
						<MinimizeIcon
							styles={styles.windowControlIcon}
							colors={this.colorStyles}
							onClick={this.minimizeBtnClickHandler.bind(this)}
						/>
						<MaximizeIcon
							styles={styles.windowControlIcon}
							colors={this.colorStyles}
							onClick={this.maximizeBtnClickHandler.bind(this)}
						/>
						<CloseIcon
							styles={styles.windowControlIcon}
							colors={this.colorStyles}
							onClick={this.closeBtnClickHandler.bind(this)}
						/>
					</div>
				</div>
				{this.checkErrors()}
			</div>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	taskBar: {
		backgroundColor: rgba(0, 0, 0, 0),
		height: `${5}%`,
		borderTop: `solid ${1}px ${rgba(31, 30, 30, 0.63)}`,
		borderBottom: `solid ${1}px ${rgba(31, 30, 30, 0.63)}`,
		padding: `${4}px ${0} ${0} ${15}px`,
		boxShadow: `${0} ${0} ${9}px ${rgba(0, 0, 0, 0.55)}`,
		'-webkitAppRegion': 'drag'
	},
	potentialGamesContainer: {
		marginLeft: 18
	},
	updateBar: {
		width: 250,
		height: 13,
		marginTop: 13,
		marginBottom: 13,
		borderRadius: 3,
		backgroundColor: '#50453C'
	},
	controlBtn: {
		'-webkitAppRegion': 'no-drag'
	},
	windowControlBtnGroup: {
		width: `${5}%`,
		marginLeft: `${51}%`,
		padding: `${12}px ${0} ${0}`
	},
	windowControlIcon: {
		cursor: 'pointer',
		marginLeft: 14,
		'-webkitAppRegion': 'no-drag'
	}
});
