import * as jQuery from 'jquery';
window.jQuery = window.$ = jQuery;
import 'bootstrap-sass';

import * as React from 'react';
import { render } from 'react-dom';

import './sass/main.scss';
import { VitrineLoader } from './components/VitrineLoader';

render(<VitrineLoader/>, document.getElementById('app'));
