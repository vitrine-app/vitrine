import * as React from 'react';
import { render } from 'react-dom';

import * as jQuery from 'jquery';
window.jQuery = window.$ = jQuery;
import 'bootstrap-sass';
import 'electron-titlebar-absolute';
import 'bootstrap-datepicker';
import 'jquery-contextmenu';

import './sass/main.scss';
import { App } from './components/App';

render(<App/>, document.getElementById('app'));
