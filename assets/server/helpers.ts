import * as fs from 'fs-extra';
import * as downloadFile from 'download-file';

import { VitrineServer } from './VitrineServer';

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

