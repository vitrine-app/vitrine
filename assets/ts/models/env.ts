import * as path from 'path';
import * as fs from 'fs';

export function getEnvData() {
	let packagePath: string = path.resolve(__dirname, '..', 'package.json');
	return JSON.parse(fs.readFileSync(packagePath).toString());
}
