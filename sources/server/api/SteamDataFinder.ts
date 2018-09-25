import * as path from 'path';

import { logger } from '../Logger';
import { AcfParser } from './AcfParser';

class SteamDataFinder {
	private steamConfig: any;
	private loginUsersFile: any;
	private gamesLocationFile: any;

	public setSteamConfig(steamConfig: any): this {
		this.steamConfig = steamConfig;
		const loginUsersFilePath: string = path.resolve(this.steamConfig.installFolder, 'config', 'loginusers.vdf');
		this.loginUsersFile = new AcfParser(loginUsersFilePath).toObject().users;
		logger.info('SteamUserFinder', `Steam users file parsed (${loginUsersFilePath}).`);
		const gamesLocationsFilePath: string = path.resolve(this.steamConfig.installFolder, 'config', 'config.vdf');
		this.gamesLocationFile = new AcfParser(gamesLocationsFilePath).toObject().InstallConfigStore.Software.Valve.Steam;
		logger.info('SteamUserFinder', `Steam config file parsed (${gamesLocationsFilePath}).`);
		return this;
	}

	public getActiveUser(callback: (error: Error, user: any) => void) {
		const gamesFolders: string[] = [
			...Object.keys(this.gamesLocationFile).filter((key) => /BaseInstallFolder_[0-9]+/.test(key))
				.map((key) => `${this.gamesLocationFile[key]}/steamapps`),
			path.resolve(this.steamConfig.installFolder, 'steamapps')
		];

		const usersArray: any[] = Object.keys(this.loginUsersFile);
		let found: boolean = false;
		usersArray.forEachEnd((userKey: string, done: () => void) => {
			const currentUser: any = this.loginUsersFile[userKey];
			if (parseInt(currentUser.mostrecent) === 1) {
				found = true;
				logger.info('SteamUserFinder', `Steam user ${currentUser.PersonaName} (${userKey}) found.`);
				callback(null, {
					userName: currentUser.PersonaName,
					userId: userKey,
					gamesFolders
				});
			}
			done();
		}, () => {
			if (!found)
				callback(new Error('Steam last user has not been found. Please connect to Steam.'), null);
		});
	}
}

const steamDataFinder: SteamDataFinder = new SteamDataFinder();

export function findSteamData(steamConfig: any): Promise<any> {
	return new Promise((resolve, reject) => {
		steamDataFinder.setSteamConfig(steamConfig).getActiveUser((error: Error, user: any) => {
			if (error)
				reject(error);
			else
				resolve(user);
		});
	});
}