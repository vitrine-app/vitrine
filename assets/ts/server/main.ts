import { VitrineServer } from './VitrineServer';

let vitrineServer = new VitrineServer();
vitrineServer.registerEvents();

vitrineServer.run(true);
