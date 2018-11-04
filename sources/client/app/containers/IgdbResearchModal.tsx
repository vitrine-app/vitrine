import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { Action } from '../features/redux/actions/actionsTypes';
import { closeIgdbResearchModal, openIgdbResearchModal } from '../features/redux/actions/modals';
import { AppState } from '../features/redux/AppState';
import { IgdbResearchModal as IgdbResearchModalComponent } from '../features/researchGame/IgdbResearchModal';

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
