import * as path from 'path';
import { sync as mkDir } from 'mkdirp';

import { VitrineServer } from './VitrineServer';
import { getEnvData } from '../models/env';

export class VitrinePipeline {
	private prod: boolean;

	constructor(private serverInstance: VitrineServer) {
		this.prod = (getEnvData().env) ? (true) : (false);
	}

	public launch(devTools?: boolean) {
		if (!devTools && !this.prod)
			devTools = false;

		this.createGamesFolder();

		this.serverInstance.registerEvents();
		this.serverInstance.run(devTools);
	}

	private createGamesFolder() {
		if (this.prod) {
			let resFolderPath: string = path.resolve(process.env.APPDATA, 'vitrine', 'data');
			let gamesFolderPath: string = path.resolve(resFolderPath, 'games');
			let configFolderPath: string = path.resolve(resFolderPath, 'config');

			mkDir(resFolderPath);
			mkDir(gamesFolderPath);
			mkDir(configFolderPath);
		}
		else
			mkDir(path.resolve(__dirname, '..', 'games'));
	}
}
