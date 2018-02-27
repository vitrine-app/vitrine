import { connect, Dispatch } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { IgdbResearchModal as VisualIgdbResearchModal } from '../components/IgdbResearchModal';
import { Action } from '../actions/actionsTypes';
import { closeIgdbResearchModal } from '../actions/modals';

const mapStateToProps = (state: VitrineState) => ({
	visible: state.igdbResearchModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	closeIgdbResearchModal: () => {
		dispatch(closeIgdbResearchModal())
	}
});

export const IgdbResearchModal = connect(mapStateToProps, mapDispatchToProps)(VisualIgdbResearchModal);
