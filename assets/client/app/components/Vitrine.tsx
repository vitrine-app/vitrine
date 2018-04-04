import { css, StyleSheet } from 'aphrodite';
import * as React from 'react';
import { ToastContainer } from 'react-toastify';
import { Grid } from 'semantic-ui-react';

import { GamesCollection } from '../../../models/GamesCollection';
import { PlayableGame } from '../../../models/PlayableGame';
import { PotentialGame } from '../../../models/PotentialGame';
import { GameAddModal } from '../containers/GameAddModal';
import { GameContainer } from '../containers/GameContainer';
import { PotentialGamesAddModal } from '../containers/PotentialGamesAddModal';
import { SettingsModal } from '../containers/SettingsModal';
import { SideBar } from '../containers/SideBar';
import { TimePlayedEditionModal } from '../containers/TimePlayedEditionModal';
import { formatTimePlayed, notify } from '../helpers';
import { localizer } from '../Localizer';
import { serverListener } from '../ServerListener';
import { TaskBar } from './TaskBar';
import { VitrineComponent } from './VitrineComponent';

interface Props {
	settings: any;
	playableGames: GamesCollection<PlayableGame>;
	selectedGame: PlayableGame;
	launchedGame: PlayableGame;
	updateSettings: (settings: any) => void;
	addPotentialGames: (potentialGames: PotentialGame[]) => void;
	addPlayableGames: (playableGames: PlayableGame[]) => void;
	removePlayableGame: (gameUuid: string, selectedGame: PlayableGame) => void;
	launchGame: (launchedGame: PlayableGame) => void;
	stopGame: (playedGame: PlayableGame) => void;
	selectGame: (selectedGame: PlayableGame) => void;
	openSettingsModal: () => void;
	closeSettingsModal: () => void;
}

interface State {
	firstLaunch: boolean;
	launchedGamePictureActivated: boolean;
	gameWillBeEdited: boolean;
}

export class Vitrine extends VitrineComponent<Props, State> {
	public constructor(props: any) {
		super(props);

		this.state = {
			firstLaunch: false,
			launchedGamePictureActivated: true,
			gameWillBeEdited: false
		};

		this.launchGame = this.launchGame.bind(this);
	}

	private removePlayableGame(gameUuid: string) {
		this.props.removePlayableGame(gameUuid, (this.props.playableGames.size() - 1) ? (this.props.playableGames.getGame(0)) : (null));
	}

	private launchGame(gameUuid: string) {
		const playedGame: PlayableGame = this.props.playableGames.getGame(gameUuid);
		notify(`${localizer.f('launchingGameToast')} <b>${playedGame.name}</b>...`, true);
		serverListener.send('launch-game', gameUuid);
		this.props.launchGame(this.props.playableGames.getGame(gameUuid));
	}

	private stopGame(gameUuid: string, totalTimePlayed: number) {
		const playedGame: PlayableGame = { ...this.props.playableGames.getGame(gameUuid) } as PlayableGame;
		const timeJustPlayed: number = totalTimePlayed - playedGame.timePlayed;
		playedGame.timePlayed = totalTimePlayed;
		this.props.stopGame(playedGame);
		notify(`<b>${playedGame.name}</b> ${localizer.f('stoppingGameToast')} ${formatTimePlayed(timeJustPlayed)}.`, true);
	}

	private settingsUpdated(settings: any) {
		this.props.updateSettings(settings);
		this.props.closeSettingsModal();
		if (this.state.firstLaunch) {
			this.setState({
				firstLaunch: false
			});
		}
	}

	private serverError(errorName: string, errorStack: string) {
		const error: Error = new Error(errorName);
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

				const index: number = this.props.playableGames.getIndex(this.props.selectedGame);
				if (index < this.props.playableGames.size() - 1)
					this.props.selectGame(this.props.playableGames.getGame(index + 1));
				break;
			}
			case 'ArrowUp': {
				event.preventDefault();

				const index: number = this.props.playableGames.getIndex(this.props.selectedGame);
				if (index)
					this.props.selectGame(this.props.playableGames.getGame(index - 1));
				break;
			}
			/*case 'Enter': {
				if ($('#add-game-modal').is(':visible') || $('#add-potential-games-modal').is(':visible') ||
					$('#update-modal').is(':visible') || $('#igdb-research-modal').is(':visible') ||
					$('#settings-modal').is(':visible') || $('#edit-time-played-modal').is(':visible'))
					break;
				event.preventDefault();

				this.launchGame(this.props.selectedGame.uuid);
				break;
			}*/
		}
	}

	public componentDidMount() {
		if (this.props.settings.firstLaunch) {
			this.setState({
				firstLaunch: true
			}, this.props.openSettingsModal.bind(this));
		}

		serverListener.listen('add-playable-games', this.props.addPlayableGames.bind(this))
			.listen('remove-playable-game', this.removePlayableGame.bind(this))
			.listen('add-potential-games', this.props.addPotentialGames.bind(this))
			.listen('stop-game', this.stopGame.bind(this))
			.listen('settings-updated', this.settingsUpdated.bind(this))
			.listen('error', this.serverError.bind(this));

		window.addEventListener('keydown', this.keyDownHandler.bind(this));
		/*window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
			console.log(e.gamepad);
		});*/
	}

	public componentWillUnmount() {
		window.removeEventListener('keydown', this.keyDownHandler.bind(this));
	}

	public render(): JSX.Element {
		return (
			<div className={css(styles.vitrineApp)}>
				<TaskBar/>
				<Grid className={css(styles.mainContainer)}>
					<SideBar
						launchGame={this.launchGame}
					/>
					<GameContainer
						launchGame={this.launchGame}
					/>
				</Grid>
				<GameAddModal/>
				<TimePlayedEditionModal/>
				<PotentialGamesAddModal/>
				<SettingsModal
					firstLaunch={this.state.firstLaunch}
				/>
				<ToastContainer/>
				{this.checkErrors()}
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
