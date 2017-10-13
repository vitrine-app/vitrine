import * as path from 'path';

import { AcfParser } from './AcfParser';

class SteamUserFinder {
	private loginUsersFilePath: string;
	private loginUsersFile: any;

	public constructor(private steamConfig: any) {
		this.loginUsersFilePath = path.resolve(this.steamConfig.installFolder, 'config', 'loginusers.vdf');
		this.loginUsersFile = new AcfParser(this.loginUsersFilePath).toObject().users;
	}

	public getActiveUser(callback: Function) {
		let usersArray: any[] = Object.keys(this.loginUsersFile);
		let counter: number = 0;
		let found: boolean = false;

		usersArray.forEach((userKey: string) => {
			let currentUser: any = this.loginUsersFile[userKey];
			if (currentUser.mostrecent == 1) {
				found = true;
				callback(null, {
					userName: currentUser.PersonaName,
					userId: userKey
				});
			}
			if (counter === usersArray.length && !found)
				callback(new Error('Steam last user has not been found. Please connect to Steam.'), null);
		});
	}
}

export function getSteamUserFinder(steamConfig: any): Promise<any> {
	return new Promise((resolve, reject) => {
		new SteamUserFinder(steamConfig).getActiveUser((error: Error, user: any) => {
			if (error)
				reject(error);
			else
				resolve(user);
		})
	});
}
