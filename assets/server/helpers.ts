import * as fs from 'fs-extra';
import * as crypto from 'crypto';
import * as glob from 'glob';
import * as downloadFile from 'download-file';

function deleteFiles(path: string, except?: string): Promise<any> {
	return new Promise((resolve, reject) => {
		glob(path, (error: Error, files: string[]) => {
			if (error) {
				reject(error);
				return;
			}
			if (!files.length) {
				resolve();
				return;
			}
			let counter: number = 0;
			files.forEach((file: string) => {
				if (file !== except.replace(/\\/g, '/'))
					fs.removeSync(file);
				counter++;
				if (counter === files.length)
					resolve();
			});
		});
	});
}

export function downloadImage(url: string, path: string): Promise<any> {
	return new Promise((resolve, reject) => {
		if (!url || !fs.existsSync(url.substring(7))) {
			resolve(false);
			return;
		}
		if (url.startsWith('file://')) {
			url = url.substring(7);
			if (url === path) {
				resolve(true);
				return;
			}
			fs.copy(url, path).then(() => {
				let fileGlob: string = path.replace(/(\w+)\.(\w+)\.(\w+)/g, '$1.*.$3');
				deleteFiles(fileGlob, path).then(() => {
					resolve(true);
				}).catch((error: Error) => {
					reject(error);
				});
			}).catch((error: Error) => {
				reject(error);
			});
		}
		else {
			let filename: string = path.split('\\').pop();
			path = path.substring(0, path.indexOf(filename));
			downloadFile(url, {
				directory: path,
				filename: filename
			}, (error: Error) => {
				if (error)
					reject(error);
				else
					resolve(true);
			});
		}
	});
}

export function randomHashedString(length?: number): string {
	const finalLength: number = length || 8;
	return crypto.randomBytes(Math.ceil(finalLength / 2)).toString('hex').slice(0, finalLength);
}
