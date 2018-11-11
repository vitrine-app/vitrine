import * as crypto from 'crypto';
import * as path from 'path';
import * as uuid from 'uuid/v5';

export function isProduction(): boolean {
  return process.env.ELECTRON_ENV !== 'dev';
}

export function isTesting(): boolean {
  return process.env.TESTING === 'true';
}

export function getAppDataFolder() {
  return (process.platform === 'win32') ? `${process.env.APPDATA}/vitrine` : `${process.env.HOME}/.local/share/vitrine`;
}

export function getEnvFolder(folder: string, nonProd?: boolean): string {
  if (isTesting() && !isProduction())
    return path.resolve(folder);
  const appDataPath: string = path.resolve(getAppDataFolder(), 'data', folder);
  const computedPath: string = isProduction() ?
    ((folder === 'games' || folder === 'config') && !nonProd ? appDataPath : `../../${folder}`) : `../${folder}`;
  return path.resolve(__dirname, computedPath);
}

export function uuidV5(name: string): string {
  const dnsNamespace: string = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  return uuid(name, dnsNamespace);
}

export function randomHashedString(length?: number): string {
  const finalLength: number = length || 8;
  return crypto.randomBytes(Math.ceil(finalLength / 2)).toString('hex').slice(0, finalLength);
}
