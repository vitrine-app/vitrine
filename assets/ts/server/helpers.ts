import * as https from 'https';
import * as fs from 'fs';
import * as uuid from 'uuid/v5';

export function uuidV5(name: string) {
	let dnsNamespace: string = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

	return uuid(name, dnsNamespace);
}

export function downloadFile(url, path, callback) {
	let file = fs.createWriteStream(path);

	https.get(url, (response) => {
		response.pipe(file);
		callback();
	});
}
