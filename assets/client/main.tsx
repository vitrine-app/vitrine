import * as jQuery from 'jquery';
window.jQuery = window.$ = jQuery;
import 'bootstrap-sass';
import 'bootstrap-select'

import * as React from 'react';
import { render } from 'react-dom';
import { applyMiddleware, combineReducers, createStore, Middleware, Store } from 'redux';
import { Provider } from 'react-redux';

import { App } from './app/containers/App';
import { initialState, VitrineState } from './app/VitrineState';
import { settings } from './app/reducers/settings';
import {
	launchedGame, playableGames, potentialGames, potentialGameToAdd, refreshingGames,
	selectedGame
} from './app/reducers/games';

import 'semantic-ui-less/semantic.less';
// import './resources/sass/main.scss';

const logger: Middleware = (store: any) => (next: any) => (action: any): any => {
	console.log('Dispatching: ', action);
	let result = next(action);
	console.log('New state: ', store.getState(), '\n===============');
	return result;
};

let store: Store<VitrineState> = createStore(combineReducers({
	settings,
	potentialGames,
	playableGames,
	selectedGame,
	launchedGame,
	refreshingGames,
	potentialGameToAdd
}), initialState, applyMiddleware(logger));

render(
	<Provider store={store}>
		<App/>
	</Provider>,
	document.getElementById('app-root')
);
