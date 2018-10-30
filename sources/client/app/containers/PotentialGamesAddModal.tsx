import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { PlayableGame } from '../../../models/PlayableGame';
import { PotentialGame } from '../../../models/PotentialGame';
import { Action } from '../actions/actionsTypes';
import { selectGame, setPlayableGames, setPotentialGames, setPotentialGameToAdd } from '../actions/games';
import { closePotentialGamesAddModal, openGameAddModal } from '../actions/modals';
import { AppState } from '../AppState';
import { PotentialGamesAddModal as PotentialGamesAddModalComponent } from '../components/PotentialGamesAddModal';

const mapStateToProps = (state: AppState) => ({
  potentialGames: state.potentialGames,
  playableGames: state.playableGames,
  visible: state.potentialGamesAddModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  setPotentialGames(potentialGames: PotentialGame[]) {
    dispatch(setPotentialGames(potentialGames));
  },
  setPlayableGames(playableGames: PlayableGame[]) {
    dispatch(setPlayableGames(playableGames));
  },
  selectGame(playableGame: PlayableGame) {
    dispatch(selectGame(playableGame));
  },
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

export const PotentialGamesAddModal = injectIntl(connect(mapStateToProps, mapDispatchToProps)(PotentialGamesAddModalComponent));
