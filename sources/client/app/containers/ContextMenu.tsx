import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { PlayableGame } from '../../../models/PlayableGame';
import { ContextMenu as ContextMenuComponent } from '../features/homescreen/ContextMenu';
import { Action } from '../features/redux/actions/actionsTypes';
import { launchGame, setGameToEdit } from '../features/redux/actions/games';
import { openGameAddModal, openTimePlayedEditionModal } from '../features/redux/actions/modals';
import { AppState } from '../features/redux/AppState';

const mapStateToProps = (state: AppState) => ({
  playableGames: state.playableGames
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  launchGame(launchedGame: PlayableGame) {
    dispatch(launchGame(launchedGame));
  },
  setGameToEdit(gameToEdit: PlayableGame) {
    dispatch(setGameToEdit(gameToEdit));
  },
  openGameAddModal() {
    dispatch(openGameAddModal());
  },
  openTimePlayedEditionModal() {
    dispatch(openTimePlayedEditionModal());
  }
});

export const ContextMenu = connect(mapStateToProps, mapDispatchToProps)(ContextMenuComponent);
