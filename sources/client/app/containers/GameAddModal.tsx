import { connect, Dispatch } from 'react-redux';

import { PlayableGame } from '../../../models/PlayableGame';
import { PotentialGame } from '../../../models/PotentialGame';
import { Action } from '../actions/actionsTypes';
import { addPlayableGames, editPlayableGame, selectGame, setGameToEdit, setPotentialGameToAdd } from '../actions/games';
import { closeGameAddModal, closeIgdbResearchModal, closeTimePlayedEditionModal } from '../actions/modals';
import { AppState } from '../AppState';
import { GameAddModal as GameAddModalComponent } from '../components/GameAddModal';

const mapStateToProps = (state: AppState) => ({
	internetConnection: state.internetConnection,
	selectedGame: state.selectedGame,
	potentialGameToAdd: state.potentialGameToAdd,
	gameToEdit: state.gameToEdit,
	visible: state.gameAddModalVisible,
	igdbResearchModalVisible: state.igdbResearchModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	addPlayableGames(playableGames: PlayableGame[]) {
		dispatch(addPlayableGames(playableGames));
	},
	editPlayableGame(playableGame: PlayableGame) {
		dispatch(editPlayableGame(playableGame));
	},
	setPotentialGameToAdd(potentialGame: PotentialGame) {
		dispatch(setPotentialGameToAdd(potentialGame));
	},
	setGameToEdit(playableGame: PlayableGame) {
		dispatch(setGameToEdit(playableGame));
	},
	selectGame(selectedGame: PlayableGame) {
		dispatch(selectGame(selectedGame));
	},
	closeGameAddModal() {
		dispatch(closeGameAddModal());
	},
	closeIgdbResearchModal() {
		dispatch(closeIgdbResearchModal());
	},
	closeTimePlayedEditionModal() {
		dispatch(closeTimePlayedEditionModal());
	}
});

export const GameAddModal = connect(mapStateToProps, mapDispatchToProps)(GameAddModalComponent);
