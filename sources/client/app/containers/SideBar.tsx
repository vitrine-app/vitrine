import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { PlayableGame, SortParameter } from '../../../models/PlayableGame';
import { SideBar as SideBarComponent } from '../features/homescreen/SideBar';
import { Action } from '../features/redux/actions/actionsTypes';
import { refreshGames, selectGame, sortGames } from '../features/redux/actions/games';
import { openGameAddModal, openPotentialGamesAddModal, openSettingsModal } from '../features/redux/actions/modals';
import { AppState } from '../features/redux/AppState';

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
