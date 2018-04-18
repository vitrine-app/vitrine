import { connect, Dispatch } from 'react-redux';

import { Action } from '../actions/actionsTypes';
import { closeIgdbResearchModal, openIgdbResearchModal } from '../actions/modals';
import { AppState } from '../AppState';
import { IgdbResearchModal as VisualIgdbResearchModal } from '../components/IgdbResearchModal';

const mapStateToProps = (state: AppState) => ({
	visible: state.igdbResearchModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	openIgdbResearchModal: () => {
		dispatch(openIgdbResearchModal());
	},
	closeIgdbResearchModal: () => {
		dispatch(closeIgdbResearchModal());
	}
});

export const IgdbResearchModal = connect(mapStateToProps, mapDispatchToProps)(VisualIgdbResearchModal);
