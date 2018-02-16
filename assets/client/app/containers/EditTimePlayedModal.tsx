import { connect } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { EditTimePlayedModal as VisualEditTimePlayedModal } from '../components/EditTimePlayedModal';
const mapStateToProps = (state: VitrineState) => ({
	editedGame: state.potentialGameToAdd
});

const mapDispatchToProps = () => ({});

export const EditTimePlayedModal = connect(mapStateToProps, mapDispatchToProps)(VisualEditTimePlayedModal);
