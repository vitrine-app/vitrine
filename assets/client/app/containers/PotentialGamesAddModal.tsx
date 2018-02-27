import { connect, Dispatch } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { PotentialGamesAddModal as VisualPotentialGamesAddModal } from '../components/PotentialGamesAddModal';
import { Action } from '../actions/actionsTypes';
import { setPotentialGameToAdd } from '../actions/games';
import { openGameAddModal, closePotentialGamesAddModal } from '../actions/modals';
import { PotentialGame } from '../../../models/PotentialGame';

const mapStateToProps = (state: VitrineState) => ({
	potentialGames: state.potentialGames,
	visible: state.potentialGamesAddModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	setPotentialGameToAdd: (potentialGame: PotentialGame) => {
		dispatch(setPotentialGameToAdd(potentialGame));
	},
	openGameAddModal: () => {
		dispatch(openGameAddModal());
	},
	closePotentialGamesAddModal: () => {
		dispatch(closePotentialGamesAddModal());
	}
});

export const PotentialGamesAddModal = connect(mapStateToProps, mapDispatchToProps)(VisualPotentialGamesAddModal);
