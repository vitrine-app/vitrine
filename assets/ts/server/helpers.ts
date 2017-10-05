import * as fs from 'fs-extra';
import * as path from 'path';
import * as uuid from 'uuid/v5';
import * as downloadFile from 'download-file';

import { getEnvData } from '../models/env';
import { VitrineServer } from './VitrineServer';

export function uuidV5(name: string): string {
	let dnsNamespace: string = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

	return uuid(name, dnsNamespace);
}

export function downloadImage(url: string, path: string): Promise<any> {
	return new Promise((resolve, reject) => {
		if (!url)
			resolve(false);
		if (url.startsWith('file://')) {
			url = url.substring(7);
			if (url === path) {
				resolve(true);
				return;
			}
			fs.copy(url, path).then(() => {
				resolve(true);
			}).catch((error) => {
				reject(error);
			});
		}
		else {
			let filename: string = path.split('\\').pop();
			path = path.substring(0, path.indexOf(filename));
			downloadFile(url, {
				directory: path,
				filename: filename
			}, (error) => {
				if (error)
					return VitrineServer.throwServerError(event, error);
				resolve(true);
			});
		}
	});
}

// TODO: Remove this temporary helper
export function getGamesFolder(): string {
	let gamesPath: string  = path.resolve(process.env.APPDATA, 'vitrine', 'data', 'games');
	return (getEnvData().env) ? (gamesPath) : (path.resolve(__dirname, '..', 'games'));
}
