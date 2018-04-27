import * as fs from 'fs-extra';
import * as path from 'path';

import { getEnvFolder } from '../models/env';
import { logger } from './Logger';
import { Server } from './Server';

export class Bootstrapper {
	private readonly configFileName: string;
	private readonly modulesConfigFileName: string;
	private readonly gamesFolderPath: string;
	private readonly configFolderPath: string;
	private serverInstance: Server;
	private vitrineConfigFilePath: string;
	private config: any;

	public constructor() {
		this.configFileName = 'vitrine_config.json';
		this.modulesConfigFileName = 'modules_config.json';
		this.gamesFolderPath = getEnvFolder('games');
		this.configFolderPath = getEnvFolder('config');
	}

	public async launch() {
		this.registerDebugPromiseHandler();
		await Promise.all([
			fs.ensureDir(this.configFolderPath),
			fs.ensureDir(this.gamesFolderPath)
		]);

		const configFolderOriginalPath: string = getEnvFolder('config', true);
		this.vitrineConfigFilePath = path.resolve(this.configFolderPath, this.configFileName);
		const vitrineModulesConfigFilePath: string = path.resolve(this.configFolderPath, this.modulesConfigFileName);
		if (!fs.pathExistsSync(this.vitrineConfigFilePath) || !fs.pathExistsSync(vitrineModulesConfigFilePath))
				await fs.copy(configFolderOriginalPath, this.configFolderPath);
		const [ modulesConfig, vitrineConfig ] = await Promise.all([
			fs.readJson(vitrineModulesConfigFilePath),
			fs.readJson(this.vitrineConfigFilePath, { throws: false })
		]);
		this.config = {
			modulesConfig,
			vitrineConfig
		};
		logger.info('Bootstrapper', `${this.configFileName} read.`);
		this.runServer();
	}

	private registerDebugPromiseHandler() {
		process.on('unhandledRejection', (reason: Error) => {
			console.error('[PROCESS] Unhandled Promise Rejection');
			console.error('=====================================');
			console.error(reason);
			console.error('=====================================');
		});
	}

	private runServer() {
		logger.info('Bootstrapper', 'Running server.');
		this.serverInstance = new Server(this.config, this.vitrineConfigFilePath);
		this.serverInstance.run();
	}
}
