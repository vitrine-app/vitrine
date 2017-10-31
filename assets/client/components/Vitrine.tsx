import * as React from 'react';
import { ipcRenderer } from 'electron';
import { ContextMenu, MenuItem } from 'react-contextmenu';
import { StyleSheet, css } from 'aphrodite';
import { rgba } from 'css-verbose';

import { VitrineComponent } from './VitrineComponent';
import { TaskBar } from './TaskBar';
import { SideBar } from './SideBar';
import { GameContainer } from './GameContainer';
import { PotentialGame } from '../../models/PotentialGame';
import { PlayableGame } from '../../models/PlayableGame';
import { GamesCollection } from '../../models/GamesCollection';
import { AddGameModal } from './AddGameModal';
import { AddPotentialGamesModal } from './AddPotentialGamesModal';
import { UpdateModal } from './UpdateModal';
import { SettingsModal } from './SettingsModal';
import { localizer } from '../Localizer';
import { urlify } from '../helpers';

export class Vitrine extends VitrineComponent {
	public constructor(props: any) {
		super(props);

		this.state = {
			settings: this.props.settings,
			firstLaunch: false,
			updateProgress: null,
			releaseVersion: null,
			playableGames: new GamesCollection<PlayableGame>(),
			potentialGames: new GamesCollection<PotentialGame>(),
			refreshingGames: false,
			selectedGame: null,
			launchedGame: null,
			potentialGameToAdd: null,
			gameWillBeEdited: false
		};
	}

	private firstLaunch() {
		this.setState({
			firstLaunch: true
		}, () => {
			$('#settings-modal').modal('show');
		});
	}

	private updateProgress(event: Electron.Event, progress: any) {
		this.setState({
			updateProgress: progress
		});
	}

	private updateDownloaded(event: Electron.Event, version: string) {
		this.setState({
			releaseVersion: version
		}, () => {
			$('#update-modal').modal('show');
		});
	}

	private addPlayableGames(event: Electron.Event, games: PlayableGame[]) {
		let firstTime: boolean = this.state.playableGames.games.length === 0;
		let currentPlayableGames: GamesCollection<PlayableGame> = this.state.playableGames;
		currentPlayableGames.addGames(new GamesCollection<PlayableGame>(games), () => {
			this.setState({
				playableGames: currentPlayableGames
			}, () => {
				if (firstTime)
					this.setState({
						selectedGame: this.state.playableGames.games[0]
					});
			});
		});
	}

	private addPlayableGame(event: Electron.Event, game: PlayableGame) {
		let currentPlayableGames: GamesCollection<PlayableGame> = this.state.playableGames;
		currentPlayableGames.addGame(game);
		this.setState({
			playableGames: currentPlayableGames,
			selectedGame: game
		}, () => {
			$('#add-game-modal').modal('hide');
			$('#add-potential-games-modal').modal('hide');
		});
	}

	private editPlayableGame(event: Electron.Event, game: PlayableGame) {
		let currentPlayableGames: GamesCollection<PlayableGame> = this.state.playableGames;
		currentPlayableGames.editGame(game, () => {
			this.setState({
				playableGames: currentPlayableGames
			}, () => {
				if (game.uuid === this.state.selectedGame.uuid) {
					this.setState({
						selectedGame: game
					}, () => {
						$('#add-game-modal').modal('hide');
					});
				}
				else
					$('#add-game-modal').modal('hide');
			});
		});
	}

	private removePlayableGame(event: Electron.Event, gameUuid: string) {
		let currentPlayableGames: GamesCollection<PlayableGame> = this.state.playableGames;
		currentPlayableGames.removeGame(gameUuid, (error, game: PlayableGame, index: number) => {
			if (error)
				return this.throwError(error);
			let currentSelectedGame: PlayableGame = this.state.selectedGame;
			if (currentPlayableGames.games.length) {
				if (index)
					currentSelectedGame = currentPlayableGames.games[index - 1];
				else
					currentSelectedGame = currentPlayableGames.games[index];
			}
			else
				currentSelectedGame = null;
			this.setState({
				playableGames: currentPlayableGames,
				selectedGame: currentSelectedGame
			});
		});
	}

