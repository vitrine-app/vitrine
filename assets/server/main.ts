import { VitrinePipeline } from './VitrinePipeline';

import { logger } from './Logger';

logger.createLogger();
new VitrinePipeline().launch();
