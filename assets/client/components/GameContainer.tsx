import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { margin, padding, rgba } from 'css-verbose';

import { VitrineComponent } from './VitrineComponent';
import { BlurPicture } from './BlurPicture';
import { CirclePercentage } from './CirclePercentage';
import { formatTimePlayed, urlify } from '../helpers';
import { localizer } from '../Localizer';

import * as bootstrapVariables from '!!sass-variable-loader!../sass/bootstrap.variables.scss';

export class GameContainer extends VitrineComponent {
	public constructor(props: any) {
		super(props);
		this.state = {
			selectedGame: props.selectedGame,
			backgroundImage: 'none'
		};
	}

	public componentWillReceiveProps(props: any) {
		if (props.selectedGame) {
			this.setState({
				selectedGame: props.selectedGame
			}, () => {
				let backgroundImage: string;
				if (props.selectedGame && props.selectedGame.details.backgroundScreen) {
					backgroundImage = urlify(props.selectedGame.details.backgroundScreen);
				}
				else
					backgroundImage = 'none';
				this.setState({
					backgroundImage
				});
			});
		}
	}

	public render(): JSX.Element {
		let gameContainer: JSX.Element;

		if (this.state.selectedGame) {
			gameContainer = (
				<div className={`row ${css(styles.selectedGameCore)}`}>
					<div className="col-md-8">
						<h1 className={css(styles.selectedGameCoreH1)}>{this.state.selectedGame.name}</h1>
						<div className={css(styles.selectedGameInfos)}>
							<button
								onClick={this.props.launchGameCallback.bind(null, this.state.selectedGame.uuid)}
								className="btn btn-primary"
							>
								<i className="fa fa-play"/> {localizer.f('play')}
							</button>
							<span className={css(styles.selectedGameInfosSpan)}>
								{(this.state.selectedGame.timePlayed) ? (formatTimePlayed(this.state.selectedGame.timePlayed)) : ('')}
							</span>
						</div>
						<div className={css(styles.selectedGameInfos)}>
							<div className="row">
								<div className="col-md-8">
									<div className="row">
										<div className="col-md-4">
											<strong>{localizer.f('developerLabel')}</strong>
										</div>
										<div className="col-md-8">
											{this.state.selectedGame.details.developer}
										</div>
									</div>
									<div className="row">
										<div className="col-md-4">
											<strong>{localizer.f('publisherLabel')}</strong>
										</div>
										<div className="col-md-8">
											{this.state.selectedGame.details.publisher}
										</div>
									</div>
								</div>
								<div className="col-md-4">
									<CirclePercentage percentage={this.state.selectedGame.details.rating} />
								</div>
							</div>
							<hr className={css(styles.selectedGameCoreHr)}/>
							<p className={css(styles.selectedGameDesc)}>
								{this.state.selectedGame.details.summary.split('\n').map((section: string, index: number) =>
									<span key={index}>
										{section}
										<br/>
									</span>
								)}
							</p>
						</div>
					</div>
					<div className="col-md-4">
						<div className={css(styles.coverDiv)}>
							<BlurPicture
								faIcon={'play'}
								fontSize={125}
								background={this.state.selectedGame.details.cover}
								clickHandler={this.props.launchGameCallback.bind(null, this.state.selectedGame.uuid)}
							/>
						</div>
					</div>
				</div>
			);
		}
		else {
			gameContainer = (
				<div className={css(styles.noSelectedGame)}>
					<h1>{localizer.f('welcomeMessage')}</h1>
					<hr className={css(styles.noSelectedGameH1)}/>
					<p>{localizer.f('desc')}</p>
				</div>
			);
		}

		return (
			<div className="row full-height">
				<div className={`col-sm-8 col-lg-10 col-sm-offset-4 col-lg-offset-2 ${css(styles.selectedGameContainer)}`}>
					<div className={`full-height selected-game-background`}>
						{gameContainer}
						<div
							className={css(styles.selectedGameBackground)}
							style={{ backgroundImage: this.state.backgroundImage }}
						/>
					</div>
				</div>
				{this.checkErrors()}
			</div>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	selectedGameContainer: {
		height: `${100}%`,
		background: `radial-gradient(ellipse at center, ${rgba(131, 131, 131, 0.08)} ${0}%, ${rgba(0, 0, 0, 0.76)} ${120..percents()})`,
		overflow: 'hidden'
	},
	selectedGameBackground: {
		position: 'absolute',
		zIndex: -1,
		width: 100..percents(),
		height: 100..percents(),
		top: 0,
		left: 0,
		opacity: 0.8,
		backgroundRepeat: 'no-repeat',
		backgroundSize: `${100..percents()} ${100..percents()}`,
		filter: `blur(${4..px()})`,
		transition: `${150}ms ease`
	},
	noSelectedGame: {
		padding: 50
	},
	noSelectedGameH1: {
		fontWeight: 300,
		fontSize: 50
	},
	selectedGameCore: {
		padding: padding(25, 50)
	},
	selectedGameCoreH1: {
		fontWeight: 400,
		fontSize: 33,
		marginBottom: 40,
		color: bootstrapVariables.textColor
	},
	selectedGameCoreHr: {
		borderTop: `solid ${1..px()} ${rgba(210, 210, 210, 0.15)}`
	},
	selectedGameInfos: {
		backgroundColor: rgba(0, 0, 0, 0.49),
		padding: padding(13, 24),
		color: '#E4E4E4',
		fontSize: 1.2.em(),
		borderRadius: 3,
		margin: margin(10, 0)
	},
	selectedGameInfosSpan: {
		marginLeft: 15
	},
	selectedGameDesc: {
		maxHeight: 170,
		overflowY: 'auto',
		backgroundColor: rgba(0, 0, 0, 0.2),
		borderRadius: 3
	},
	coverDiv: {
		paddingLeft: 40
	}
});
