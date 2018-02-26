import * as React from 'react';
import { Button } from 'semantic-ui-react';
import { StyleSheet, css } from 'aphrodite';
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu';
import { margin, padding, rgba } from 'css-verbose';

import { PlayableGame } from '../../../models/PlayableGame';
import { GamesCollection } from '../../../models/GamesCollection';
import { VitrineComponent } from './VitrineComponent';
import { VitrineButton } from './VitrineButton';
import { faCogs, faPlus, faSyncAlt } from '@fortawesome/fontawesome-free-solid';
import { localizer } from '../Localizer';
import { PotentialGame } from '../../../models/PotentialGame';
import { serverListener } from '../ServerListener';

interface Props {
	potentialGames: GamesCollection<PotentialGame>,
	playableGames: GamesCollection<PlayableGame>,
	selectedGame: PlayableGame,
	refreshingGames: boolean,
	selectGame: (selectedGame: PlayableGame) => void,
	refreshGames: () => void,
	openAddGameModal: () => void,
	isGameLaunched: boolean,
	launchGame: (gameUuid: string) => void,
	editGame: (gameUuid: string) => void,
	editGamePlayTime: (gameUuid: string) => void,
	deleteGame: (gameUuid: string) => void,
}

export class SideBar extends VitrineComponent<Props, {}> {
	private clickGameHandler(event: any) {
		let selectedGame: PlayableGame = this.props.playableGames.getGame(event.target.id.replace('sidebar-game:', ''));
		this.props.selectGame(selectedGame);
	}

	private taskBarRefreshBtnClickHandler() {
		serverListener.send('refresh-potential-games');
		this.props.refreshGames();
	}

	private contextAction(target: HTMLElement, action: string) {
		let gameUuid: string = target.children[0].id.replace('sidebar-game:', '');

		switch (action) {
			case 'launch': {
				this.props.launchGame(gameUuid);
				break;
			}
			case 'edit': {
				this.props.editGame(gameUuid);
				break;
			}
			case 'delete': {
				this.props.deleteGame(gameUuid);
				break;
			}
		}
	}

	public render(): JSX.Element {
		const taskBarElements: JSX.Element = (!this.props.isGameLaunched) ? (
			<div className={css(styles.commandsGroup)}>
				<VitrineButton
					icon={faPlus}
					tooltip={localizer.f('addGameLabel')}
					onClick={() => this.props.openAddGameModal()}
					className={css(styles.commandBtn)}
				/>
				<VitrineButton
					icon={faSyncAlt}
					spin={this.props.refreshingGames}
					tooltip={localizer.f('refreshLabel')}
					onClick={this.taskBarRefreshBtnClickHandler.bind(this)}
					className={css(styles.commandBtn)}
				/>
				<VitrineButton
					icon={faCogs}
					tooltip={localizer.f('settings')}
					className={css(styles.commandBtn)}
				/>
				<Button
					primary={true}
					style={{ visibility: (this.props.potentialGames.size()) ? ('visible') : ('hidden') }}
				>
					{this.props.potentialGames.size()}
					{/*{localizer.f('potentialGamesAdd', this.props.potentialGames.size())}*/}
				</Button>
			</div>
		) : (null);
		return (
			<div className={css(styles.sideBarContainer)}>
				{taskBarElements}
				<div className={css(styles.sideBarContent)}>
					<ul className={css(styles.gamesListUl)}>
						{this.props.playableGames.map((game: PlayableGame, index: number) => (
								<ContextMenuTrigger
									id="sidebar-games-context-menu"
									key={index}
								>
									<li
										id={`sidebar-game:${game.uuid}`}
										className={
											css(styles.gamesListLi) +
											((this.props.selectedGame && this.props.selectedGame.uuid === game.uuid) ? (' ' + css(styles.selectedGame)) : (''))
										}
										onClick={this.clickGameHandler.bind(this)}
										onDoubleClick={this.props.launchGame.bind(null, game.uuid)}
									>
										{game.name}
									</li>
								</ContextMenuTrigger>
							)
						)}
					</ul>
				</div>
				<ContextMenu id="sidebar-games-context-menu">
					<MenuItem onClick={(event: any, data: any, target: HTMLElement) => this.contextAction(target, 'launch')}>
						{localizer.f('play')}
					</MenuItem>
					<MenuItem onClick={(event: any, data: any, target: HTMLElement) => this.contextAction(target, 'edit')}>
						{localizer.f('edit')}
					</MenuItem>
					<MenuItem onClick={() => {}}>
						{localizer.f('editTimePlayed')}
					</MenuItem>
					<MenuItem divider={true}/>
					<MenuItem onClick={(event: any, data: any, target: HTMLElement) => this.contextAction(target, 'delete')}>
						{localizer.f('delete')}
					</MenuItem>
				</ContextMenu>
				{this.checkErrors()}
			</div>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	sideBarContainer: {
		position: 'absolute',
		width: 15.5.percents(),
		zIndex: 1,
		height: `calc(${100..percents()} - ${22..px()})`
	},
	commandsGroup: {
		height: 45,
		backgroundColor: '#23211F',
		paddingLeft: 10..percents()
	},
	commandBtn: {
		margin: margin(0, 13)
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
