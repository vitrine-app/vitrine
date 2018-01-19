import * as React from 'react';
import { ipcRenderer, remote, BrowserWindow } from 'electron';
import { StyleSheet, css } from 'aphrodite';
import { border, padding, rgba } from 'css-verbose';

import { VitrineComponent } from './VitrineComponent';
import { Button } from './Button';
import { MinimizeIcon } from './icons/MinimizeIcon';
import { MaximizeIcon } from './icons/MaximizeIcon';
import { CloseIcon } from './icons/CloseIcon';
import { localizer } from '../Localizer';

export class TaskBar extends VitrineComponent {
	private currentWindow: BrowserWindow;

	public constructor(props: any) {
		super(props);
		this.currentWindow = remote.getCurrentWindow();
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
		let taskBarElements: JSX.Element = (!this.props.isGameLaunched) ? (
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
			</div>
		) : (null);

		return (
			<div className={css(styles.taskBar)}>
				{taskBarElements}
				<div className={css(styles.windowControlBtnGroup)}>
					<MinimizeIcon
						onClick={this.minimizeBtnClickHandler.bind(this)}
					/>
					<MaximizeIcon
						onClick={this.maximizeBtnClickHandler.bind(this)}
					/>
					<CloseIcon
						onClick={this.closeBtnClickHandler.bind(this)}
					/>
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
		borderTop: border(1, 'solid', rgba(31, 30, 30, 0.63)),
		borderBottom: border(1, 'solid', rgba(31, 30, 30, 0.63)),
		padding: padding(4, 0, 0, 15),
		boxShadow: `${0} ${0} ${9..px()} ${rgba(0, 0, 0, 0.55)}`,
		'-webkitAppRegion': 'drag'
	},
	potentialGamesContainer: {
		marginLeft: 18
	},
	controlBtn: {
		'-webkitAppRegion': 'no-drag'
	},
	windowControlBtnGroup: {
		position: 'absolute',
		top: 16,
		right: 20,
		zIndex: 1
	}
});
