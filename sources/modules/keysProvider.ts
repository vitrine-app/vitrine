const isOnCi = process.env.APPVEYOR_REPO_BRANCH || process.env.TRAVIS_BRANCH;

/* tslint:disable:no-var-requires */
const keysProvider = isOnCi ? null : require('../../modules/keysProvider');


export function steamKey(): string {
  return isOnCi ? process.env.STEAM_KEY : keysProvider.steamKey();
}

export function discordRpcKey(): string {
  return isOnCi ? process.env.DISCORD_RPC_KEY : keysProvider.discordRpcKey();
}

export function igdbKey(): string {
  return isOnCi ? process.env.IGDB_KEY : keysProvider.igdbKey();
}
