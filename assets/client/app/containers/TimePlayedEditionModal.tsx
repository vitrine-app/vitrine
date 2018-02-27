import { connect, Dispatch } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { TimePlayedEditionModal as VisualTimePlayedEditionModal } from '../components/TimePlayedEditionModal';
import { Action } from '../actions/actionsTypes';
import { openTimePlayedEditionModal, closeTimePlayedEditionModal } from '../actions/modals';

const mapStateToProps = (state: VitrineState) => ({
	gameToEdit: state.gameToEdit,
	visible: state.timePlayedEditionModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	openTimePlayedEditionModal: () => {
		dispatch(openTimePlayedEditionModal())
	},
	closeTimePlayedEditionModal: () => {
		dispatch(closeTimePlayedEditionModal())
	}
});

export const TimePlayedEditionModal = connect(mapStateToProps, mapDispatchToProps)(VisualTimePlayedEditionModal);
