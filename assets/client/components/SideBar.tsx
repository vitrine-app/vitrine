import * as React from 'react';
import { ipcRenderer } from 'electron';
import { StyleSheet, css } from 'aphrodite';
import { ContextMenuTrigger } from 'react-contextmenu';

import { VitrineComponent } from './VitrineComponent';
import { PlayableGame } from '../../models/PlayableGame';
import { launchGame } from '../helpers';

import * as bootstrapVariables from '!!sass-variable-loader!../sass/bootstrap.variables.scss';

export class SideBar extends VitrineComponent {
	public constructor(props: any) {
		super(props);

		this.state = {
			playableGames: props.playableGames
		}
	}

	private clickGameHandler(event: any) {
		this.props.gameClickHandler(event.target.id.replace('game-', ''));
	}

	public componentWillReceiveProps(props: any) {
		this.setState({
			playableGames: props.playableGames
		});
	}

	public render(): JSX.Element {
		return (
			<div className={`col-sm-4 col-lg-2 ${css(styles.sideBarContainer)}`}>
				<div className={css(styles.sideBarContent)}>
					<ul id="playable-games-list" className={css(styles.gamesListUl)}>
						{this.state.playableGames.games.map((game: PlayableGame, index: number) =>
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
									onDoubleClick={launchGame.bind(null, game.uuid)}
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
		height: `${97}%`,
		padding: 0,
		position: 'absolute',
		backgroundColor: bootstrapVariables.bodyBg,
		width: `${16}%`
	},
	sideBarContent: {
		height: `${96}%`,
		overflowX: 'hidden',
		overflowY: 'auto'
	},
	sideBarHr: {
		margin: 0,
		borderTop: `solid ${1}px #565149`
	},
	gamesListUl: {
		height: `${98}%`,
		listStyleType: 'none',
		padding: 0,
		margin: 0
	},
	gamesListLi: {
		display: 'block',
		fontSize: 15,
		color: '#A5A5A5',
		padding: `${10}px ${20}px ${10}px`,
		cursor: 'pointer',
		':hover': {
			backgroundColor: `rgba(${150}, ${136}, ${116}, ${0.13})`,
			color: '#AFACA7',
			transition: `${66}ms`
		}
	},
	selectedGame: {
		backgroundColor: `rgba(${175}, ${153}, ${124}, ${0.14})`,
		color: '#AFACA7',
		cursor: 'default',
		paddingLeft: 35,
		transition: `${250}ms`
	}
});
