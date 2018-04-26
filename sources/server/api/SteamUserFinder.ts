import * as path from 'path';

import { logger } from '../Logger';
import { AcfParser } from './AcfParser';

class SteamUserFinder {
	private steamConfig: any;
	private loginUsersFilePath: string;
	private loginUsersFile: any;

	public setSteamConfig(steamConfig: any): this {
		this.steamConfig = steamConfig;
		this.loginUsersFilePath = path.resolve(this.steamConfig.installFolder, 'config', 'loginusers.vdf');
		this.loginUsersFile = new AcfParser(this.loginUsersFilePath).toObject().users;
		logger.info('SteamUserFinder', `Steam users file parsed (${this.loginUsersFilePath}).`);
		return this;
	}

	public getActiveUser(callback: (error: Error, user: any) => void) {
		const usersArray: any[] = Object.keys(this.loginUsersFile);
		let found: boolean = false;
		usersArray.forEachEnd((userKey: string, done: () => void) => {
			const currentUser: any = this.loginUsersFile[userKey];
			if (parseInt(currentUser.mostrecent) === 1) {
				found = true;
				logger.info('SteamUserFinder', `Steam user ${currentUser.PersonaName} (${userKey}) found.`);
				callback(null, {
					userName: currentUser.PersonaName,
					userId: userKey
				});
			}
			done();
		}, () => {
			if (!found)
				callback(new Error('Steam last user has not been found. Please connect to Steam.'), null);
		});
	}
}

const steamUserFinder: SteamUserFinder = new SteamUserFinder();

export function findSteamUser(steamConfig: any): Promise<any> {
	return new Promise((resolve, reject) => {
		steamUserFinder.setSteamConfig(steamConfig).getActiveUser((error: Error, user: any) => {
			if (error)
				reject(error);
			else
				resolve(user);
		});
	});
}
