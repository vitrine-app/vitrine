import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as uuid from 'uuid/v5';
import * as path from 'path';

export function uuidV5(name: string) {
	let dnsNamespace: string = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

	return uuid(name, dnsNamespace);
}

export function downloadFile(url, path, isHttps, callback) {
	let file = fs.createWriteStream(path);
	let protocol: any = (isHttps) ? (https) : (http);

	protocol.get(url, (response) => {
		response.pipe(file);
		callback();
	});
}

let isEnvProd: boolean = (JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json')).toString()).env) ? (true) : (false);

export function getGamesFolder() {
	return path.resolve(__dirname, (isEnvProd) ? ('../../games') : ('../games'));
}
