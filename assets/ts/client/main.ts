import * as jQuery from 'jquery';
(<any>window).jQuery = (<any>window).$ = jQuery;
import 'bootstrap-sass';
import 'electron-titlebar';
import 'bootstrap-datepicker';
import 'jquery-contextmenu';

import { VitrineClient } from './VitrineClient';
import { launchDom } from './dom';
import { adaptComponent } from './bootstrap';

adaptComponent();

let vitrineClient: VitrineClient = new VitrineClient();
vitrineClient.registerEvents();
launchDom();
vitrineClient.run();
