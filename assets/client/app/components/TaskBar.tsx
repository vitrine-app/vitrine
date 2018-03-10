import * as React from 'react';
import { BrowserWindow, remote } from 'electron';
import { StyleSheet, css } from 'aphrodite';

import { VitrineComponent } from './VitrineComponent';
import { WindowControlIcon, WindowControl } from './icons/WindowControlIcon';

export class TaskBar extends VitrineComponent<{}, {}> {
	private currentWindow: BrowserWindow;

	public constructor() {
		super();
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
		return (
			<div className={css(styles.taskBar)}>
				<span className={css(styles.title)}>Vitrine</span>
				<div className={css(styles.windowControlBtnGroup)}>
					<WindowControlIcon
						icon={WindowControl.MinimizeIcon}
						onClick={this.minimizeBtnClickHandler.bind(this)}
					/>
					<WindowControlIcon
						icon={WindowControl.MaximizeIcon}
						onClick={this.maximizeBtnClickHandler.bind(this)}
					/>
					<WindowControlIcon
						icon={WindowControl.CloseIcon}
						redBackground={true}
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
		height: 22,
		backgroundColor: '#23211F',
		textAlign: 'center',
		'-webkitAppRegion': 'drag'
	},
	title: {
		fontSize: 13,
		opacity: 0.4
	},
	windowControlBtnGroup: {
		position: 'absolute',
		top: 0,
		right: 0,
		'-webkitAppRegion': 'no-drag'
	}
});
