import { injectIntl } from 'react-intl';
import { connect, Dispatch } from 'react-redux';

import { Action } from '../actions/actionsTypes';
import { closeIgdbResearchModal, openIgdbResearchModal } from '../actions/modals';
import { AppState } from '../AppState';
import { IgdbResearchModal as IgdbResearchModalComponent } from '../components/IgdbResearchModal';

const mapStateToProps = (state: AppState) => ({
  visible: state.igdbResearchModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  openIgdbResearchModal() {
    dispatch(openIgdbResearchModal());
  },
  closeIgdbResearchModal() {
    dispatch(closeIgdbResearchModal());
  }
});

export const IgdbResearchModal = injectIntl(connect(mapStateToProps, mapDispatchToProps)(IgdbResearchModalComponent));
