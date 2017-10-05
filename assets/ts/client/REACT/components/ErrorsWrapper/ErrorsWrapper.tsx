import * as React from 'react';
import { remote } from 'electron'

import './ErrorWrapper.scss';
import { localizer } from '../../Localizer';

export class ErrorsWrapper extends React.Component<any, any> {
	constructor(props: any) {
		super(props);

		this.state = {};
	}
	public componentDidCatch(error: Error) {
		this.setState({
			error: error
		}, () => {
			$('#error-modal').modal('show');
		});
	}

	public render() {
		if (this.state.error)
			return (
				<div id="error-modal" className="modal fade show" role="dialog">
					<div className="modal-dialog">
						<div className="modal-content">
							<span className="error-icon">:(</span>
							<div className="modal-body">
								<h4>{ localizer.f('crash') }</h4>
								<hr/>
								<p>{ this.state.error.message }</p>
								<pre>{ this.state.error.stack }</pre>
							</div>
							<div className="modal-footer">
								<button
									onClick={ ErrorsWrapper.quitApplication }
									className="btn btn-danger"
								>
									{ localizer.f('quit') }
								</button>
							</div>
						</div>
					</div>
				</div>
			);
		else
			return this.props.children;
	}

	private static quitApplication() {
		remote.getCurrentWindow().close();
	}
}