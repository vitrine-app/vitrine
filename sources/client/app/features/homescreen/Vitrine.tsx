import { css, StyleSheet } from 'aphrodite';
import { padding, rgba } from 'css-verbose';
import * as React from 'react';
import { InjectedIntl, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { Dispatch } from 'redux';
import { Grid } from 'semantic-ui-react';

import { GamesCollection } from '@models/GamesCollection';
import { PlayableGame } from '@models/PlayableGame';
import { PotentialGame } from '@models/PotentialGame';
import { formatTimePlayed, notify } from '../../helpers';
import { GameAddModal } from '../addingGame/GameAddModal';
import { PotentialGamesAddModal } from '../addingPotentialGames/PotentialGamesAddModal';
import { controlsHandler } from '../controlsHandler';
import { TimePlayedEditionModal } from '../editingTimePlayed/TimePlayedEditionModal';
import { Action } from '../redux/actions/actionsTypes';
import { addPlayableGames, addPotentialGames, launchGame, removePlayableGame, selectGame, stopGame } from '../redux/actions/games';
import { closeSettingsModal, openSettingsModal } from '../redux/actions/modals';
import { setInternetConnection, setLocale, updateSettings } from '../redux/actions/settings';
import { AppState } from '../redux/AppState';
import { serverListener } from '../serverListener';
import { SettingsModal } from '../settings/SettingsModal';
import { VitrineComponent } from '../VitrineComponent';
import { GameContainer } from './GameContainer';
import { InvisibleTaskBar } from './InvisibleTaskBar';
import { SideBar } from './SideBar';

interface Props {
  settings: any;
  playableGames: GamesCollection<PlayableGame>;
  selectedGame: PlayableGame;
  launchedGame: PlayableGame;
  gameAddModalVisible: boolean;
  igdbResearchModalVisible: boolean;
  timePlayedEditionModalVisible: boolean;
  potentialGamesAddModalVisible: boolean;
  settingsModalVisible: boolean;
  intl: InjectedIntl;
  updateSettings: (settings: any) => void;
  addPotentialGames: (potentialGames: PotentialGame[]) => void;
  addPlayableGames: (playableGames: PlayableGame[]) => void;
  removePlayableGame: (gameUuid: string) => void;
  launchGame: (launchedGame: PlayableGame) => void;
  stopGame: (playedGame: PlayableGame) => void;
  selectGame: (selectedGame: PlayableGame) => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  setInternetConnection: (internetConnection: boolean) => void;
}

interface State {
  firstLaunch: boolean;
  gameWillBeEdited: boolean;
}

class Vitrine extends VitrineComponent<Props, State> {
  public constructor(props: any) {
    super(props);

    this.state = {
      firstLaunch: false,
      gameWillBeEdited: false
    };
  }

  public componentDidMount() {
    if (this.props.settings.firstLaunch) {
      this.setState(
        {
          firstLaunch: true
        },
        this.props.openSettingsModal
      );
    }

    serverListener
      .listen('add-playable-games', this.props.addPlayableGames)
      .listen('remove-playable-game', this.removePlayableGame)
      .listen('add-potential-games', this.props.addPotentialGames)
      .listen('stop-game', this.stopGame)
      .listen('settings-updated', this.settingsUpdated)
      .listen('error', this.serverError);

    this.registerActions();
    serverListener.listen('set-internet-connection', this.handleInternetConnection);
    window.addEventListener('online', this.handleInternetConnection);
    window.addEventListener('offline', this.handleInternetConnection);
  }

  public componentWillUnmount() {
    controlsHandler.unregister();
    window.removeEventListener('online', this.handleInternetConnection);
    window.removeEventListener('offline', this.handleInternetConnection);
  }

  private removePlayableGame = (gameUuid: string) => {
    const playedGameName: string = this.props.playableGames.getGame(gameUuid).name;
    this.props.removePlayableGame(gameUuid);
    this.props.selectGame(this.props.playableGames.size() ? this.props.playableGames.getGame(0) : null);
    notify(this.props.intl.formatMessage({ id: 'toasts.removingGame' }, { name: playedGameName }), true);
  };

  private launchGame = (gameUuid: string) => () => {
    const playedGame: PlayableGame = this.props.playableGames.getGame(gameUuid);
    notify(this.props.intl.formatMessage({ id: 'toasts.launchingGame' }, { name: playedGame.name }), true);
    serverListener.send('launch-game', gameUuid);
    this.props.launchGame(this.props.playableGames.getGame(gameUuid));
  };

  private stopGame = (gameUuid: string, totalTimePlayed: number) => {
    const playedGame: PlayableGame = { ...this.props.playableGames.getGame(gameUuid) } as PlayableGame;
    const timeJustPlayed: number = totalTimePlayed - playedGame.timePlayed;
    playedGame.timePlayed = totalTimePlayed;
    this.props.stopGame(playedGame);
    notify(
      this.props.intl.formatMessage(
        { id: 'toasts.stoppingGame' },
        {
          name: playedGame.name,
          time: formatTimePlayed(timeJustPlayed, this.props.intl.formatMessage)
        }
      ),
      true
    );
  };

  private settingsUpdated = (settings: any) => {
    this.props.updateSettings(settings);
    this.props.closeSettingsModal();
    if (this.state.firstLaunch) {
      this.setState({
        firstLaunch: false
      });
    }
  };

  private serverError = (errorName: string, errorStack: string) => {
    const error: Error = new Error(errorName);
    error.stack = errorStack;
    error.name = errorName;
    this.throwError(error);
  };

  private registerActions = () => {
    controlsHandler.registerDownAction(() => {
      const index: number = this.props.playableGames.getIndex(this.props.selectedGame);
      if (index < this.props.playableGames.size() - 1) {
        const selectedGame: PlayableGame = this.props.playableGames.getGame(index + 1);
        this.props.selectGame(selectedGame);
        document.getElementById(`sidebar-game:${selectedGame.uuid}`).scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    });
    controlsHandler.registerUpAction(() => {
      const index: number = this.props.playableGames.getIndex(this.props.selectedGame);
      if (index) {
        const selectedGame: PlayableGame = this.props.playableGames.getGame(index - 1);
        this.props.selectGame(selectedGame);
        document.getElementById(`sidebar-game:${selectedGame.uuid}`).scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    });
    controlsHandler.registerEnterAction(() => {
      if (
        !this.props.gameAddModalVisible &&
        !this.props.potentialGamesAddModalVisible &&
        !this.props.settingsModalVisible &&
        !this.props.timePlayedEditionModalVisible
      ) {
        this.launchGame(this.props.selectedGame.uuid)();
      }
    });
  };

  private handleInternetConnection = () => {
    this.props.setInternetConnection(window.navigator.onLine);
    if (!window.navigator.onLine) {
      notify(this.props.intl.formatMessage({ id: 'toasts.noInternet' }), true, true);
    }
  };

  public render(): JSX.Element {
    return (
      <div className={css(styles.vitrineApp)}>
        <InvisibleTaskBar />
        <Grid className={css(styles.mainContainer)}>
          <SideBar launchGame={this.launchGame} />
          <GameContainer launchGame={this.launchGame} />
        </Grid>
        <GameAddModal />
        <TimePlayedEditionModal />
        <PotentialGamesAddModal />
        <SettingsModal firstLaunch={this.state.firstLaunch} />
        <ToastContainer toastClassName={styles.toastNotification} />
        {this.checkErrors()}
      </div>
    );
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
  mainContainer: {
    height: (100).percents(),
    margin: 0
  },
  toastNotification: {
    borderRadius: 2,
    color: rgba(255, 255, 255, 0.72),
    padding: padding(5, 9, 7, 16)
  },
  vitrineApp: {
    cursor: 'default',
    height: (100).percents(),
    userSelect: 'none'
  }
});

const mapStateToProps = (state: AppState) => ({
  gameAddModalVisible: state.gameAddModalVisible,
  igdbResearchModalVisible: state.igdbResearchModalVisible,
  launchedGame: state.launchedGame,
  playableGames: state.playableGames,
  potentialGamesAddModalVisible: state.potentialGamesAddModalVisible,
  selectedGame: state.selectedGame,
  settings: state.settings,
  settingsModalVisible: state.settingsModalVisible,
  timePlayedEditionModalVisible: state.timePlayedEditionModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  updateSettings(settings: any) {
    dispatch(updateSettings(settings));
    dispatch(setLocale(settings.lang));
  },
  addPotentialGames(potentialGames: PotentialGame[]) {
    dispatch(addPotentialGames(potentialGames));
  },
  addPlayableGames(playableGames: PlayableGame[]) {
    dispatch(addPlayableGames(playableGames));
  },
  removePlayableGame(gameUuid: string) {
    dispatch(removePlayableGame(gameUuid));
  },
  launchGame(launchedGame: PlayableGame) {
    dispatch(launchGame(launchedGame));
  },
  stopGame(playedGame: PlayableGame) {
    dispatch(stopGame(playedGame));
  },
  selectGame(selectedGame: PlayableGame) {
    dispatch(selectGame(selectedGame));
  },
  openSettingsModal() {
    dispatch(openSettingsModal());
  },
  closeSettingsModal() {
    dispatch(closeSettingsModal());
  },
  setInternetConnection(internetConnection: boolean) {
    dispatch(setInternetConnection(internetConnection));
  }
});

const VitrineContainer = injectIntl(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Vitrine)
);

export { VitrineContainer as Vitrine };
