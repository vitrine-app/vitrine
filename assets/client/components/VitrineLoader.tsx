import * as React from 'react';
import { ipcRenderer } from 'electron';
import { css, StyleSheet } from 'aphrodite';
import { rgba } from 'css-verbose';

import * as vitrineIcon from '../images/vitrine.ico';

export class VitrineLoader extends React.Component<null, any> {
	public constructor() {
		super(undefined);

		this.state = {
			displayedInfo: 'Loading...'
		};
	}

	public componentDidMount() {
		ipcRenderer.on('loaderServer.no-update-found', this.launchClient.bind(this));

		ipcRenderer.send('loader.ready');
		this.setState({
			displayedInfo: 'Searching for updates...'
		});
	}

	private launchClient(event: Electron.Event) {
		this.setState({
			displayedInfo: 'Launching...'
		}, () => {
			event.sender.send('loader.launch-client');
		});
	}

	public render(): JSX.Element {
		return (
			<div className={css(styles.loader)}>
				<span className={css(styles.titleSpan)}>Vitrine</span>
				<div className={css(styles.loaderDiv)}>
					<img
						src={vitrineIcon}
						className={css(styles.loaderIcon)}
					/>
				</div>
				<span
					className={css(styles.infosSpan)}
					style={{ display: (this.state.displayedInfo) ? ('inline') : ('none') }}
				>
					{this.state.displayedInfo}
					<i className={`fa fa-cog fa-fw fa-spin`}/>
				</span>
			</div>
		);
	}
}

const pulseKeyframes: any = {
	'to': {
		boxShadow: `${0} ${0} ${0} ${45..px()} ${rgba(141, 89, 24, 0)}`
	}
};

const styles: React.CSSProperties = StyleSheet.create({
	loader: {
		textAlign: 'center',
		padding: 7
	},
	loaderDiv: {
		margin: 4
	},
	loaderIcon: {
		width: 125,
		margin: 14,
		borderRadius: 100,
		boxShadow: `${0} ${0} ${0} ${0} ${rgba(141, 89, 24, 0.7)}`,
		animationName: [pulseKeyframes],
		animationDuration: `${1.25}s`,
		animationIterationCount: 'infinite',
		animationTimingFunction: `cubic-bezier(${0.66}, ${0}, ${0}, ${1})`
	},
	titleSpan: {
		fontWeight: 600,
		fontSize: 40,
		opacity: 0.4,
		textTransform: 'capitalize',
		fontVariant: 'small-caps'
	},
	infosSpan: {
		fontStyle: 'italic',
		opacity: 0.4,
		fontSize: 17
	}
});