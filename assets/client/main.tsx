import * as jQuery from 'jquery';
window.jQuery = window.$ = jQuery;
import 'bootstrap-sass';
import 'bootstrap-select'

import * as React from 'react';
import { render } from 'react-dom';
import { combineReducers, createStore, Store } from 'redux';
import { Provider } from 'react-redux';

import { App } from './app/containers/App';
import { initialState, VitrineState } from './app/VitrineState';
import { settings } from './app/reducers/settings';
import { launchedGame, playableGames, potentialGames, refreshingGames } from './app/reducers/games';

import './resources/sass/main.scss';

let store: Store<VitrineState> = createStore(combineReducers({
	settings,
	potentialGames,
	playableGames,
	launchedGame,
	refreshingGames
}), initialState);

store.subscribe(() => console.log('New state computed:', store.getState()));

render(
	<Provider store={store}>
		<App/>
	</Provider>,
	document.getElementById('app')
);
