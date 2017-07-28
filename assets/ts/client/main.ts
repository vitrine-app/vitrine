import * as jQuery from 'jquery';
(<any>window).jQuery = (<any>window).$ = jQuery;
import 'bootstrap-sass';

import { clientBootstrap, loadTitleBar } from './bootstrap';
import { launchEvents, setClientReady } from './events';
import { launchDom } from './dom';

clientBootstrap(() => {
	// loadTitleBar();
	launchEvents();
	launchDom();
	setClientReady();
});
