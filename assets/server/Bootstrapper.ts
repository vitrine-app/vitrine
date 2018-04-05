import * as fs from 'fs-extra';
import * as path from 'path';

import { getEnvFolder, isProduction } from '../models/env';
import { logger } from './Logger';
import { Server } from './Server';

export class Bootstrapper {
	private readonly configFileName: string;
	private readonly gamesFolderPath: string;
	private readonly configFolderPath: string;
	private serverInstance: Server;
	private vitrineConfigFilePath: string;
	private vitrineConfig: any;

	public constructor() {
		this.configFileName = 'vitrine_config.json';
		this.gamesFolderPath = getEnvFolder('games');
		this.configFolderPath = getEnvFolder('config');
	}

	public async launch() {
		fs.ensureDirSync(this.configFolderPath);
		fs.ensureDirSync(this.gamesFolderPath);

		const configFolderOriginalPath: string = getEnvFolder('config', true);
		this.vitrineConfigFilePath = path.resolve(this.configFolderPath, this.configFileName);
		if (!fs.pathExistsSync(this.vitrineConfigFilePath))
			fs.copySync(configFolderOriginalPath, this.configFolderPath);
		this.vitrineConfig = fs.readJsonSync(this.vitrineConfigFilePath, { throws: false });
		logger.info('Bootstrapper', 'vitrine_config.json read.');
		await this.includeEmulatorsConfig();
		this.launchMainClient();
	}

	private registerDebugPromiseHandler() {
		process.on('unhandledRejection', (reason: Error) => {
			console.error('[PROCESS] Unhandled Promise Rejection');
			console.error('=====================================');
			console.error(reason);
			console.error('===');
		});
	}

	private includeEmulatorsConfig(): Promise<any> {
		return new Promise((resolve) => {
			logger.info('Bootstrapper', 'Including emulators and platforms data.');
			const platformsConfigFilePath: string = path.resolve(this.configFolderPath, 'platforms.json');
			const emulatorsConfigFilePath: string = path.resolve(this.configFolderPath, 'emulators.json');
			const emulated: any = this.vitrineConfig.emulated || {};
			const newVitrineConfig: any = (this.vitrineConfig.lang) ? ({ ...this.vitrineConfig, emulated }) : ({ firstLaunch: true, emulated });
			newVitrineConfig.emulated.platforms = fs.readJsonSync(platformsConfigFilePath, { throws: false });
			newVitrineConfig.emulated.emulators = fs.readJsonSync(emulatorsConfigFilePath, { throws: false });
			logger.info('Bootstrapper', 'Emulators and platforms added to config.');
			this.vitrineConfig = newVitrineConfig;
			resolve();
		});
	}

	private launchMainClient() {
		logger.info('Bootstrapper', 'Launching main client.');
		if (!isProduction())
			this.registerDebugPromiseHandler();
		this.serverInstance = new Server(this.vitrineConfig, this.vitrineConfigFilePath, this.configFolderPath);
		this.serverInstance.registerEvents();
		this.serverInstance.run();
	}
}
