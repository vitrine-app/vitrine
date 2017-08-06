import * as jQuery from 'jquery';
(<any>window).jQuery = (<any>window).$ = jQuery;
import 'bootstrap-sass';

import { VitrineClient } from './VitrineClient';
import { launchDom } from './dom';
import { adaptComponent } from './bootstrap';

/*
clientBootstrap(() => {
	// loadTitleBar();
	let vitrineClient: VitrineClient = new VitrineClient();
	vitrineClient.registerEvents();
	launchDom();
	vitrineClient.run();
});
*/

adaptComponent();
let vitrineClient: VitrineClient = new VitrineClient();
vitrineClient.registerEvents();
launchDom();
vitrineClient.run();
