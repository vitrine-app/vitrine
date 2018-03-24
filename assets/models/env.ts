import * as path from 'path';
import * as fs from 'fs-extra';
import * as uuid from 'uuid/v5';
import * as crypto from 'crypto';

export function isProd(): boolean {
	return process.env.NODE_ENV === 'production';
}

export function getEnvFolder(folder: string, nonProd?: boolean): string {
	let appDataPath: string = path.resolve(process.env.APPDATA, 'vitrine', 'data', folder);
	let computedPath: string = (isProd()) ? (((folder === 'games' || folder === 'config') && !nonProd) ? (appDataPath) : (`../../${folder}`)) : (`../${folder}`);
	return path.resolve(__dirname, computedPath);
}

export function uuidV5(name: string): string {
	let dnsNamespace: string = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
	return uuid(name, dnsNamespace);
}

export function randomHashedString(length?: number): string {
	const finalLength: number = length || 8;
	return crypto.randomBytes(Math.ceil(finalLength / 2)).toString('hex').slice(0, finalLength);
}
