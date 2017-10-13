import * as path from 'path';
import * as fs from 'fs-extra';

import { VitrineServer } from './VitrineServer';
import { getEnvData } from '../models/env';

export class VitrinePipeline {
	private serverInstance: VitrineServer;
	private prod: boolean;
	private gamesFolderPath: string;
	private configFolderPath: string;
	private prodFolderPath: string;

	public constructor() {
		this.prod = (getEnvData().env) ? (true) : (false);

		this.prodFolderPath = (this.prod) ? path.resolve(process.env.APPDATA, 'vitrine', 'data') : ('');
		this.gamesFolderPath = (this.prod) ? (path.resolve(this.prodFolderPath, 'games')) : (path.resolve(__dirname, '..', 'games'));
		this.configFolderPath = (this.prod) ? (path.resolve(this.prodFolderPath, 'config')) : (path.resolve(__dirname, '..', 'config'));
	}

	public launch() {
		if (this.prod) {
			fs.ensureDirSync(this.prodFolderPath);
			fs.ensureDirSync(this.configFolderPath);
		}
		fs.ensureDirSync(this.gamesFolderPath);
		let vitrineConfigFilePath: string = path.resolve(this.configFolderPath, 'vitrine_config.json');
		fs.ensureFileSync(vitrineConfigFilePath);
		let vitrineConfig: any = fs.readJSONSync(vitrineConfigFilePath, {throws: false});

		this.launchMainClient(vitrineConfig);
	}

	public launchMainClient(vitrineConfig: any) {
		this.serverInstance = new VitrineServer(vitrineConfig, this.configFolderPath);
		this.serverInstance.registerEvents();
		this.serverInstance.run(!this.prod);
	}
}
