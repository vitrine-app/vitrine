import { connect, Dispatch } from 'react-redux';

import { PotentialGame } from '../../../models/PotentialGame';
import { Action } from '../actions/actionsTypes';
import { setPotentialGameToAdd } from '../actions/games';
import { closePotentialGamesAddModal, openGameAddModal } from '../actions/modals';
import { AppState } from '../AppState';
import { PotentialGamesAddModal as PotentialGamesAddModalComponent } from '../components/PotentialGamesAddModal';

const mapStateToProps = (state: AppState) => ({
  potentialGames: state.potentialGames,
  visible: state.potentialGamesAddModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  setPotentialGameToAdd(potentialGame: PotentialGame) {
    dispatch(setPotentialGameToAdd(potentialGame));
  },
  openGameAddModal() {
    dispatch(openGameAddModal());
  },
  closePotentialGamesAddModal() {
    dispatch(closePotentialGamesAddModal());
  }
});

export const PotentialGamesAddModal = connect(mapStateToProps, mapDispatchToProps)(PotentialGamesAddModalComponent);
