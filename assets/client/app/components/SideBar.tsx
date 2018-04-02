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
import { VitrineButton } from './VitrineButton';

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

export const SideBar: React.StatelessComponent<Props> = (props: Props) => {
	const clickGameHandler = (event: any) => {
		const selectedGame: PlayableGame = props.playableGames.getGame(event.target.id.replace('sidebar-game:', ''));
		props.selectGame(selectedGame);
	};

	const taskBarRefreshBtnClickHandler = () => {
		serverListener.send('refresh-potential-games');
	};

	const potentialGamesButton = () => {
		props.openPotentialGamesAddModal();
	};

	serverListener.listen('potential-games-search-begin', () => {
		props.refreshGames();
	});

	const taskBarElements: JSX.Element = (
		<div className={css(styles.commandsGroup)}>
			<Grid className={css(styles.commandsGrid)}>
				<Grid.Column width={4} className={css(styles.commandButton)}>
					<VitrineButton
						icon={faPlus}
						tooltip={localizer.f('addGameLabel')}
						onClick={props.openGameAddModal}
					/>
				</Grid.Column>
				<Grid.Column width={4} className={css(styles.commandButton)}>
					<VitrineButton
						icon={faSyncAlt}
						spin={props.refreshingGames}
						tooltip={localizer.f('refreshLabel')}
						onClick={taskBarRefreshBtnClickHandler}
					/>
				</Grid.Column>
				<Grid.Column width={4} className={css(styles.commandButton)}>
					<VitrineButton
						icon={faCogs}
						tooltip={localizer.f('settings')}
						onClick={props.openSettingsModal}
					/>
				</Grid.Column>
				<Grid.Column width={4} className={css(styles.commandButton, styles.addGameButton)}>
					<Button
						primary={true}
						style={{ visibility: (props.potentialGames.size()) ? ('visible') : ('hidden') }}
						onClick={potentialGamesButton}
					>
						{props.potentialGames.size()}
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
					{props.playableGames.map((game: PlayableGame, index: number) => (
							<ContextMenuTrigger
								id='sidebar-games-context-menu'
								key={index}
							>
								<li
									id={`sidebar-game:${game.uuid}`}
									className={
										css(styles.gamesListLi) +
										((props.selectedGame && props.selectedGame.uuid === game.uuid) ? (' ' + css(styles.selectedGame)) : (''))
									}
									onClick={clickGameHandler}
									onDoubleClick={props.launchGame.bind(null, game.uuid)}
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
};

const styles: React.CSSProperties = StyleSheet.create({
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
