import { connect, Dispatch } from 'react-redux';

import { Action } from '../actions/actionsTypes';
import { updateSettings } from '../actions/settings';
import { AppState } from '../AppState';
import { App as VisualApp } from '../components/App';

const mapStateToProps = (state: AppState) => ({
	settings: state.settings
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	updateSettings: (settings: any) => {
		dispatch(updateSettings(settings));
	}
});

export const App = connect(mapStateToProps, mapDispatchToProps)(VisualApp);
