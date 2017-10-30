import * as path from 'path';
import * as fs from 'fs-extra';
import * as uuid from 'uuid/v5';

export function getEnvData(): any {
	let packagePath: string = path.resolve(__dirname, '..', 'package.json');
	return JSON.parse(fs.readFileSync(packagePath).toString());
}

export function getEnvFolder(folder: string): string {
	return path.resolve(__dirname, (getEnvData().env) ? ('../../' + folder) : ('../' + folder));
}

export function uuidV5(name: string): string {
	let dnsNamespace: string = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

	return uuid(name, dnsNamespace);
}
