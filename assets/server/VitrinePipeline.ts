import * as path from 'path';
import { sync as mkDir } from 'mkdirp';

import { VitrineServer } from './VitrineServer';
import { getEnvData } from '../models/env';

export class VitrinePipeline {
	private prod: boolean;

	public constructor(private serverInstance: VitrineServer) {
		this.prod = (getEnvData().env) ? (true) : (false);
	}

	public launch() {
		this.createGamesFolder();

		this.serverInstance.registerEvents();
		this.serverInstance.run(!this.prod);
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
