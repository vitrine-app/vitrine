import { connect, Dispatch } from 'react-redux';

import { AppState } from '../AppState';
import { IgdbResearchModal as VisualIgdbResearchModal } from '../components/IgdbResearchModal';
import { Action } from '../actions/actionsTypes';
import { closeIgdbResearchModal } from '../actions/modals';

const mapStateToProps = (state: AppState) => ({
	visible: state.igdbResearchModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	closeIgdbResearchModal: () => {
		dispatch(closeIgdbResearchModal())
	}
});

export const IgdbResearchModal = connect(mapStateToProps, mapDispatchToProps)(VisualIgdbResearchModal);
