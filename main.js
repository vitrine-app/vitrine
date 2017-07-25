const Vitrine = require('./server/Vitrine');
const events = require('./server/events');

vitrineApp = new Vitrine();
vitrineApp.registerEvents(events);

vitrineApp.run(true);
