import { injectIntl } from 'react-intl';
import { connect, Dispatch } from 'react-redux';

import { PlayableGame, SortParameter } from '../../../models/PlayableGame';
import { Action } from '../actions/actionsTypes';
import { refreshGames, selectGame, sortGames } from '../actions/games';
import { openGameAddModal, openPotentialGamesAddModal, openSettingsModal } from '../actions/modals';
import { AppState } from '../AppState';
import { SideBar as SideBarComponent } from '../components/SideBar';

const mapStateToProps = (state: AppState) => ({
  potentialGames: state.potentialGames,
  playableGames: state.playableGames,
  selectedGame: state.selectedGame,
  refreshingGames: state.refreshingGames,
  gamesSortParameter: state.gamesSortParameter
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  selectGame(selectedGame: PlayableGame) {
    dispatch(selectGame(selectedGame));
  },
  refreshGames() {
    dispatch(refreshGames());
  },
  sortGames(gamesSortParameter: SortParameter) {
    dispatch(sortGames(gamesSortParameter));
  },
  openGameAddModal() {
    dispatch(openGameAddModal());
  },
  openPotentialGamesAddModal() {
    dispatch(openPotentialGamesAddModal());
  },
  openSettingsModal() {
    dispatch(openSettingsModal());
  }
});

export const SideBar = injectIntl(connect(mapStateToProps, mapDispatchToProps)(SideBarComponent));
