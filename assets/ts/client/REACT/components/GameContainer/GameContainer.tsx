import * as React from 'react';
import { ipcRenderer } from 'electron';

import './GameContainer.scss';
import { beforeCss, urlify } from '../../../helpers';

export class GameContainer extends React.Component<any, any> {
	public constructor() {
		super();
	}

	public render() {
		let gameContainer: JSX.Element;

		if (this.props.selectedGame) {
			gameContainer = (
				<div id="game-core" className="row">
					<div className="col-md-8">
						<h1 id="game-title">{ this.props.selectedGame.name }</h1>
						<hr/>
						<div id="game-play" className="selected-game-infos">
							<button className="btn btn-primary">
								<i className="fa fa-play"/> Play
							</button>
							<p></p>
						</div>
						<p id="game-desc" className="selected-game-infos">{ this.props.selectedGame.details.summary }</p>
					</div>
					<div className="col-md-4">
						<div id="selected-game-cover">
							<div className="image"></div>
							<i className="fa fa-play icon animated"></i>
						</div>
					</div>
				</div>
			);
			beforeCss('#game-background', {
				'background-image': urlify(this.props.selectedGame.details.backgroundScreen)
			});
		}
		else {
			gameContainer = (
				<div id="no-game-showcase">
					<h1>Welcome to Vitrine</h1>
					<hr/>
					<p>Desc</p>
				</div>
			);
		}

		return (
			<div className="row full-height">
				<div id="game-container" className="col-sm-8 col-lg-10 col-sm-offset-4 col-lg-offset-2">
					<div id="game-background" className="full-height">
						{ gameContainer }
					</div>
				</div>
			</div>
		);
	}
}
