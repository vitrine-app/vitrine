import * as React from 'react';
import { Grid } from 'semantic-ui-react';
import { StyleSheet, css } from 'aphrodite';

import { VitrineComponent } from './VitrineComponent';
import { PotentialGame } from '../../../models/PotentialGame';
import { PlayableGame } from '../../../models/PlayableGame';
import { GamesCollection } from '../../../models/GamesCollection';
import { serverListener } from '../ServerListener';
import { SideBar } from '../containers/SideBar';
import { GameContainer } from '../containers/GameContainer';
import { GameAddModal } from '../containers/GameAddModal';
import { AddPotentialGamesModal } from '../containers/AddPotentialGamesModal';
import { TimePlayedEditionModal } from '../containers/TimePlayedEditionModal';
import { SettingsModal } from '../containers/SettingsModal';
import { LaunchedGameContainer } from '../containers/LaunchedGameContainer';
import { TaskBar } from './TaskBar';
import { localizer } from '../Localizer';

interface Props {
	settings: any,
	playableGames: GamesCollection<PlayableGame>,
	selectedGame: PlayableGame,
	launchedGame: PlayableGame,
	updateSettings: (settings: any) => void,
	addPotentialGames: (potentialGames: PotentialGame[]) => void,
	addPlayableGames: (playableGames: PlayableGame[]) => void,
	removePlayableGame: (gameUuid: string, selectedGame: PlayableGame) => void,
	launchGame: (launchedGame: PlayableGame) => void,
	stopGame: (playedGame: PlayableGame) => void,
	selectGame: (selectedGame: PlayableGame) => void
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

	private removePlayableGame(gameUuid: string) {
		this.props.removePlayableGame(gameUuid, (this.props.playableGames.size() - 1) ? (this.props.playableGames.getGame(0)) : (null));
	}

	private launchGame(gameUuid: string) {
		serverListener.send('launch-game', gameUuid);
		this.props.launchGame(this.props.playableGames.getGame(gameUuid));
	}

	private stopGame(gameUuid: string, totalTimePlayed: number) {
		let playedGame: PlayableGame = this.props.playableGames.getGame(gameUuid);
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

	private launchedGamePictureToggleHandler() {
		this.setState({
			launchedGamePictureActivated: false
		});
	}

	private keyDownHandler(event: KeyboardEvent) {
		switch (event.code) {
			case 'ArrowDown': {
				event.preventDefault();

				let index: number = this.props.playableGames.getIndex(this.props.selectedGame);
				if (index < this.props.playableGames.size() - 1)
					this.props.selectGame(this.props.playableGames.getGame(index + 1));
				break;
			}
			case 'ArrowUp': {
				event.preventDefault();

				let index: number = this.props.playableGames.getIndex(this.props.selectedGame);
				if (index)
					this.props.selectGame(this.props.playableGames.getGame(index - 1));
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
			.listen('remove-playable-game', this.removePlayableGame.bind(this))
			.listen('add-potential-games', this.props.addPotentialGames.bind(this))
			.listen('stop-game', this.stopGame.bind(this))
			.listen('settings-updated', this.settingsUpdated.bind(this))
			.listen('error', this.serverError.bind(this));

		/*window.addEventListener('keydown', this.keyDownHandler.bind(this));
		window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
			console.log(e.gamepad);
		});*/
	}

	/*public componentWillUnmount() {
		window.removeEventListener('keydown', this.keyDownHandler.bind(this));
	}*/

	public render(): JSX.Element {
		/*let vitrineContent: JSX.Element = (!this.props.launchedGame || !this.state.launchedGamePictureActivated) ? (
			<div>
				<SideBar/>
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
		);*/
		return (
			<div className={css(styles.vitrineApp)}>
				<TaskBar/>
				<SideBar
					isGameLaunched={this.props.launchedGame && this.state.launchedGamePictureActivated}
					launchGame={this.launchGame.bind(this)}
				/>
				<Grid className={css(styles.mainContainer)}>
					<Grid.Column className={css(styles.case1)}/>
					<GameContainer
						launchGame={this.launchGame.bind(this)}
					/>
				</Grid>
				<GameAddModal/>
				<TimePlayedEditionModal/>
			</div>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	vitrineApp: {
		height: 100..percents(),
		userSelect: 'none',
		cursor: 'default'
	},
	mainContainer: {
		height: `calc(${100..percents()} - ${22..px()})`,
		margin: 0
	},
	case1: {
		width: 15.5.percents()
	}
});
