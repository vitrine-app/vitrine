import * as jQuery from 'jquery';
(<any>window).jQuery = (<any>window).$ = jQuery;
import 'bootstrap-sass';

import { clientBootstrap, loadTitleBar } from './bootstrap';
import { VitrineClient } from './VitrineClient';
import { launchDom } from './dom';

clientBootstrap(() => {
	// loadTitleBar();
	/*let vitrineClient: VitrineClient = new VitrineClient();
	vitrineClient.launchEvents();
	launchDom();
	vitrineClient.run();*/
});
