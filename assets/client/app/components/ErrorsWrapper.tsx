import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { rgba } from 'css-verbose';

import { serverListener } from '../ServerListener';
import { localizer } from '../Localizer';

interface State {
	error?: Error
}

export class ErrorsWrapper extends React.Component<{}, State> {
	constructor(props: any) {
		super(props);

		this.state = {};
	}

	private quitApplication() {
		serverListener.send('quit-application', false);
	}

	private relaunchApplication() {
		serverListener.send('quit-application', true);
	}

	public componentDidCatch(error: Error) {
		this.setState({
			error: error
		}, () => {
			$('#error-modal').modal('show');
		});
	}

	public render(): JSX.Element {
		if (this.state.error)
			return (
				<div
					id="error-modal"
					className="modal fade show"
					role="dialog"
					data-backdrop="static"
				>
					<div className="modal-dialog">
						<div className="modal-content">
							<span className={css(styles.errorIcon)}>:(</span>
							<div className="modal-body">
								<h4>{localizer.f('crash')}</h4>
								<hr className={css(styles.hr)}/>
								<pre className={css(styles.errorStack)}>{this.state.error.stack}</pre>
							</div>
							<div className="modal-footer">
								<button
									onClick={this.quitApplication}
									className="btn btn-danger"
								>
									{localizer.f('quit')}
								</button>
								<button
									onClick={this.relaunchApplication}
									className="btn btn-danger"
								>
									{localizer.f('relaunch')}
								</button>
							</div>
						</div>
					</div>
				</div>
			);
		else
			return this.props.children as JSX.Element;
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	modalContent: {
		backgroundColor: '#332929'
	},
	errorIcon: {
		fontSize: 205,
		position: 'absolute',
		color: rgba(255, 50, 50, 0.12),
		top: -50,
		right: 23
	},
	errorStack: {
		color: '#BDB3B3',
		backgroundColor: '#272020',
		border: `solid ${1..px()} #674242`
	},
	hr: {
		marginTop: 14,
		marginBottom: 14,
		borderTop: `solid ${1..px()} ${rgba(179, 144, 144, 0.39)}`
	}
});
