import * as React from 'react';
import { ContextMenu, MenuItem } from 'react-contextmenu';
import { StyleSheet, css } from 'aphrodite';

import { PotentialGame } from '../../../models/PotentialGame';
import { PlayableGame } from '../../../models/PlayableGame';
import { GamesCollection } from '../../../models/GamesCollection';
import { serverListener } from '../ServerListener';
import { SideBar } from '../containers/SideBar';
import { TaskBar } from '../containers/TaskBar';
import { GameContainer } from '../containers/GameContainer';
import { AddGameModal } from '../containers/AddGameModal';
import { AddPotentialGamesModal } from '../containers/AddPotentialGamesModal';
import { EditTimePlayedModal } from '../containers/EditTimePlayedModal';
import { SettingsModal } from '../containers/SettingsModal';
import { LaunchedGameContainer } from '../containers/LaunchedGameContainer';
import { VitrineComponent } from './VitrineComponent';
import { localizer } from '../Localizer';

interface Props {
	settings: any,
	potentialGames: GamesCollection<PotentialGame>,
	playableGames: GamesCollection<PlayableGame>,
	selectedGame: PlayableGame,
	launchedGame: PlayableGame,
	updateSettings: Function | any,
	addPotentialGames: Function | any,
	addPlayableGames: Function | any,
	editPlayableGame: Function | any,
	removePlayableGame: Function | any,
	launchGame: Function | any,
	stopGame: Function | any,
	selectGame: Function | any,
	setPotentialGameToAdd: Function | any
}

interface State {
	firstLaunch: boolean,
	launchedGamePictureActivated: boolean,
	gameWillBeEdited: boolean
}

export class Vitrine extends VitrineComponent<Props, State> {
	public constructor(props: any) {
		super(props);

		this.state = {
			firstLaunch: false,
			launchedGamePictureActivated: true,
			gameWillBeEdited: false
		};
	}

	private addPlayableGame(game: PlayableGame) {
		this.props.addPlayableGames([game]);
		$('#add-game-modal').modal('hide');
		$('#add-potential-games-modal').modal('hide');
	}

	private editPlayableGame(game: PlayableGame) {
		this.props.editPlayableGame(game);
		if (game.uuid === this.props.selectedGame.uuid)
			this.props.selectGame(game);
		$('#add-game-modal').modal('hide');
		$('#edit-time-played-modal').modal('hide');
	}

	private removePlayableGame(gameUuid: string) {
		this.props.removePlayableGame(gameUuid, (this.props.playableGames.games.length) ? (this.props.playableGames.games[0]) : (null));
	}

	private launchGame(gameUuid: string) {
		serverListener.send('launch-game', gameUuid);
		this.props.launchGame(this.props.playableGames.getGameSync(gameUuid));
	}

	private stopGame(gameUuid: string, totalTimePlayed: number) {
		let playedGame: PlayableGame = this.props.playableGames.getGameSync(gameUuid);
		playedGame.timePlayed = totalTimePlayed;
		this.props.stopGame(playedGame);
		this.forceUpdate();
	}

	private settingsUpdated(settings: any) {
		this.props.updateSettings(settings);
		$('#settings-modal').modal('hide');
		if (this.state.firstLaunch) {
			this.setState({
				firstLaunch: false
			});
		}
	}

	private serverError(errorName: string, errorStack: string) {
		let error: Error = new Error(errorName);
		error.stack = errorStack;
		error.name = errorName;
		this.throwError(error);
	}

	private potentialGameToAddUpdateHandler(potentialGameToAdd: PotentialGame, gameWillBeEdited?: boolean) {
		gameWillBeEdited = gameWillBeEdited || false;
		this.props.setPotentialGameToAdd(potentialGameToAdd);
		this.setState({
			gameWillBeEdited
		}, () => {
			$('#add-game-modal').modal('show');
		});
	}

	private launchGameContextClickHandler(event: any, data: any, target: HTMLElement) {
		let gameUuid: string = target.children[0].id.replace('game-', '');
		this.launchGame(gameUuid);
	}

	private editGameContextClickHandler(event: any, data: any, target: HTMLElement) {
		let gameUuid: string = target.children[0].id.replace('game-', '');
		this.props.playableGames.getGame(gameUuid).then((selectedGame: PlayableGame) => {
			this.potentialGameToAddUpdateHandler(selectedGame, true);
		}).catch((error: Error) => {
			return this.throwError(error);
		});
	}

