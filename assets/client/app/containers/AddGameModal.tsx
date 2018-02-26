import { connect, Dispatch } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { AddGameModal as VisualAddGameModal } from '../components/AddGameModal';
import { Action } from '../actions/actionsTypes';
import { closeAddGameModal, closeIgdbModal, openAddGameModal, openIgdbModal } from '../actions/modals';

const mapStateToProps = (state: VitrineState) => ({
	potentialGameToAdd: state.potentialGameToAdd,
	visible: state.addGameModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	openAddGameModal: () => {
		dispatch(openAddGameModal())
	},
	closeAddGameModal: () => {
		dispatch(closeAddGameModal())
	},
	openIgdbModal: () => {
		dispatch(openIgdbModal())
	},
	closeIgdbModal: () => {
		dispatch(closeIgdbModal())
	},

});

export const AddGameModal = connect(mapStateToProps, mapDispatchToProps)(VisualAddGameModal);
