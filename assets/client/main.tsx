import * as jQuery from 'jquery';
window.jQuery = window.$ = jQuery;
import 'bootstrap-sass';
import 'bootstrap-select'

import * as React from 'react';
import { render } from 'react-dom';
import { combineReducers, createStore, Store } from 'redux';
import { Provider } from 'react-redux';

import { VitrineState } from './app/VitrineState';
import { settings } from './app/reducers/settings';
import { App } from './app/containers/App';

import './resources/sass/main.scss';

let store: Store<VitrineState> = createStore(combineReducers({
	settings
}));

store.subscribe(() => console.log('New state computed:', store.getState()));

render(
	<Provider store={store}>
		<App/>
	</Provider>,
	document.getElementById('app')
);
