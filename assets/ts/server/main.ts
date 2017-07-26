import { Vitrine } from './Vitrine';
import { events } from './events';

let vitrineApp = new Vitrine();
vitrineApp.registerEvents(events);

vitrineApp.run(true);
