import * as path from 'path';

import { logger } from '../Logger';
import { AcfParser } from './AcfParser';

export async function findSteamData(steamConfig: any) {
  const loginUsersFilePath: string = path.resolve(steamConfig.installFolder, 'config', 'loginusers.vdf');
  const loginUsersFile: any = new AcfParser(loginUsersFilePath).toObject().users;
  logger.info('SteamUserFinder', `Steam users file parsed (${loginUsersFilePath}).`);
  const gamesLocationsFilePath: string = path.resolve(steamConfig.installFolder, 'config', 'config.vdf');
  const gamesLocationFile: any = new AcfParser(gamesLocationsFilePath).toObject().InstallConfigStore.Software.Valve.Steam;
  logger.info('SteamUserFinder', `Steam config file parsed (${gamesLocationsFilePath}).`);

  const gamesFolders: string[] = [
    ...Object.keys(gamesLocationFile).filter((key) => /BaseInstallFolder_[0-9]+/.test(key))
      .map((key) => `${gamesLocationFile[key]}/steamapps`),
    path.resolve(steamConfig.installFolder, 'steamapps')
  ];

  const potentialUsers: any[] = Object.keys(loginUsersFile)
    .filter((userKey: string) => parseInt(loginUsersFile[userKey].mostrecent) === 1);
  if (!potentialUsers.length)
    throw new Error('Steam last user has not been found. Please connect to Steam.');
  const lastUserKey: any = potentialUsers[0];
  return {
    userName: loginUsersFile[lastUserKey].PersonaName,
    userId: lastUserKey,
    gamesFolders
  };
}
