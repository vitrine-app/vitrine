import { flatten } from 'flat';
import * as fs from 'fs-extra';
import { promise as glob } from 'glob-promise';
import * as path from 'path';

import { getEnvFolder, isProduction, isTesting } from '../models/env';
import { logger } from './Logger';
import { Server } from './Server';

export class Bootstrapper {
  private readonly configFileName: string;
  private readonly modulesConfigFileName: string;
  private readonly gamesFolderPath: string;
  private readonly configFolderPath: string;
  private readonly vitrineConfigFilePath: string;
  private serverInstance: Server;

  public constructor() {
    this.configFileName = 'vitrine_config.json';
    this.modulesConfigFileName = 'modules_config.json';
    this.gamesFolderPath = getEnvFolder('games');
    this.configFolderPath = getEnvFolder('config');
    this.vitrineConfigFilePath = path.resolve(this.configFolderPath, this.configFileName);

    this.registerDebugPromiseHandler();
  }

  public async launch() {
    if (isProduction() && !await fs.pathExists(this.vitrineConfigFilePath))
      await fs.copy(getEnvFolder('config', true), this.configFolderPath);

    await Promise.all([
      fs.ensureDir(this.configFolderPath),
      fs.ensureDir(this.gamesFolderPath),
      fs.ensureDir(`${this.configFolderPath}/cache`),
      fs.ensureFile(this.vitrineConfigFilePath)
    ]);
    logger.info('Bootstrapper', `${this.configFileName} read.`);
    await this.runServer();
  }

  private async loadConfig() {
    const [ modulesConfig, vitrineConfig ]: any[] = await Promise.all([
      fs.readJson(path.resolve(this.configFolderPath, this.modulesConfigFileName)),
      fs.readJson(this.vitrineConfigFilePath, { throws: false })
    ]);
    return {
      vitrineConfig: vitrineConfig || { firstLaunch: true },
      modulesConfig
    };
  }

  private async loadLocales() {
    const langFilesFolder: string = getEnvFolder('config/lang');
    const langFilesPaths = await glob(`${langFilesFolder}/*`);
    return await Promise.all(langFilesPaths.map(async (langFilePath: string) => ({
      locale: path.basename(langFilePath, '.json'),
      messages: flatten(await fs.readJson(langFilePath))
    })));
  }

  private async runServer() {
    logger.info('Bootstrapper', 'Running server.');
    const [ config, locales ]: any = await Promise.all([ this.loadConfig(), this.loadLocales() ]);
    this.serverInstance = new Server(
      config,
      locales,
      this.vitrineConfigFilePath
    );
    this.serverInstance.run();
  }

  private registerDebugPromiseHandler() {
    process.on('unhandledRejection', (reason: Error) => {
      if (!isProduction() && !isTesting()) {
        console.error('[PROCESS] Unhandled Promise Rejection');
        console.error('=====================================');
        console.error(reason);
        console.error('=====================================');
      }
    });
  }
}
