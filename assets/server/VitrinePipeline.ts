import * as path from 'path';
import * as fs from 'fs-extra';

import { VitrineServer } from './VitrineServer';
import { getEnvData, getEnvFolder } from '../models/env';

export class VitrinePipeline {
	private serverInstance: VitrineServer;
	private prod: boolean;
	private configFileName: string;
	private gamesFolderPath: string;
	private configFolderPath: string;
	private vitrineConfigFilePath: string;

	public constructor(prod?: boolean) {
		this.prod = (prod !== undefined) ? (prod) : ((getEnvData().env) ? (true) : (false));
		this.configFileName = 'vitrine_config.json';
		this.gamesFolderPath = getEnvFolder('games');
		this.configFolderPath = getEnvFolder('config');
	}

	public launch() {
		fs.ensureDirSync(this.configFolderPath);
		fs.ensureDirSync(this.gamesFolderPath);

		let configFolderOriginalPath: string = getEnvFolder('config', true);
		this.vitrineConfigFilePath = path.resolve(this.configFolderPath, this.configFileName);
		if (!fs.pathExistsSync(this.vitrineConfigFilePath))
			fs.copySync(configFolderOriginalPath, this.configFolderPath);
		let vitrineConfig: any = this.includeEmulatorsConfig(fs.readJsonSync(this.vitrineConfigFilePath, { throws: false }));
		this.launchMainClient(vitrineConfig);
	}

	public launchAsync() {
		fs.ensureDir(this.configFolderPath)
			.then(fs.ensureDir.bind(this, this.gamesFolderPath))
			.then(() => {
				this.vitrineConfigFilePath = path.resolve(this.configFolderPath, this.configFileName);
				fs.ensureFile(this.vitrineConfigFilePath).then(() => {
					fs.readJson(this.vitrineConfigFilePath, { throws: false }).then((vitrineConfig: any) => {
						this.launchMainClient(this.includeEmulatorsConfig(vitrineConfig));
					});
				});
			});
	}

	private registerDebugPromiseHandler() {
		process.on('unhandledRejection', (reason: Error) => {
			console.error('[PROCESS] Unhandled Promise Rejection');
			console.error('- - - - - - - - - - - - - - - - - - -');
			console.error(reason);
			console.error('- -' );
		});
	}

	private includeEmulatorsConfig(vitrineConfig: any) {
		let platformsConfigFilePath: string = path.resolve(this.configFolderPath, 'platforms.json');
		let emulatorsConfigFilePath: string = path.resolve(this.configFolderPath, 'emulators.json');
		let newVitrineConfig: any = (vitrineConfig) ? ({ ...vitrineConfig, emulated: {} }) : ({ firstLaunch: true, emulated: {} });
		newVitrineConfig.emulated.platforms = fs.readJsonSync(platformsConfigFilePath, { throws: false });
		newVitrineConfig.emulated.emulators = fs.readJsonSync(emulatorsConfigFilePath, { throws: false });
		return newVitrineConfig;
	}

	private launchMainClient(vitrineConfig: any) {
		if (!this.prod)
			this.registerDebugPromiseHandler();
		this.serverInstance = new VitrineServer(vitrineConfig, this.configFolderPath);
		this.serverInstance.registerEvents();
		this.serverInstance.run(this.prod);
	}
}
