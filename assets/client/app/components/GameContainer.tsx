import * as React from 'react';
import { Button, Grid } from 'semantic-ui-react';
import * as moment from 'moment';
import { StyleSheet, css } from 'aphrodite';
import { border, margin, padding, rgba } from 'css-verbose';
import * as FontAwesomeIcon from '@fortawesome/react-fontawesome'

import { PlayableGame } from '../../../models/PlayableGame';
import { VitrineComponent } from './VitrineComponent';
import { BlurPicture } from './BlurPicture';
import { CirclePercentage } from './CirclePercentage';
import { formatTimePlayed, urlify } from '../helpers';
import { localizer } from '../Localizer';

import { faPlay } from '@fortawesome/fontawesome-free-solid';
import * as lessVars from 'less-vars-loader?camelCase&resolveVariables!../../resources/less/theme/globals/site.variables';

interface Props {
	selectedGame: PlayableGame
	launchGame: (gameUuid: string) => void
}

interface State {
	backgroundImage: string,
	mainColor: string
}

export class GameContainer extends VitrineComponent<Props, State> {
	public constructor(props: Props) {
		super(props);

		this.state = {
			backgroundImage: 'none',
			mainColor: lessVars.primaryColor
		};
	}

	public componentWillReceiveProps(props: Props) {
		if (!props.selectedGame) {
			this.setState({
				backgroundImage: 'none',
				mainColor: lessVars.primaryColor
			});
			return;
		}
		let backgroundImage, mainColor: string;
		if (props.selectedGame && props.selectedGame.details.backgroundScreen) {
			backgroundImage = urlify(props.selectedGame.details.backgroundScreen);
			mainColor = props.selectedGame.ambientColor || lessVars.primaryColor;
		}
		else {
			backgroundImage = 'none';
			mainColor = lessVars.primaryColor;
		}
		this.setState({
			backgroundImage,
			mainColor
		});
	}

