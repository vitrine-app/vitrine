import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { install } from 'source-map-support';

import { App } from './app/App';
import { vitrineStore } from './app/features/redux/AppState';

import './resources/less/main.less';

install();
const appRoot: HTMLElement = document.createElement('div');
appRoot.style.setProperty('height', 100..percents());
document.body.appendChild(appRoot);

render(
  <Provider store={vitrineStore}>
    <App/>
  </Provider>,
  appRoot
);
