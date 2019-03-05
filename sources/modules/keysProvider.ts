/* tslint:disable:no-var-requires */
const keysProvider = require('../../modules/keysProvider');

export function steamKey(): string {
  return keysProvider.steamKey();
}

export function discordRpcKey(): string {
  return keysProvider.discordRpcKey();
}

export function vitrineSecretKey(): string {
  return keysProvider.vitrineSecretKey();
}

export function igdbKey(): string {
  return keysProvider.igdbKey();
}
