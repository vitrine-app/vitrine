import { connect, Dispatch } from 'react-redux';

import { VitrineState } from '../VitrineState';
import { Action } from '../actions/actionsTypes';
import { updateSettings } from '../actions/settings';
import { addPotentialGames, launchGame, refreshGames } from '../actions/games';
import { Vitrine as VisualVitrine } from '../components/Vitrine';
import { PlayableGame } from '../../../models/PlayableGame';
import { PotentialGame } from '../../../models/PotentialGame';

const mapStateToProps = (state: VitrineState) => ({
	settings: state.settings,
	potentialGames: state.potentialGames,
	launchedGame: state.launchedGame,
	refreshingGames: state.refreshingGames,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	updateSettings: (settings: any) => dispatch(updateSettings(settings)),
	addPotentialGames: (potentialGames: PotentialGame[]) => dispatch(addPotentialGames(potentialGames)),
	launchGame: (launchedGame: PlayableGame) => dispatch(launchGame(launchedGame))
});

export const Vitrine = connect(mapStateToProps, mapDispatchToProps)(VisualVitrine);
