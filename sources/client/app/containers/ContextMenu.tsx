import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { PlayableGame } from '../../../models/PlayableGame';
import { Action } from '../actions/actionsTypes';
import { launchGame, setGameToEdit } from '../actions/games';
import { openGameAddModal, openTimePlayedEditionModal } from '../actions/modals';
import { AppState } from '../AppState';
import { ContextMenu as ContextMenuComponent } from '../components/ContextMenu';

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
