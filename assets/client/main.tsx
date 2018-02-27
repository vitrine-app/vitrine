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
import { gameToEdit, launchedGame, playableGames, potentialGames, potentialGameToAdd, refreshingGames, selectedGame } from './app/reducers/games';
import { gameAddModalVisible, igdbResearchModalVisible, timePlayedEditionModalVisible } from './app/reducers/modals';

import './resources/less/main.less';

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
	potentialGameToAdd,
	gameToEdit,
	gameAddModalVisible,
	igdbResearchModalVisible,
	timePlayedEditionModalVisible
}), initialState, applyMiddleware(logger));

const appRoot: HTMLElement = document.createElement('div');
appRoot.style.setProperty('height', 100..percents());
document.body.appendChild(appRoot);

render(
	<Provider store={store}>
		<App/>
	</Provider>,
	appRoot
);
