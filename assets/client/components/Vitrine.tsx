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
import { UpdateModal } from './UpdateModal';
import { SettingsModal } from './SettingsModal';
import { launchGame } from '../helpers';

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
			selectedGame: null,
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
				$('#add-game-modal').modal('hide');
			});
		});
	}

	private removePlayableGame(event: Electron.Event, gameId: string) {
		let currentPlayableGames: GamesCollection<PlayableGame> = this.state.playableGames;
		currentPlayableGames.removeGame(gameId, (error, game: PlayableGame, index: number) => {
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
			potentialGames: new GamesCollection<PotentialGame>(potentialGames)
		});
	}

	private stopGame(event: Electron.Event, gameId: string, totalTimePlayed: number) {
		let currentPlayableGames: GamesCollection<PlayableGame> = this.state.playableGames;
		currentPlayableGames.getGame(gameId).then(([game]) => {
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

	private sideBarGameClickHandler(uuid: string) {
		this.state.playableGames.getGame(uuid).then(([selectedGame]) => {
			this.setState({
				selectedGame: selectedGame
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

	private static launchGameContextClickHandler(event: any, data: Object, target: HTMLElement) {
		let gameId: string = target.children[0].id.replace('game-', '');
		launchGame(gameId);
	}

	private editGameContextClickHandler(event: any, data: Object, target: HTMLElement) {
		let gameId: string = target.children[0].id.replace('game-', '');
		this.state.playableGames.getGame(gameId).then(([selectedGame]) => {
			this.potentialGameToAddUpdateHandler(selectedGame, true);
		}).catch((error: Error) => {
			return this.throwError(error);
		});
	}

	private static deleteGameContextClickHandler(event: any, data: Object, target: HTMLElement) {
		let gameId: string = target.children[0].id.replace('game-', '');
		ipcRenderer.send('client.remove-game', gameId);
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

				launchGame(this.state.selectedGame.uuid);
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
			.on('server.settings-updated', this.settingsUpdated.bind(this));

		window.addEventListener('keydown', this.keyDownHandler.bind(this));

	}

	public componentWillUnmount() {
		window.removeEventListener('keydown', this.keyDownHandler.bind(this));
	}

	public render(): JSX.Element {
		return (
			<div className={`container-fluid full-height ${css(styles.vitrineApp)}`}>
				<TaskBar
					potentialGames={this.state.potentialGames}
					updateProgress={this.state.updateProgress}
				/>
				<SideBar
					playableGames={this.state.playableGames}
					gameClickHandler={this.sideBarGameClickHandler.bind(this)}
					selectedGame={this.state.selectedGame}
				/>
				<GameContainer
					selectedGame={this.state.selectedGame}
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
					<MenuItem onClick={Vitrine.launchGameContextClickHandler.bind(this)}>Play</MenuItem>
					<MenuItem onClick={this.editGameContextClickHandler.bind(this)}>Edit</MenuItem>
					<MenuItem onClick={Vitrine.deleteGameContextClickHandler.bind(this)}>Delete</MenuItem>
				</ContextMenu>
				{this.checkErrors()}
			</div>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	vitrineApp: {
		padding: `${29}px ${0} ${0}`,
		height: `${100}%`,
		userSelect: 'none',
		overflow: 'hidden'
	}
});
