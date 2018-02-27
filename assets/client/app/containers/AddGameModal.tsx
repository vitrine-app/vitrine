import { connect, Dispatch } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { Action } from '../actions/actionsTypes';
import { addPlayableGames } from '../actions/games';
import { closeAddGameModal, closeIgdbResearchModal, openAddGameModal, openIgdbResearchModal } from '../actions/modals';
import { AddGameModal as VisualAddGameModal } from '../components/AddGameModal';
import { PlayableGame } from '../../../models/PlayableGame';

const mapStateToProps = (state: VitrineState) => ({
	potentialGameToAdd: state.potentialGameToAdd,
	visible: state.addGameModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	addPlayableGames: (playableGames: PlayableGame[]) => {
		dispatch(addPlayableGames(playableGames))
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

});

export const AddGameModal = connect(mapStateToProps, mapDispatchToProps)(VisualAddGameModal);
