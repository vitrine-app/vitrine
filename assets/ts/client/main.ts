import * as jQuery from 'jquery';
window.jQuery = window.$ = jQuery;
import 'bootstrap-sass';
import 'electron-titlebar-absolute';
import 'bootstrap-datepicker';
import 'jquery-contextmenu';

import { VitrineClient } from './VitrineClient';
import { Dom } from './Dom';
import { adaptComponent, launchStyling } from './bootstrap';

launchStyling();
adaptComponent();

let vitrineClient: VitrineClient = new VitrineClient();
vitrineClient.registerEvents();
new Dom(vitrineClient);
vitrineClient.run();
