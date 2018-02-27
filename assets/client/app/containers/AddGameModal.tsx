import { connect, Dispatch } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { Action } from '../actions/actionsTypes';
import { addPlayableGames, editPlayableGame, selectGame } from '../actions/games';
import { closeAddGameModal, closeIgdbResearchModal, closeTimePlayedEditionModal, openAddGameModal, openIgdbResearchModal } from '../actions/modals';
import { AddGameModal as VisualAddGameModal } from '../components/AddGameModal';
import { PlayableGame } from '../../../models/PlayableGame';

const mapStateToProps = (state: VitrineState) => ({
	selectedGame: state.selectedGame,
	potentialGameToAdd: state.potentialGameToAdd,
	gameToEdit: state.gameToEdit,
	visible: state.addGameModalVisible,
	igdbResearchModalVisible: state.igdbResearchModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	addPlayableGames: (playableGames: PlayableGame[]) => {
		dispatch(addPlayableGames(playableGames))
	},
	editPlayableGame: (playableGame: PlayableGame) => {
		dispatch(editPlayableGame(playableGame))
	},
	selectGame: (selectedGame: PlayableGame) => {
		dispatch(selectGame(selectedGame))
	},
	openAddGameModal: () => {
		dispatch(openAddGameModal())
	},
	closeAddGameModal: () => {
		dispatch(closeAddGameModal())
	},
	openIgdbResearchModal: () => {
		dispatch(openIgdbResearchModal())
	},
	closeIgdbResearchModal: () => {
		dispatch(closeIgdbResearchModal())
	},
	closeTimePlayedEditionModal: () => {
		dispatch(closeTimePlayedEditionModal())
	}
});

export const AddGameModal = connect(mapStateToProps, mapDispatchToProps)(VisualAddGameModal);