	private addPotentialGames(event: Electron.Event, potentialGames: PotentialGame[]) {
		this.setState({
			potentialGames: new GamesCollection<PotentialGame>(potentialGames),
			refreshingGames: false
		});
	}

	private launchGame(gameUuid: string) {
		ipcRenderer.send('client.launch-game', gameUuid);
		this.state.playableGames.getGame(gameUuid).then(([launchedGame]) => {
			this.setState({
				launchedGame
			});
		}).catch((error: Error) => {
			this.throwError(error);
		});
	}

	private stopGame(event: Electron.Event, gameUuid: string, totalTimePlayed: number) {
		let currentPlayableGames: GamesCollection<PlayableGame> = this.state.playableGames;
		currentPlayableGames.getGame(gameUuid).then(([game]) => {
			game.timePlayed = totalTimePlayed;
			currentPlayableGames.editGame(game, () => {
				this.setState({
					playableGames: currentPlayableGames
				});
			});
		}).catch((error: Error) => {
			this.throwError(error);
		});
	}

	private settingsUpdated(event: Event, newSettings: any) {
		this.setState({
			settings: newSettings
		}, () => {
			$('#settings-modal').modal('hide');
			if (this.state.firstLaunch) {
				this.setState({
					firstLaunch: false
				});
			}
		});
	}

	private serverError(event: Event, error: Error) {
		this.throwError(error.message);
	}

	private taskBarRefreshBtnClickHandler() {
		ipcRenderer.send('client.refresh-potential-games');
		this.setState({
			refreshingGames: true
		});
	}

	private sideBarGameClickHandler(uuid: string) {
		this.state.playableGames.getGame(uuid).then(([selectedGame]) => {
			this.setState({
				selectedGame
			});
		}).catch((error: Error) => {
			return this.throwError(error);
		});
	}

	private potentialGameToAddUpdateHandler(potentialGame: PotentialGame, gameWillBeEdited?: boolean) {
		gameWillBeEdited = (gameWillBeEdited) ? (true) : (false);
		this.setState({
			potentialGameToAdd: potentialGame,
			gameWillBeEdited: gameWillBeEdited
		}, () => {
			$('#add-game-modal').modal('show');
		});
	}

	private launchGameContextClickHandler(event: any, data: Object, target: HTMLElement) {
		let gameUuid: string = target.children[0].id.replace('game-', '');
		this.launchGame(gameUuid);
	}

	private editGameContextClickHandler(event: any, data: Object, target: HTMLElement) {
		let gameUuid: string = target.children[0].id.replace('game-', '');
		this.state.playableGames.getGame(gameUuid).then(([selectedGame]) => {
			this.potentialGameToAddUpdateHandler(selectedGame, true);
		}).catch((error: Error) => {
			return this.throwError(error);
		});
	}

	private static deleteGameContextClickHandler(event: any, data: Object, target: HTMLElement) {
		let gameUuid: string = target.children[0].id.replace('game-', '');
		ipcRenderer.send('client.remove-game', gameUuid);
	}

	private keyDownHandler(event: KeyboardEvent) {
		switch (event.code) {
			case ('ArrowDown'): {
				event.preventDefault();

				let index: number = this.state.playableGames.games.indexOf(this.state.selectedGame);
				if (index < this.state.playableGames.games.length - 1)
					this.setState({
						selectedGame: this.state.playableGames.games[index + 1]
					});
				break;
			}
			case ('ArrowUp'): {
				event.preventDefault();

				let index: number = this.state.playableGames.games.indexOf(this.state.selectedGame);
				if (index)
					this.setState({
						selectedGame: this.state.playableGames.games[index - 1]
					});
				break;
			}
			case ('Enter'): {
				if ($('#add-game-modal').is(':visible') || $('#add-potential-games-modal').is(':visible') ||
					$('#update-modal').is(':visible') || $('#igdb-research-modal').is(':visible'))
					break;
				event.preventDefault();

				this.launchGame(this.state.selectedGame.uuid);
				break;
			}
		}
	}

