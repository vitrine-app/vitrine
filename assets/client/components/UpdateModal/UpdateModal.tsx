import * as React from 'react';
import { ipcRenderer, shell } from 'electron';

import { VitrineComponent } from '../VitrineComponent';
import { localizer } from '../../Localizer';

import './UpdateModal.scss'

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
			<div id="update-modal" className="modal fade" role="dialog">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-body">
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
			</div>
		);
	}
}
