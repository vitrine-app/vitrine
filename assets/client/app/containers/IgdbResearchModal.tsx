import { connect, Dispatch } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { IgdbResearchModal as VisualIgdbResearchModal } from '../components/IgdbResearchModal';
import { Action } from '../actions/actionsTypes';
import { openIgdbModal, closeIgdbModal } from '../actions/modals';

const mapStateToProps = (state: VitrineState) => ({
	visible: state.igdbResearchModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	openIgdbModal: () => {
		dispatch(openIgdbModal())
	},
	closeIgdbModal: () => {
		dispatch(closeIgdbModal())
	}
});

export const IgdbResearchModal = connect(mapStateToProps, mapDispatchToProps)(VisualIgdbResearchModal);
