import * as React from 'react';
import { render } from 'react-dom';

import { VitrineLoader } from './app/components/VitrineLoader';

import './resources/less/main.less';

const appRoot: HTMLElement = document.createElement('div');
document.body.appendChild(appRoot);

render(
	<VitrineLoader/>,
	appRoot
);
