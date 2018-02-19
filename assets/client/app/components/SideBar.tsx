import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { ContextMenuTrigger } from 'react-contextmenu';
import { margin, padding, border, rgba } from 'css-verbose';

import { PlayableGame } from '../../../models/PlayableGame';
import { GamesCollection } from '../../../models/GamesCollection';
import { VitrineComponent } from './VitrineComponent';
import { Button } from './Button';
import { faCogs, faPlus, faSyncAlt } from '@fortawesome/fontawesome-free-solid';
import { localizer } from '../Localizer';
import { PotentialGame } from '../../../models/PotentialGame';
import { serverListener } from '../ServerListener';

interface Props {
	potentialGames: GamesCollection<PotentialGame>,
	playableGames: GamesCollection<PlayableGame>,
	selectedGame: PlayableGame,
	selectGame: Function | any,
	launchGame: Function,
	refreshingGames: boolean,
	refreshGames: Function | any
	isGameLaunched: boolean
}

export class SideBar extends VitrineComponent<Props, {}> {
	private clickGameHandler(event: any) {
		let selectedGame: PlayableGame = this.props.playableGames.getGame(event.target.id.replace('game-', ''));
		this.props.selectGame(selectedGame);
	}

	private taskBarRefreshBtnClickHandler() {
		serverListener.send('refresh-potential-games');
		this.props.refreshGames();
	}

	public render(): JSX.Element {
		let taskBarElements: JSX.Element = (!this.props.isGameLaunched) ? (
			<div className="row">
				<Button
					icon={faPlus}
					tooltip={localizer.f('addGameLabel')}
					onClick='#add-game-modal'
				/>
				<Button
					icon={faSyncAlt}
					spin={this.props.refreshingGames}
					tooltip={localizer.f('refreshLabel')}
					onClick={this.taskBarRefreshBtnClickHandler.bind(this)}
				/>
				<Button
					icon={faCogs}
					tooltip={localizer.f('settings')}
					onClick='#settings-modal'
				/>
				<div
					className={`potential-games-container col-md-2 ${css(styles.potentialGamesContainer)}`}
					style={{ visibility: (this.props.potentialGames.size()) ? ('visible') : ('hidden') }}
				>
					<button
						className={`btn btn-primary ${css(styles.controlBtn)}`}
						data-toggle="modal"
						data-target="#add-potential-games-modal"
					>
						{localizer.f('potentialGamesAdd', this.props.potentialGames.size())}
					</button>
				</div>
			</div>
		) : (null);
		return (
			<div className={css(styles.sideBarContainer)}>
				<div className={css(styles.commandsGroup)}>
					here comes the commands
				</div>
				<div className={css(styles.sideBarContent)}>
					<ul className={css(styles.gamesListUl)}>
						{this.props.playableGames.map((game: PlayableGame, index: number) =>
							<ContextMenuTrigger
								id="sidebar-games-context-menu"
								key={index}
							>
								<li
									id={`game-${game.uuid}`}
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
						)}
					</ul>
				</div>
				{this.checkErrors()}
			</div>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	sideBarContainer: {
		/*height: 95..percents(),
		padding: 0,
		position: 'absolute',
		backgroundColor: rgba(0, 0, 0, 0),
		width: 16..percents(),
		boxShadow: `${6..px()} ${6..px()} ${9..px()} ${rgba(0, 0, 0, 0.2)}`,*/
		position: 'absolute',
		width: 15.5.percents(),
		zIndex: 1,
		height: `calc(${100..percents()} - ${22..px()})`
	},
	commandsGroup: {
		height: 45,
		backgroundColor: '#23211F'
	},
	sideBarContent: {
		height: `calc(${100..percents()} - ${45..px()})`,
		overflowX: 'hidden',
		overflowY: 'auto',
		backgroundColor: '#292724'
	},
	sideBarHr: {
		margin: 0,
		borderTop: border(1, 'solid', '#565149')
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
