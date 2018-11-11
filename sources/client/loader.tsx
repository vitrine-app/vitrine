import * as React from 'react';
import { render } from 'react-dom';
import { install } from 'source-map-support';

import { VitrineLoader } from './app/features/loader/VitrineLoader';

import './resources/less/main.less';

install();
const appRoot: HTMLElement = document.createElement('div');
document.body.appendChild(appRoot);

render(
  <VitrineLoader/>,
  appRoot
);