	public componentDidMount() {
		ipcRenderer.on('server.first-launch', this.firstLaunch.bind(this))
			.on('server.update-progress', this.updateProgress.bind(this))
			.on('server.update-downloaded', this.updateDownloaded.bind(this))
			.on('server.add-playable-games', this.addPlayableGames.bind(this))
			.on('server.add-playable-game', this.addPlayableGame.bind(this))
			.on('server.edit-playable-game', this.editPlayableGame.bind(this))
			.on('server.remove-playable-game', this.removePlayableGame.bind(this))
			.on('server.add-potential-games', this.addPotentialGames.bind(this))
			.on('server.stop-game', this.stopGame.bind(this))
			.on('server.settings-updated', this.settingsUpdated.bind(this))
			.on('server.server-error', this.serverError.bind(this));

		window.addEventListener('keydown', this.keyDownHandler.bind(this));

	}

	public componentWillUnmount() {
		window.removeEventListener('keydown', this.keyDownHandler.bind(this));
	}

	public render(): JSX.Element {
		let vitrineContent: JSX.Element = (!this.state.launchedGame) ? (
			<div className={'full-height'}>
				<SideBar
					playableGames={this.state.playableGames}
					selectedGame={this.state.selectedGame}
					gameClickHandler={this.sideBarGameClickHandler.bind(this)}
					launchGameCallback={this.launchGame.bind(this)}
				/>
				<GameContainer
					selectedGame={this.state.selectedGame}
					launchGameCallback={this.launchGame.bind(this)}
				/>
				<AddGameModal
					potentialGameToAdd={this.state.potentialGameToAdd}
					isEditing={this.state.gameWillBeEdited}
				/>
				<AddPotentialGamesModal
					potentialGames={this.state.potentialGames}
					potentialGameUpdateCallback={this.potentialGameToAddUpdateHandler.bind(this)}
				/>
				<UpdateModal
					releaseVersion={this.state.releaseVersion}
				/>
				<SettingsModal
					settings={this.state.settings}
					firstLaunch={this.state.firstLaunch}
				/>
				<ContextMenu id="sidebar-games-context-menu">
					<MenuItem onClick={this.launchGameContextClickHandler.bind(this)}>
						{localizer.f('play')}
					</MenuItem>
					<MenuItem onClick={this.editGameContextClickHandler.bind(this)}>
						{localizer.f('edit')}
					</MenuItem>
					<MenuItem onClick={Vitrine.deleteGameContextClickHandler.bind(this)}>
						{localizer.f('delete')}
					</MenuItem>
				</ContextMenu>
			</div>
		) : (
			<div>
				<div className={css(styles.launchedGameDiv)}>
					<span className={css(styles.launchedGameTitle)}>Vous êtes en train de jouer à {this.state.launchedGame.name}.</span>
					<hr className={css(styles.launchedGameHr)}/>
					<span className={css(styles.launchedGameSubTitle)}>Amusez-vous bien !</span>
				</div>
				<div
					className={css(styles.launchedGameBackground)}
					style={{ backgroundImage: urlify(this.state.launchedGame.details.backgroundScreen) }}
				/>
			</div>
		);
		return (
			<div className={`container-fluid full-height ${css(styles.vitrineApp)}`}>
				<TaskBar
					potentialGames={this.state.potentialGames}
					isGameLaunched={(this.state.launchedGame) ? (true) : (false)}
					refreshingGames={this.state.refreshingGames}
					updateProgress={this.state.updateProgress}
					refreshBtnCallback={this.taskBarRefreshBtnClickHandler.bind(this)}
				/>
				{vitrineContent}
				{this.checkErrors()}
			</div>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	vitrineApp: {
		padding: 0,
		height: `${100}%`,
		userSelect: 'none',
		overflow: 'hidden',
		cursor: 'default'
	},
	launchedGameDiv: {
		textAlign: 'center',
		marginTop: `${29}vh`
	},
	launchedGameTitle: {
		fontSize: 50,
		color: '#FFFFFF'
	},
	launchedGameHr: {
		margin: `${10}px ${40}vw`,
		borderColor: rgba(255, 255, 255, 0.45),
	},
	launchedGameSubTitle: {
		fontSize: 25,
		color: rgba(255, 255, 255, 0.7)
	},
	launchedGameBackground: {
		position: 'absolute',
		zIndex: -1,
		width: `${99}%`,
		height: `${100}%`,
		top: 0,
		left: 0,
		opacity: 0.8,
		backgroundRepeat: 'no-repeat',
		backgroundSize: 'cover',
		filter: `blur(${10}px)`,
		transform: `scale(${1.02})`
	}
});
