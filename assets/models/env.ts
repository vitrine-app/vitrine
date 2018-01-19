import * as path from 'path';
import * as fs from 'fs-extra';
import * as uuid from 'uuid/v5';

export function getEnvData(): any {
	return fs.readJsonSync(path.resolve(__dirname, '..', 'package.json'));
}

export function getEnvFolder(folder: string, nonProd?: boolean): string {
	let appDataPath: string = path.resolve(process.env.APPDATA, 'vitrine', 'data', folder);
	let computedPath: string = (getEnvData().env) ? (((folder === 'games' || folder === 'config') && !nonProd) ? (appDataPath) : ('../../' + folder)) : ('../' + folder);
	return path.resolve(__dirname, computedPath);
}

export function uuidV5(name: string): string {
	let dnsNamespace: string = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
	return uuid(name, dnsNamespace);
}
