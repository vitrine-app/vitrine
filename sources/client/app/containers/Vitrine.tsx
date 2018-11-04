import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { PlayableGame } from '../../../models/PlayableGame';
import { PotentialGame } from '../../../models/PotentialGame';
import { Vitrine as VitrineComponent } from '../features/homescreen/Vitrine';
import { Action } from '../features/redux/actions/actionsTypes';
import { addPlayableGames, addPotentialGames, launchGame, removePlayableGame, selectGame, stopGame } from '../features/redux/actions/games';
import { closeSettingsModal, openSettingsModal } from '../features/redux/actions/modals';
import { setInternetConnection, setLocale, updateSettings } from '../features/redux/actions/settings';
import { AppState } from '../features/redux/AppState';

const mapStateToProps = (state: AppState) => ({
  settings: state.settings,
  playableGames: state.playableGames,
  selectedGame: state.selectedGame,
  launchedGame: state.launchedGame,
  gameAddModalVisible: state.gameAddModalVisible,
  igdbResearchModalVisible: state.igdbResearchModalVisible,
  timePlayedEditionModalVisible: state.timePlayedEditionModalVisible,
  potentialGamesAddModalVisible: state.potentialGamesAddModalVisible,
  settingsModalVisible: state.settingsModalVisible
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

// @ts-ignore
export const Vitrine = injectIntl(connect(mapStateToProps, mapDispatchToProps)(VitrineComponent));
