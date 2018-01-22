import * as SteamWeb from 'steam-web';

import { PlayableGame } from '../../models/PlayableGame';

class SteamPlayTimeWrapper {
	private apiKey: string;
	private client: SteamWeb;

	public constructor() {
		this.apiKey = '27853E803FB3CEFE82DBACEF152A905A';
		this.client = new SteamWeb({
			apiKey: this.apiKey,
			format: 'json'
		});
	}

	public getOwnedGames(steamConfig: any, steamId: number, callback: Function) {
		this.client.getOwnedGames({
			steamid: steamConfig.userId,
			callback: (error: Error, data: any) => {
				if (error)
					callback(error, null);
				else
					this.handleGames(steamId, data.response.games, callback);
			}
		});
	}

	private handleGames(steamId: number, timedGames: any[], callback: Function) {
		let found: boolean = false;
		let counter: number = 0;

		timedGames.forEach((timedGame: any) => {
			if (steamId == timedGame.appid) {
				found = true;
				callback(null, timedGame.playtime_forever * 60);
			}
			counter++;
			if (counter === timedGame.length && !found)
				callback(new Error('Your Steam games files are corrupted. Please reinstall your game'), null);
		});
	}
}

let steamPlayTimeWrapper: SteamPlayTimeWrapper = new SteamPlayTimeWrapper();

export function getGamePlayTime(steamConfig: any, steamId: number): Promise<any> {
	return new Promise((resolve, reject) => {
		steamPlayTimeWrapper.getOwnedGames(steamConfig, steamId, (error: Error, timePlayed: number) => {
			if (error)
				reject(error);
			else
				resolve(timePlayed);
		});
	});
}
