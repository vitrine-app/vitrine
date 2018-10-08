import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { Action } from '../actions/actionsTypes';
import { closeTimePlayedEditionModal } from '../actions/modals';
import { AppState } from '../AppState';
import { TimePlayedEditionModal as TimePlayedEditionModalComponent } from '../components/TimePlayedEditionModal';

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
