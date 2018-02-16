import { connect, Dispatch } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { AddPotentialGamesModal as VisualAddPotentialGamesModal } from '../components/AddPotentialGamesModal';
import { Action } from '../actions/actionsTypes';

const mapStateToProps = (state: VitrineState) => ({
	potentialGames: state.potentialGames
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({

});

export const AddPotentialGamesModal = connect(mapStateToProps, mapDispatchToProps)(VisualAddPotentialGamesModal);
