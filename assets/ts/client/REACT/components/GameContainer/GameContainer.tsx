import * as React from 'react';
import { ipcRenderer } from 'electron';
import * as textEllipsis from 'text-ellipsis';

import { VitrineComponent } from '../VitrineComponent';
import './GameContainer.scss';
import { BlurPicture } from '../BlurPicture/BlurPicture';
import { beforeCss, formatTimePlayed, launchGame, urlify } from '../../../helpers';
import { localizer } from '../../Localizer';

export class GameContainer extends VitrineComponent {
	public constructor(props: any) {
		super(props);

		this.state = {
			selectedGame: props.selectedGame
		}
	}

	public componentWillReceiveProps(props: any) {
		let currentBackgroundImage: string;
		if (props.selectedGame && props.selectedGame.details.backgroundScreen) {
			currentBackgroundImage = urlify(props.selectedGame.details.backgroundScreen);
			this.setState({
				selectedGame: props.selectedGame
			});
		}
		else
			currentBackgroundImage = 'none';

		beforeCss('#game-background', {
			'background-image': currentBackgroundImage
		});

	}

	public render(): JSX.Element {
		let gameContainer: JSX.Element;

		if (this.state.selectedGame) {
			gameContainer = (
				<div id="game-core" className="row">
					<div className="col-md-8">
						<h1 id="game-title">{ this.state.selectedGame.name }</h1>
						<hr/>
						<div id="game-play" className="selected-game-infos">
							<button
								onClick={launchGame.bind(null, this.state.selectedGame.uuid) }
								className="btn btn-primary"
							>
								<i className="fa fa-play"/> { localizer.f('play') }
							</button>
							<span>{ (this.state.selectedGame.timePlayed) ? (formatTimePlayed(this.state.selectedGame.timePlayed)) : ('')}</span>
						</div>
						<p id="game-desc" className="selected-game-infos">
							{ textEllipsis(this.state.selectedGame.details.summary, 750) }
						</p>
					</div>
					<div className="col-md-4">
						<BlurPicture
							faIcon={ 'play' }
							fontSize={ 125 }
							background={ this.state.selectedGame.details.cover }
							clickHandler={ launchGame.bind(null, this.state.selectedGame.uuid) }
						/>
					</div>
				</div>
			);
		}
		else {
			gameContainer = (
				<div id="no-game-showcase">
					<h1>{ localizer.f('welcomeMessage') }</h1>
					<hr/>
					<p>{ localizer.f('desc') }</p>
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
				{ this.checkErrors() }
			</div>
		);
	}
}
