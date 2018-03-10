import * as React from 'react';
import { Button, Modal } from 'semantic-ui-react';
import { StyleSheet, css } from 'aphrodite';
import { margin, padding, rgba } from 'css-verbose';

import { serverListener } from '../ServerListener';
import { localizer } from '../Localizer';

interface State {
	visible: boolean,
	error?: Error
}

export class ErrorsWrapper extends React.Component<{}, State> {
	constructor(props: any) {
		super(props);

		this.state = {
			visible: false
		};
	}

	private quitApplication() {
		serverListener.send('quit-application', false);
	}

	private relaunchApplication() {
		serverListener.send('quit-application', true);
	}

	public componentDidCatch(error: Error) {
		this.setState({
			error,
			visible: true
		});
	}

	public render(): JSX.Element {
		if (this.state.error)
			return (
				<Modal
					open={this.state.visible}
					className={css(styles.modal)}
				>
					<Modal.Header>
						{localizer.f('crash')}
					</Modal.Header>
					<Modal.Content>
						<span className={css(styles.errorIcon)}>:(</span>
						<pre className={css(styles.errorStack)}>
							{this.state.error.stack}
						</pre>
					</Modal.Content>
					<Modal.Actions>
						<Button
							secondary={true}
							onClick={this.quitApplication}
						>
							{localizer.f('quit')}
						</Button>
						<Button
							secondary={true}
							onClick={this.relaunchApplication}
						>
							{localizer.f('relaunch')}
						</Button>
					</Modal.Actions>
				</Modal>
			);
		else
			return this.props.children as JSX.Element;
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	modal: {
		margin: margin(13..rem(), 'auto')
	},
	modalContent: {
		backgroundColor: '#332929'
	},
	errorIcon: {
		fontSize: 205,
		position: 'absolute',
		color: rgba(255, 50, 50, 0.12),
		top: -50,
		right: 50
	},
	errorStack: {
		fontFamily: 'Inconsolata',
		fontSize: 16,
		padding: padding(10,),
		overflowX: 'auto',
		color: '#BDB3B3',
		backgroundColor: '#272020',
		border: `solid ${1..px()} #463131`,
		'::selection': {
			backgroundColor: rgba(101, 55, 55, 0.26)
		}
	}
});
