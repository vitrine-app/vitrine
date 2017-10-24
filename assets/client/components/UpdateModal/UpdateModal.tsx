import * as React from 'react';
import { ipcRenderer, shell } from 'electron';
import { StyleSheet, css } from 'aphrodite';

import { VitrineComponent } from '../VitrineComponent';
import { localizer } from '../../Localizer';

export class UpdateModal extends VitrineComponent {
	public constructor(props: any) {
		super(props);

		this.state = {
			releaseUrl: 'https://github.com/paul-roman/vitrine/releases/tag/v'
		};
	}

	private static updateBtnClickHandler() {
		ipcRenderer.send('client.update-app');
	}

	private changeLogsLinkClickHandler(event: any) {
		event.preventDefault();

		shell.openExternal(this.state.releaseUrl + this.props.releaseVersion);
	}

	public render(): JSX.Element {
		return (
			<div id="update-modal" className={`modal fade ${css(styles.updateModal)}`} role="dialog">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className={`modal-body ${css(styles.modalBody)}`}>
							<p id="update-app-disclaimer">
								{ localizer.f('updateTextFirst') } (<strong>{ this.props.releaseVersion }</strong>)
								<br/>
								{ localizer.f('updateTextLast') }
							</p>
							<p id="app-change-logs">
								<a
									onClick={ this.changeLogsLinkClickHandler.bind(this) }
									href="#"
								>
									{ localizer.f('changeLogs') }
								</a>
							</p>
						</div>
						<div className="modal-footer">
							<button className="btn btn-default" data-dismiss="modal">{ localizer.f('cancel') }</button>
							<button
								id="update-app-btn"
								onClick={ UpdateModal.updateBtnClickHandler }
								className="btn btn-success"
							>
								{ localizer.f('update') }
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
	updateModal: {
		top: 27 + 'vh',
		left: 18 + 'vh'
	},
	modalBody: {
		paddingTop: 24
	}
});