	public render(): JSX.Element {
		let gameContainer: JSX.Element;

		if (this.props.selectedGame)
			gameContainer = (
				<Grid className={css(styles.gameCore)}>
					<Grid.Column width={11}>
						<h1 className={css(styles.gameCoreTitle)}>{this.props.selectedGame.name}</h1>
						<div className={css(styles.gameInfosRegion)}>
							<Button
								onClick={this.props.launchGame.bind(null, this.props.selectedGame.uuid)}
								primary={true}
							>
								<FontAwesomeIcon icon={faPlay} size={'sm'}/> {localizer.f('play')}
							</Button>
							<span className={css(styles.gameTimePlayed)}>
								{(this.props.selectedGame.timePlayed) ? (formatTimePlayed(this.props.selectedGame.timePlayed)) : ('')}
							</span>
						</div>
						<div className={css(styles.gameInfosRegion)}>
							<Grid>
								<Grid.Column width={11}>
									<Grid>
										<Grid.Column width={5} className={css(styles.developerGridColumn)}>
											<strong>{localizer.f('developerLabel')}</strong>
										</Grid.Column>
										<Grid.Column width={11} className={css(styles.developerGridColumn)}>
											{this.props.selectedGame.details.developer}
										</Grid.Column>
									</Grid>
									<Grid>
										<Grid.Column width={5} className={css(styles.publisherGridColumn)}>
											<strong>{localizer.f('publisherLabel')}</strong>
										</Grid.Column>
										<Grid.Column width={11} className={css(styles.publisherGridColumn)}>
											{this.props.selectedGame.details.publisher}
										</Grid.Column>
									</Grid>
									<Grid>
										<Grid.Column width={5} className={css(styles.developerGridColumn)}>
											<strong>{localizer.f('releaseDateLabel')}</strong>
										</Grid.Column>
										<Grid.Column width={11} className={css(styles.developerGridColumn)}>
											{moment(this.props.selectedGame.details.releaseDate).format('DD/MM/YYYY')}
										</Grid.Column>
									</Grid>
									<Grid>
										<Grid.Column width={5} className={css(styles.publisherGridColumn)}>
											<strong>{localizer.f('genresLabel')}</strong>
										</Grid.Column>
										<Grid.Column width={11} className={css(styles.publisherGridColumn)}>
											{this.props.selectedGame.details.genres.map((genre: string) => localizer.genre(genre)).join(', ')}
										</Grid.Column>
									</Grid>
								</Grid.Column>
								<Grid.Column width={5}>
									<CirclePercentage
										percentage={this.props.selectedGame.details.rating}
										color={this.state.mainColor}
									/>
								</Grid.Column>
							</Grid>
							<hr className={css(styles.gameCoreHr)}/>
							<p className={css(styles.gameDesc)}>
								{this.props.selectedGame.details.summary.split('\n').map((section: string, index: number) =>
									<span key={index}>
										{section}
										<br/>
									</span>
								)}
							</p>
						</div>
					</Grid.Column>
					<Grid.Column width={5} style={{ height: 75..percents() }}>
						<BlurPicture
							faIcon={faPlay}
							fontSize={125}
							background={this.props.selectedGame.details.cover}
							clickHandler={this.props.launchGame.bind(null, this.props.selectedGame.uuid)}
						/>
					</Grid.Column>
				</Grid>
			);
		else
			gameContainer = (
				<div className={css(styles.noSelectedGame)}>
					<span className={css(styles.noSelectedGameTitle)}>
						{localizer.f('welcomeMessage')}
					</span>
					<hr className={css(styles.noSelectedGameHr)}/>
					<p
						dangerouslySetInnerHTML={{ __html: localizer.f('desc') }}
						className={css(styles.noSelectedGameText)}
					/>
				</div>
			);

		return (
			<Grid.Column className={css(styles.gameContainerWrapper)}>
				<div className={css(styles.gameContainer)}>
					{gameContainer}
					<div
						className={css(styles.gameBackground)}
						style={{ backgroundImage: this.state.backgroundImage }}
					/>
				</div>
				{this.checkErrors()}
			</Grid.Column>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	gameContainerWrapper: {
		width: 84.5.percents(),
		padding: 0,
		overflow: 'hidden'
	},
	gameContainer: {
		height: `${100}%`,
		background: `radial-gradient(ellipse at center, ${rgba(131, 131, 131, 0.08)} ${0}%, ${rgba(0, 0, 0, 0.76)} ${120..percents()})`,
		overflow: 'hidden'
	},
	gameBackground: {
		position: 'absolute',
		zIndex: -1,
		width: 101..percents(),
		height: 101..percents(),
		top: -5,
		left: -5,
		opacity: 0.5,
		backgroundRepeat: 'no-repeat',
		backgroundSize: `${100..percents()} ${100..percents()}`,
		filter: `blur(${4..px()})`,
		transition: `${150}ms ease`
	},
	gameCore: {
		padding: padding(50, 25, 50),
		margin: 0,
		height: 100..percents()
	},
	gameCoreTitle: {
		fontWeight: 400,
		fontSize: 33,
		marginBottom: 40,
		color: rgba(255, 255, 255, 0.66)
	},
	gameCoreHr: {
		border: 'none',
		borderTop: `solid ${1..px()} ${rgba(210, 210, 210, 0.15)}`,
		margin: margin(30, 0),
		width: 97..percents()
	},
	gameInfosRegion: {
		backgroundColor: rgba(0, 0, 0, 0.49),
		padding: padding(13, 24),
		color: '#E4E4E4',
		fontSize: 1.2.em(),
		borderRadius: 3,
		margin: margin(10, 0)
	},
	developerGridColumn: {
		paddingBottom: 5
	},
	publisherGridColumn: {
		paddingTop: 5
	},
	gameTimePlayed: {
		marginLeft: 15
	},
	gameDesc: {
		padding: 20,
		maxHeight: 210,
		minHeight: 160,
		lineHeight: 1.5,
		overflowY: 'auto',
		backgroundColor: rgba(0, 0, 0, 0.2),
		borderRadius: 3
	},
	gameCover: {
		height: 80..percents(),
		paddingTop: 25
	},
	noSelectedGame: {
		padding: 50
	},
	noSelectedGameTitle: {
		fontSize: 30,
		marginTop: 45,
		display: 'block'
	},
	noSelectedGameHr: {
		border: 'none',
		borderTop: border(1, 'solid', rgba(202, 202, 202, 0.4)),
		margin: margin(30, 0, 20)
	},
	noSelectedGameText: {
		fontSize: 16,
		lineHeight: 1.6
	}
});
