import 'foreach-end';

import { Bootstrapper } from './Bootstrapper';
import { logger } from './Logger';

logger.createLogger();
new Bootstrapper().launch();
