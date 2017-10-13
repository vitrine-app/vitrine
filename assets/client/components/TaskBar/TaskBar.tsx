import * as React from 'react';
import { ipcRenderer } from 'electron';

import { VitrineComponent } from '../VitrineComponent';
import { localizer } from '../../Localizer';

import './TaskBar.scss';

export class TaskBar extends VitrineComponent {
	public constructor(props: any) {
		super(props);
	}

	private static refreshBtnClickHandler() {
		ipcRenderer.send('client.refresh-potential-games');
	}

	public render(): JSX.Element {
		return (
			<div>
				<div className="task-bar">
					<div className="row">
						<div className="col-md-1">
							<div className="row">
								<div className="col-md-4">
									<button className="btn btn-primary" data-toggle="modal" data-target="#add-game-modal">
										<i className="fa fa-plus"/>
									</button>
								</div>
								<div className="col-md-4">
									<button className="btn btn-primary" onClick={ TaskBar.refreshBtnClickHandler }>
										<i className="fa fa-refresh"/>
									</button>
								</div>
								<div className="col-md-4">
									<button className="btn btn-primary" data-toggle="modal" data-target="#settings-modal">
										<i className="fa fa-cogs"/>
									</button>
								</div>
							</div>
						</div>
						<div
							className="potential-games-container col-md-2"
							style={ {display: (this.props.potentialGames.games.length) ? ('block') : ('none')} }
						>
							<button className="btn btn-primary" data-toggle="modal" data-target="#add-potential-games-modal">
								{ localizer.f('potentialGamesAdd', this.props.potentialGames.games.length) }
							</button>
						</div>
						<div
							className="col-md-offset-7 col-md-2"
							style={ {display: (this.props.updateProgress) ? ('block') : ('none')} }
						>
							<div className="update-bar progress">
								<div
									className="progress-bar progress-bar-striped active"
									role="progressbar"
									style={ {width: (this.props.updateProgress) ? (Math.round(this.props.updateProgress.percent) + '%') : ('0%')} }
								/>
							</div>
						</div>
					</div>
				</div>
				{ this.checkErrors() }
			</div>
		);
	}
}
