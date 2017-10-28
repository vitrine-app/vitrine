import * as jQuery from 'jquery';
window.jQuery = window.$ = jQuery;
import 'bootstrap-sass';
import 'bootstrap-select'

import * as React from 'react';
import { render } from 'react-dom';

import './sass/main.scss';
import { App } from './components/App';

render(<App/>, document.getElementById('app'));
