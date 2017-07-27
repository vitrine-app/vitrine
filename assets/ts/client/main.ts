import * as jQuery from 'jquery';
(<any>window).jQuery = (<any>window).$ = jQuery;
import 'bootstrap-sass';

import { clientBootstrap } from './bootstrap';
import { launchEvents } from './events';
import { launchDom } from './dom';

clientBootstrap(() => {
	console.log('We escaped the loop!');
	launchEvents();
	launchDom();
});
