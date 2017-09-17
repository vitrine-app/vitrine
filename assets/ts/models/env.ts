import * as path from 'path';
import * as fs from 'fs-extra';

export function getEnvData(): any {
	let packagePath: string = path.resolve(__dirname, '..', 'package.json');
	return JSON.parse(fs.readFileSync(packagePath).toString());
}

export function getEnvFolder(folder: string): string {
	return path.resolve(__dirname, (getEnvData().env) ? ('../../' + folder) : ('../' + folder));
}
