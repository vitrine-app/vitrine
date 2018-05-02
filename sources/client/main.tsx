import 'foreach-end';
import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore, Middleware, Store } from 'redux';

import { AppState, initialState } from './app/AppState';
import { App } from './app/containers/App';
import {
	gamesSortParameter,
	gameToEdit,
	launchedGame,
	playableGames,
	potentialGames,
	potentialGameToAdd,
	refreshingGames,
	selectedGame
} from './app/reducers/games';
import { gameAddModalVisible, igdbResearchModalVisible, potentialGamesAddModalVisible, settingsModalVisible,
	timePlayedEditionModalVisible } from './app/reducers/modals';
import { modulesConfig, settings } from './app/reducers/settings';

import './resources/less/main.less';

const logger: Middleware = (store: any) => (next: any) => (action: any): any => {
	console.log('Dispatching: ', action);
	const result = next(action);
	console.log('New state: ', store.getState(), '\n===============');
	return result;
};

const store: Store<AppState> = createStore(combineReducers({
	settings,
	modulesConfig,
	potentialGames,
	playableGames,
	selectedGame,
	launchedGame,
	refreshingGames,
	potentialGameToAdd,
	gameToEdit,
	gamesSortParameter,
	gameAddModalVisible,
	igdbResearchModalVisible,
	timePlayedEditionModalVisible,
	potentialGamesAddModalVisible,
	settingsModalVisible
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
