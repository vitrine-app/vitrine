import * as React from 'react';
import { remote, ipcRenderer } from 'electron';
import { StyleSheet, css } from 'aphrodite';
import { rgba } from 'css-verbose';

import { localizer } from '../Localizer';

export class ErrorsWrapper extends React.Component<any, any> {
	constructor(props: any) {
		super(props);

		this.state = {};
	}

	private static quitApplication() {
		ipcRenderer.send('client.quit-application', false);
	}

	private static relaunchApplication() {
		ipcRenderer.send('client.quit-application', true);
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
								<p className={css(styles.errorMessage)}>{this.state.error.message}</p>
								<pre className={css(styles.errorStack)}>{this.state.error.stack}</pre>
							</div>
							<div className="modal-footer">
								<button
									onClick={ErrorsWrapper.quitApplication}
									className="btn btn-danger"
								>
									{localizer.f('quit')}
								</button>
								<button
									onClick={ErrorsWrapper.relaunchApplication}
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
			return this.props.children;
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
	errorMessage: {
		fontSize: 23,
		marginTop: 15
	},
	errorStack: {
		color: '#BDB3B3',
		backgroundColor: '#272020',
		border: `solid ${1}px #674242`
	},
	hr: {
		marginTop: 14,
		marginBottom: 14,
		borderTop: `solid ${1}px ${rgba(179, 144, 144, 0.39)}`
	}
});
