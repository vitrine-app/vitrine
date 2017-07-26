import { Vitrine } from './Vitrine';
import { events } from './events';
import { SteamGamesCrawler } from './games/SteamGamesCrawler';

/*
let vitrineApp = new Vitrine();
vitrineApp.registerEvents(events);

vitrineApp.run(true);
*/

let steamGamesCrawler: SteamGamesCrawler = new SteamGamesCrawler();
steamGamesCrawler.search();
