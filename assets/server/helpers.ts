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

export function downloadImage(src: string, dest: string): Promise<any> {
	return new Promise((resolve, reject) => {
		if (!src || (src.startsWith('file://') && !fs.existsSync(src.substring(7)))) {
			resolve(false);
			return;
		}
		if (src.startsWith('file://')) {
			src = src.substring(7);
			if (src === dest) {
				resolve(true);
				return;
			}
			fs.copy(src, dest).then(() => {
				let fileGlob: string = dest.replace(/(\w+)\.(\w+)\.(\w+)/g, '$1.*.$3');
				deleteFiles(fileGlob, dest).then(() => {
					resolve(true);
				}).catch((error: Error) => {
					reject(error);
				});
			}).catch((error: Error) => {
				reject(error);
			});
		}
		else {
			let filename: string = dest.split('\\').pop();
			dest = dest.substring(0, dest.indexOf(filename));
			downloadFile(src, {
				directory: dest,
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

export function isAlreadyStored(imageSrcPath: string, imageDestPath: string): boolean {
	return imageSrcPath === imageDestPath && imageSrcPath.startsWith('file://');
}

export function randomHashedString(length?: number): string {
	const finalLength: number = length || 8;
	return crypto.randomBytes(Math.ceil(finalLength / 2)).toString('hex').slice(0, finalLength);
}

export function spatStr(str: string) {
	return str.replace(/ /g, '').replace(/([-:])/g, '|')
}
