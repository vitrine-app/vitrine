import { connect } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { AddGameModal as VisualAddGameModal } from '../components/AddGameModal';
const mapStateToProps = (state: VitrineState) => ({
	potentialGameToAdd: state.potentialGameToAdd
});

const mapDispatchToProps = () => ({});

export const AddGameModal = connect(mapStateToProps, mapDispatchToProps)(VisualAddGameModal);
