import * as React from 'react';
import { ipcRenderer } from 'electron';
import { ContextMenu, MenuItem } from 'react-contextmenu';
import { StyleSheet, css } from 'aphrodite';

import { VitrineComponent } from './VitrineComponent';
import { TaskBar } from './TaskBar';
import { SideBar } from './SideBar';
import { GameContainer } from './GameContainer';
import { PotentialGame } from '../../models/PotentialGame';
import { PlayableGame } from '../../models/PlayableGame';
import { GamesCollection } from '../../models/GamesCollection';
import { AddGameModal } from './AddGameModal';
import { AddPotentialGamesModal } from './AddPotentialGamesModal';
import { SettingsModal } from './SettingsModal';
import { LaunchedGameContainer } from './LaunchedGameContainer';
import { localizer } from '../Localizer';

export class Vitrine extends VitrineComponent {
	public constructor(props: any) {
		super(props);

		this.state = {
			settings: this.props.settings,
			firstLaunch: false,
			playableGames: new GamesCollection<PlayableGame>(),
			potentialGames: new GamesCollection<PotentialGame>(),
			refreshingGames: false,
			launchedGamePictureActivated: true,
			selectedGame: null,
			launchedGame: null,
			potentialGameToAdd: null,
			gameWillBeEdited: false
		};
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
		this.state.playableGames.getGame(gameUuid).then((launchedGame: PlayableGame) => {
			setTimeout(() => {
				this.setState({
					launchedGame
				});
			}, 100);
		}).catch((error: Error) => {
			this.throwError(error);
		});
	}

	private stopGame(event: Electron.Event, gameUuid: string, totalTimePlayed: number) {
		let currentPlayableGames: GamesCollection<PlayableGame> = this.state.playableGames;
		currentPlayableGames.getGame(gameUuid).then((selectedGame: PlayableGame) => {
			selectedGame.timePlayed = totalTimePlayed;
			currentPlayableGames.editGame(selectedGame, () => {
				this.setState({
					playableGames: currentPlayableGames,
					launchedGame: null,
					selectedGame
				}, this.forceUpdate.bind(this));
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

	private serverError(event: Event, errorName: string, errorStack: string) {
		let error: Error = new Error(errorName);
		error.stack = errorStack;
		error.name = errorName;
		this.throwError(error);
	}

	private taskBarRefreshBtnClickHandler() {
		ipcRenderer.send('client.refresh-potential-games');
		this.setState({
			refreshingGames: true
		});
	}

	private sideBarGameClickHandler(uuid: string) {
		this.state.playableGames.getGame(uuid).then((selectedGame: PlayableGame) => {
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
		this.state.playableGames.getGame(gameUuid).then((selectedGame: PlayableGame) => {
			this.potentialGameToAddUpdateHandler(selectedGame, true);
		}).catch((error: Error) => {
			return this.throwError(error);
		});
	}

	private deleteGameContextClickHandler(event: any, data: Object, target: HTMLElement) {
		let gameUuid: string = target.children[0].id.replace('game-', '');
		ipcRenderer.send('client.remove-game', gameUuid);
	}

	private launchedGamePictureToggleHandler() {
		this.setState({
			launchedGamePictureActivated: false
		}, () => {
			this.setState({
				selectedGame: this.state.selectedGame
			});
		});
	}

	private keyDownHandler(event: KeyboardEvent) {
		switch (event.code) {
			case 'ArrowDown': {
				event.preventDefault();

				let index: number = this.state.playableGames.games.indexOf(this.state.selectedGame);
				if (index < this.state.playableGames.games.length - 1)
					this.setState({
						selectedGame: this.state.playableGames.games[index + 1]
					});
				break;
			}
			case 'ArrowUp': {
				event.preventDefault();

				let index: number = this.state.playableGames.games.indexOf(this.state.selectedGame);
				if (index)
					this.setState({
						selectedGame: this.state.playableGames.games[index - 1]
					});
				break;
			}
			case 'Enter': {
				if ($('#add-game-modal').is(':visible') || $('#add-potential-games-modal').is(':visible') ||
					$('#update-modal').is(':visible') || $('#igdb-research-modal').is(':visible') ||
					$('#settings-modal').is(':visible'))
					break;
				event.preventDefault();

				this.launchGame(this.state.selectedGame.uuid);
				break;
			}
		}
	}

	public componentDidMount() {
		if (this.state.settings.firstLaunch) {
			this.setState({
				firstLaunch: true
			}, () => {
				$('#settings-modal').modal('show');
			});
		}

		ipcRenderer.on('server.add-playable-games', this.addPlayableGames.bind(this))
			.on('server.add-playable-game', this.addPlayableGame.bind(this))
			.on('server.edit-playable-game', this.editPlayableGame.bind(this))
			.on('server.remove-playable-game', this.removePlayableGame.bind(this))
			.on('server.add-potential-games', this.addPotentialGames.bind(this))
			.on('server.stop-game', this.stopGame.bind(this))
			.on('server.settings-updated', this.settingsUpdated.bind(this))
			.on('server.error', this.serverError.bind(this));

		window.addEventListener('keydown', this.keyDownHandler.bind(this));
		window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
			console.log(e.gamepad);
		});
	}

	public componentWillUnmount() {
		window.removeEventListener('keydown', this.keyDownHandler.bind(this));
	}

	public render(): JSX.Element {
		let vitrineContent: JSX.Element = (!this.state.launchedGame || !this.state.launchedGamePictureActivated) ? (
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
					<MenuItem onClick={this.deleteGameContextClickHandler.bind(this)}>
						{localizer.f('delete')}
					</MenuItem>
				</ContextMenu>
			</div>
		) : (
			<LaunchedGameContainer
				launchedGame={this.state.launchedGame}
				clickHandler={this.launchedGamePictureToggleHandler.bind(this)}
			/>
		);
		return (
			<div className={`container-fluid full-height ${css(styles.vitrineApp)}`}>
				<TaskBar
					potentialGames={this.state.potentialGames}
					isGameLaunched={this.state.launchedGame && this.state.launchedGamePictureActivated}
					refreshingGames={this.state.refreshingGames}
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
		height:100..percents(),
		userSelect: 'none',
		overflow: 'hidden',
		cursor: 'default'
	}
});
