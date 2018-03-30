import { connect, Dispatch } from 'react-redux';

import { AppState } from '../AppState';
import { TimePlayedEditionModal as VisualTimePlayedEditionModal } from '../components/TimePlayedEditionModal';
import { Action } from '../actions/actionsTypes';
import { closeTimePlayedEditionModal } from '../actions/modals';

const mapStateToProps = (state: AppState) => ({
	gameToEdit: state.gameToEdit,
	visible: state.timePlayedEditionModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	closeTimePlayedEditionModal: () => {
		dispatch(closeTimePlayedEditionModal())
	}
});

export const TimePlayedEditionModal = connect(mapStateToProps, mapDispatchToProps)(VisualTimePlayedEditionModal);
