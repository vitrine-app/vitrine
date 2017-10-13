import * as React from 'react';
import { ipcRenderer } from 'electron';
import * as textEllipsis from 'text-ellipsis';

import { VitrineComponent } from '../VitrineComponent';
import { BlurPicture } from '../BlurPicture/BlurPicture';
import { CirclePercentage } from '../CirclePercentage/CirclePercentage';
import { beforeCss, formatTimePlayed, launchGame, urlify } from '../../helpers';
import { localizer } from '../../Localizer';

import './GameContainer.scss';

export class GameContainer extends VitrineComponent {
	public constructor(props: any) {
		super(props);

		this.state = {
			selectedGame: props.selectedGame
		};
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

		beforeCss('.selected-game-background', {
			'background-image': currentBackgroundImage
		});

	}

	public render(): JSX.Element {
		let gameContainer: JSX.Element;

		if (this.state.selectedGame) {
			gameContainer = (
				<div className="row selected-game-core">
					<div className="col-md-8">
						<h1>{ this.state.selectedGame.name }</h1>
						<hr/>
						<div className="selected-game-infos">
							<button
								onClick={ launchGame.bind(null, this.state.selectedGame.uuid) }
								className="btn btn-primary"
							>
								<i className="fa fa-play"/> { localizer.f('play') }
							</button>
							<span>{ (this.state.selectedGame.timePlayed) ? (formatTimePlayed(this.state.selectedGame.timePlayed)) : ('') }</span>
						</div>
						<div className="selected-game-infos">
							<div className="row">
								<div className="col-md-8">
									<div className="row">
										<div className="col-md-4">
											<strong>{ localizer.f('developerLabel') }</strong>
										</div>
										<div className="col-md-8">
											{ this.state.selectedGame.details.developer }
										</div>
									</div>
									<div className="row">
										<div className="col-md-4">
											<strong>{ localizer.f('publisherLabel') }</strong>
										</div>
										<div className="col-md-8">
											{ this.state.selectedGame.details.publisher }
										</div>
									</div>
								</div>
								<div className="col-md-4">
									<CirclePercentage percentage={ this.state.selectedGame.details.rating } />
								</div>
							</div>
							<hr/>
							{ textEllipsis(this.state.selectedGame.details.summary, 750) }
						</div>
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
				<div className="no-selected-game">
					<h1>{ localizer.f('welcomeMessage') }</h1>
					<hr/>
					<p>{ localizer.f('desc') }</p>
				</div>
			);
		}

		return (
			<div className="row full-height">
				<div className="col-sm-8 col-lg-10 col-sm-offset-4 col-lg-offset-2 selected-game-container">
					<div className="full-height selected-game-background">
						{ gameContainer }
					</div>
				</div>
				{ this.checkErrors() }
			</div>
		);
	}
}
