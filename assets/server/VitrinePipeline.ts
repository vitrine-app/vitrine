import * as path from 'path';
import * as fs from 'fs-extra';

import { VitrineServer } from './VitrineServer';
import { getEnvData, getEnvFolder } from '../models/env';

export class VitrinePipeline {
	private serverInstance: VitrineServer;
	private prod: boolean;
	private gamesFolderPath: string;
	private configFolderPath: string;
	private vitrineConfigFilePath: string;

	public constructor() {
		this.prod = (getEnvData().env) ? (true) : (false);
		this.gamesFolderPath = getEnvFolder('games');
		this.configFolderPath = getEnvFolder('config');
	}

	public launch() {
		fs.ensureDirSync(this.configFolderPath);
		fs.ensureDirSync(this.gamesFolderPath);
		this.vitrineConfigFilePath = path.resolve(this.configFolderPath, 'vitrine_config.json');
		fs.ensureFileSync(this.vitrineConfigFilePath);
		let vitrineConfig: any = this.includeEmulatorsConfig(fs.readJSONSync(this.vitrineConfigFilePath, { throws: false }));
		this.launchMainClient(vitrineConfig);
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
		let consolesConfigFilePath: string = path.resolve(this.configFolderPath, 'consoles.json');
		let emulatorsConfigFilePath: string = path.resolve(this.configFolderPath, 'emulators.json');
		let newVitrineConfig: any = (vitrineConfig) ? ({ ...vitrineConfig, emulated: {} }) : ({ firstLaunch: true, emulated: {} });
		newVitrineConfig.emulated.consoles = fs.readJSONSync(consolesConfigFilePath, { throws: false });
		newVitrineConfig.emulated.emulators = fs.readJSONSync(emulatorsConfigFilePath, { throws: false });
		return newVitrineConfig;
	}

	private launchMainClient(vitrineConfig: any) {
		if (!this.prod)
			this.registerDebugPromiseHandler();
		this.serverInstance = new VitrineServer(vitrineConfig, this.configFolderPath);
		this.serverInstance.registerEvents();
		this.serverInstance.run(!this.prod);
	}
}
