import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { TimePlayedEditionModal as TimePlayedEditionModalComponent } from '../features/editingTimePlayed/TimePlayedEditionModal';
import { Action } from '../features/redux/actions/actionsTypes';
import { closeTimePlayedEditionModal } from '../features/redux/actions/modals';
import { AppState } from '../features/redux/AppState';

const mapStateToProps = (state: AppState) => ({
  gameToEdit: state.gameToEdit,
  visible: state.timePlayedEditionModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  closeTimePlayedEditionModal() {
    dispatch(closeTimePlayedEditionModal());
  }
});

export const TimePlayedEditionModal = injectIntl(connect(mapStateToProps, mapDispatchToProps)(TimePlayedEditionModalComponent));
