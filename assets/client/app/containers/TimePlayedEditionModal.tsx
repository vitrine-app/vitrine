import { connect, Dispatch } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { TimePlayedEditionModal as VisualTimePlayedEditionModal } from '../components/TimePlayedEditionModal';
import { Action } from '../actions/actionsTypes';
import { closeTimePlayedEditionModal } from '../actions/modals';

const mapStateToProps = (state: VitrineState) => ({
	gameToEdit: state.gameToEdit,
	visible: state.timePlayedEditionModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	closeTimePlayedEditionModal: () => {
		dispatch(closeTimePlayedEditionModal())
	}
});

export const TimePlayedEditionModal = connect(mapStateToProps, mapDispatchToProps)(VisualTimePlayedEditionModal);
