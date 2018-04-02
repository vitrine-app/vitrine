import * as SteamWeb from 'steam-web';

import { logger } from '../Logger';

class SteamPlayTimeWrapper {
	private readonly apiKey: string;
	private client: SteamWeb;

	public constructor() {
		this.apiKey = '27853E803FB3CEFE82DBACEF152A905A';
		this.client = new SteamWeb({
			apiKey: this.apiKey,
			format: 'json'
		});
	}

	public getOwnedGames(steamUserId: number, steamId: number, callback: (error: Error, timePlayed: number) => void) {
		logger.info('SteamPlayTimeWrapper', `Looking for played time for Steam game ${steamId}.`);
		this.client.getOwnedGames({
			steamid: steamUserId,
			callback: (error: Error, data: any) => {
				if (error)
					callback(error, null);
				else
					this.handleGames(steamId, data.response.games, callback);
			}
		});
	}

	private handleGames(steamId: number, timedGames: any[], callback: (error: Error, timePlayed: number) => void) {
		let found: boolean = false;
		timedGames.forEachEnd((timedGame: any, done: () => void) => {
			if (steamId === timedGame.appid) {
				logger.info('SteamPlayTimeWrapper', `Played time for ${steamId} found (${timedGame.playtime_forever} mins).`);
				found = true;
				callback(null, timedGame.playtime_forever * 60);
			}
			done();
		}, () => {
			if (!found)
				callback(new Error('Your Steam games files are corrupted. Please reinstall your game'), null);
		});
	}
}

const steamPlayTimeWrapper: SteamPlayTimeWrapper = new SteamPlayTimeWrapper();

export function getGamePlayTime(steamUserId: number, steamId: number): Promise<any> {
	return new Promise((resolve, reject) => {
		steamPlayTimeWrapper.getOwnedGames(steamUserId, steamId, (error: Error, timePlayed: number) => {
			if (error)
				reject(error);
			else
				resolve(timePlayed);
		});
	});
}
