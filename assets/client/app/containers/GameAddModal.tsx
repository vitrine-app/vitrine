import { connect, Dispatch } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { Action } from '../actions/actionsTypes';
import { addPlayableGames, editPlayableGame, selectGame, setGameToEdit } from '../actions/games';
import { closeGameAddModal, closeIgdbResearchModal, closeTimePlayedEditionModal, openIgdbResearchModal } from '../actions/modals';
import { GameAddModal as VisualGameAddModal } from '../components/GameAddModal';
import { PlayableGame } from '../../../models/PlayableGame';

const mapStateToProps = (state: VitrineState) => ({
	selectedGame: state.selectedGame,
	potentialGameToAdd: state.potentialGameToAdd,
	gameToEdit: state.gameToEdit,
	visible: state.gameAddModalVisible,
	igdbResearchModalVisible: state.igdbResearchModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	addPlayableGames: (playableGames: PlayableGame[]) => {
		dispatch(addPlayableGames(playableGames))
	},
	editPlayableGame: (playableGame: PlayableGame) => {
		dispatch(editPlayableGame(playableGame))
	},
	setGameToEdit: (playableGame: PlayableGame) => {
		dispatch(setGameToEdit(playableGame))
	},
	selectGame: (selectedGame: PlayableGame) => {
		dispatch(selectGame(selectedGame))
	},
	closeGameAddModal: () => {
		dispatch(closeGameAddModal())
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

export const GameAddModal = connect(mapStateToProps, mapDispatchToProps)(VisualGameAddModal);
