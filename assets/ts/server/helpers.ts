import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid/v5';
import * as Levenshtein from 'levenshtein';

import * as data from '../../../package.json';

let isEnvProd: boolean = ((<any>data).env) ? (true) : (false);

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

export function getEnvFolder(folder: string) {
	return path.resolve(__dirname, (isEnvProd) ? ('../../' + folder) : ('../' + folder));
}

export function nameArray(array) {
	let namesArray: string[] = [];

	for (let i in array)
		namesArray.push(array[i].name)
	return namesArray;
}

export function levenshteinDistanceCmp(node, baseItem) {
	return new Levenshtein(node, baseItem).distance;
}
