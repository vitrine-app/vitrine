import * as React from 'react';

import { VitrineComponent } from '../VitrineComponent';
import './WizardModal.scss';

export class WizardModal extends VitrineComponent {
	public render(): JSX.Element {
		return (
			<div id="wizard-modal" className="modal fade" role="dialog">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-body">

						</div>
					</div>
				</div>
			</div>
		);
	}
}
