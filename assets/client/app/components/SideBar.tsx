import { css, StyleSheet } from 'aphrodite';
import { margin, padding, rgba } from 'css-verbose';
import * as React from 'react';
import { ContextMenuTrigger } from 'react-contextmenu';
import { Button, Grid } from 'semantic-ui-react';

import { faCogs, faPlus, faSyncAlt } from '@fortawesome/fontawesome-free-solid';
import { GamesCollection } from '../../../models/GamesCollection';
import { PlayableGame } from '../../../models/PlayableGame';
import { PotentialGame } from '../../../models/PotentialGame';
import { ContextMenu } from '../containers/ContextMenu';
import { localizer } from '../Localizer';
import { serverListener } from '../ServerListener';
import { ActionButton } from './ActionButton';
import { VitrineComponent } from './VitrineComponent';

interface Props {
	potentialGames: GamesCollection<PotentialGame>;
	playableGames: GamesCollection<PlayableGame>;
	selectedGame: PlayableGame;
	refreshingGames: boolean;
	selectGame: (selectedGame: PlayableGame) => void;
	refreshGames: () => void;
	openGameAddModal: () => void;
	openPotentialGamesAddModal: () => void;
	openSettingsModal: () => void;
	launchGame: (gameUuid: string) => void;
}

export class SideBar extends VitrineComponent<Props, {}> {
	public constructor(props: Props) {
		super(props);

		this.clickGameHandler = this.clickGameHandler.bind(this);
		this.taskBarRefreshBtnClickHandler = this.taskBarRefreshBtnClickHandler.bind(this);
		this.potentialGamesButton = this.potentialGamesButton.bind(this);
	}

	private clickGameHandler(event: any) {
		const selectedGame: PlayableGame = this.props.playableGames.getGame(event.target.id.replace('sidebar-game:', ''));
		this.props.selectGame(selectedGame);
	}

	private taskBarRefreshBtnClickHandler() {
		serverListener.send('refresh-potential-games');
	}

	private potentialGamesButton() {
		this.props.openPotentialGamesAddModal();
	}

	public componentDidMount() {
		serverListener.listen('potential-games-search-begin', () => {
			this.props.refreshGames();
		});
	}

	public render() {
		const taskBarElements: JSX.Element = (
			<div className={css(styles.commandsGroup)}>
				<Grid className={css(styles.commandsGrid)}>
					<Grid.Column width={4} className={css(styles.commandButton)}>
						<ActionButton
							icon={faPlus}
							tooltip={localizer.f('addGameLabel')}
							onClick={this.props.openGameAddModal}
						/>
					</Grid.Column>
					<Grid.Column width={4} className={css(styles.commandButton)}>
						<ActionButton
							icon={faSyncAlt}
							spin={this.props.refreshingGames}
							tooltip={localizer.f('refreshLabel')}
							onClick={this.taskBarRefreshBtnClickHandler}
						/>
					</Grid.Column>
					<Grid.Column width={4} className={css(styles.commandButton)}>
						<ActionButton
							icon={faCogs}
							tooltip={localizer.f('settings')}
							onClick={this.props.openSettingsModal}
						/>
					</Grid.Column>
					<Grid.Column width={4} className={css(styles.commandButton, styles.addGameButton)}>
						<Button
							primary={true}
							style={{ visibility: (this.props.potentialGames.size()) ? ('visible') : ('hidden') }}
							onClick={this.potentialGamesButton}
						>
							{this.props.potentialGames.size()}
						</Button>
					</Grid.Column>
				</Grid>
			</div>
		);

		return (
			<Grid.Column className={css(styles.sideBarWrapper)}>
				{taskBarElements}
				<div className={css(styles.sideBarContent)}>
					<ul className={css(styles.gamesListUl)}>
						{this.props.playableGames.map((game: PlayableGame, index: number) => (
								<ContextMenuTrigger
									id='sidebar-games-context-menu'
									key={index}
								>
									<li
										id={`sidebar-game:${game.uuid}`}
										className={
											css(styles.gamesListLi) +
											((this.props.selectedGame && this.props.selectedGame.uuid === game.uuid) ? (' ' + css(styles.selectedGame)) : (''))
										}
										onClick={this.clickGameHandler}
										onDoubleClick={this.props.launchGame.bind(null, game.uuid)}
									>
										{game.name}
									</li>
								</ContextMenuTrigger>
							)
						)}
					</ul>
				</div>
				<ContextMenu/>
			</Grid.Column>
		);
	}
}

const styles: React.CSSProperties & any = StyleSheet.create({
	sideBarWrapper: {
		padding: 0,
		width: 15.5.percents(),
		height: 100..percents()
	},
	commandsGroup: {
		height: 45,
		backgroundColor: '#23211F',
		paddingLeft: 5..percents(),
		paddingRight: 5..percents()
	},
	commandsGrid: {
		margin: 0,
		height: 100..percents()
	},
	commandButton: {
		paddingTop: 0,
		paddingBottom: 0
	},
	addGameButton: {
		marginTop: 2
	},
	sideBarContent: {
		height: `calc(${100..percents()} - ${45..px()})`,
		overflowX: 'hidden',
		overflowY: 'auto',
		backgroundColor: '#292724'
	},
	gamesListUl: {
		height: 100..percents(),
		listStyleType: 'none',
		padding: padding(0),
		margin: margin(0)
	},
	gamesListLi: {
		display: 'block',
		fontSize: 15,
		color: '#A5A5A5',
		padding: padding(10, 20, 10),
		cursor: 'pointer',
		':hover': {
			backgroundColor: rgba(150, 136, 116, 0.13),
			color: '#AFACA7',
			transition: `${66}ms`
		}
	},
	selectedGame: {
		backgroundColor: rgba(175, 153, 124, 0.14),
		color: '#AFACA7',
		fontWeight: 600,
		paddingLeft: 30,
		paddingRight: 10,
		transition: `${250}ms`
	}
});
