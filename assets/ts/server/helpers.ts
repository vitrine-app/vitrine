import * as fs from 'fs-extra';
import * as path from 'path';
import * as uuid from 'uuid/v5';
import * as downloadFile from 'download-file';

import { getEnvData } from '../models/env';

export function uuidV5(name: string): string {
	let dnsNamespace: string = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

	return uuid(name, dnsNamespace);
}

export function downloadImage(url: string, path: string): Promise<any> {
	return new Promise((resolve, reject) => {
		if (!url || url === path)
			resolve(false);
		if (url.startsWith('file://')) {
			fs.copy(url.substring(7), path).then(() => {
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
					throw error;
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
