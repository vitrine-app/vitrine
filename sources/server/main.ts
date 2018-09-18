import 'foreach-end';
import { install } from 'source-map-support';

import { Bootstrapper } from './Bootstrapper';
import { logger } from './Logger';

install();
logger.createLogger();
new Bootstrapper().launch();
