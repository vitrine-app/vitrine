import { install } from 'source-map-support';

import { Bootstrapper } from './Bootstrapper';
import { logger } from './Logger';

install();
try {
	logger.createLogger();
	new Bootstrapper().launch();
}
catch (error) {
	console.error('An uncaught error happened: ', error);
}
