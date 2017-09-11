import * as React from 'react';

import './TaskBar.scss';

export class TaskBar extends React.Component {
	render() {
		return (
			<div>
				<div id="taskbar">
					<div className="row">
						<div className="col-md-1">
							<button className="btn btn-primary" data-toggle="modal" data-target="#add-game-modal">
								<i className="fa fa-plus"/>
							</button>
							<button id="refresh-btn" className="btn btn-primary">
								<i className="fa fa-refresh"/>
							</button>
						</div>
						<div className="col-md-2">
							<div id="update-bar" className="progress">
								<div className="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