	private editGamePlayTimeContextClickHandler(event: any, data: Object, target: HTMLElement) {
		let gameUuid: string = target.children[0].id.replace('game-', '');
		this.props.setPotentialGameToAdd(this.props.playableGames.getGameSync(gameUuid));
		$('#edit-time-played-modal').modal('show');
		/*this.props.playableGames.getGame(gameUuid).then((selectedGame: PlayableGame) => {
			this.setState({
				potentialGameToAdd: selectedGame
			}, () => {
				$('#edit-time-played-modal').modal('show');
			});
		}).catch((error: Error) => {
			return this.throwError(error);
		});*/
	}

	private deleteGameContextClickHandler(event: any, data: any, target: HTMLElement) {
		let gameUuid: string = target.children[0].id.replace('game-', '');
		serverListener.send('remove-game', gameUuid);
	}

	private launchedGamePictureToggleHandler() {
		this.setState({
			launchedGamePictureActivated: false
		});
	}

	private keyDownHandler(event: KeyboardEvent) {
		switch (event.code) {
			case 'ArrowDown': {
				event.preventDefault();

				let index: number = this.props.playableGames.games.indexOf(this.props.selectedGame);
				if (index < this.props.playableGames.games.length - 1)
					this.props.selectGame(this.props.playableGames.games[index + 1]);
				break;
			}
			case 'ArrowUp': {
				event.preventDefault();

				let index: number = this.props.playableGames.games.indexOf(this.props.selectedGame);
				if (index)
					this.props.selectGame(this.props.playableGames.games[index - 1]);
				break;
			}
			case 'Enter': {
				if ($('#add-game-modal').is(':visible') || $('#add-potential-games-modal').is(':visible') ||
					$('#update-modal').is(':visible') || $('#igdb-research-modal').is(':visible') ||
					$('#settings-modal').is(':visible') || $('#edit-time-played-modal').is(':visible'))
					break;
				event.preventDefault();

				this.launchGame(this.props.selectedGame.uuid);
				break;
			}
		}
	}

	public componentDidMount() {
		if (this.props.settings.firstLaunch) {
			this.setState({
				firstLaunch: true
			}, () => {
				$('#settings-modal').modal('show');
			});
		}

		serverListener.listen('add-playable-games', this.props.addPlayableGames.bind(this))
			.listen('add-playable-game', this.addPlayableGame.bind(this))
			.listen('edit-playable-game', this.editPlayableGame.bind(this))
			.listen('remove-playable-game', this.removePlayableGame.bind(this))
			.listen('add-potential-games', this.props.addPotentialGames.bind(this))
			.listen('stop-game', this.stopGame.bind(this))
			.listen('settings-updated', this.settingsUpdated.bind(this))
			.listen('error', this.serverError.bind(this));

		window.addEventListener('keydown', this.keyDownHandler.bind(this));
		window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
			console.log(e.gamepad);
		});
	}

	public componentWillUnmount() {
		window.removeEventListener('keydown', this.keyDownHandler.bind(this));
	}

	public render(): JSX.Element {
		let vitrineContent: JSX.Element = (!this.props.launchedGame || !this.state.launchedGamePictureActivated) ? (
			<div className={'full-height'}>
				<SideBar
					launchGame={this.launchGame.bind(this)}
				/>
				<GameContainer
					launchGame={this.launchGame.bind(this)}
				/>
				<AddGameModal
					isEditing={this.state.gameWillBeEdited}
				/>
				<AddPotentialGamesModal
					potentialGameUpdateCallback={this.potentialGameToAddUpdateHandler.bind(this)}
				/>
				<SettingsModal
					firstLaunch={this.state.firstLaunch}
				/>
				<EditTimePlayedModal/>
				<ContextMenu id="sidebar-games-context-menu">
					<MenuItem onClick={this.launchGameContextClickHandler.bind(this)}>
						{localizer.f('play')}
					</MenuItem>
					<MenuItem onClick={this.editGameContextClickHandler.bind(this)}>
						{localizer.f('edit')}
					</MenuItem>
					<MenuItem onClick={this.editGamePlayTimeContextClickHandler.bind(this)}>
						{localizer.f('editTimePlayed')}
					</MenuItem>
					<MenuItem onClick={this.deleteGameContextClickHandler.bind(this)}>
						{localizer.f('delete')}
					</MenuItem>
				</ContextMenu>
			</div>
		) : (
			<LaunchedGameContainer
				clickHandler={this.launchedGamePictureToggleHandler.bind(this)}
			/>
		);
		return (
			<div className={`container-fluid full-height ${css(styles.vitrineApp)}`}>
				<TaskBar
					isGameLaunched={this.props.launchedGame && this.state.launchedGamePictureActivated}
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
