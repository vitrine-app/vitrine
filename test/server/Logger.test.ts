import * as fs from 'fs-extra';
import * as path from 'path';

import { getAppDataFolder, isProduction } from '@models/env';
import { Logger } from '../../sources/server/Logger';

function testLogger(prod?: boolean) {
  process.env.NODE_ENV = prod ? 'prod' : 'dev';

  return () => {
    let logger: Logger;
    let logFilePath: string;

    before(() => {
      logger = new Logger();
      logger.createLogger();
      logFilePath = path.resolve(isProduction() ? `${getAppDataFolder()}/data/vitrine.log.html` : 'vitrine.log.html');
    });

    it('Create vitrine.log.html', async () => {
      (await fs.pathExists(logFilePath)).should.equal(true);
    });

    it('Append a line after logging', async () => {
      logger.info('Logger.test', 'This is a unit test.');
      const logContent = await fs.readFile(logFilePath);
      (logContent.toString().split('\n').length).should.equal(6);
    });

    after(async () => {
      await logger.deleteLog();
    });
  };
}

describe('Logger.ts', () => {
  describe('Dev env', testLogger());
  describe('Prod env', testLogger(true));
});
