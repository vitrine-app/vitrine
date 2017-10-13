import * as SteamWeb from 'steam-web';
import { PlayableGame } from '../../models/PlayableGame';

class SteamPlayTimeWrapper {
	private apiKey: string;
	private client: SteamWeb;

	public constructor(private steamConfig: any) {
		this.apiKey = '27853E803FB3CEFE82DBACEF152A905A';
		this.client = new SteamWeb({
			apiKey: this.apiKey,
			format: 'json'
		});
	}

	public getOwnedGames(game: PlayableGame, callback: Function) {
		this.client.getOwnedGames({
			steamid: this.steamConfig.userId,
			callback: (error: Error, data: any) => {
				if (error)
					callback(error, null);
				else
					this.handleGames(game, data.response.games, callback);
			}
		});
	}

	private handleGames(game: PlayableGame, timedGames: any[], callback: Function) {
		let found: boolean = false;
		let counter: number = 0;

		timedGames.forEach((timedGame: any) => {
			if (game.details.steamId == timedGame.appid) {
				found = true;
				game.timePlayed = timedGame.playtime_forever * 60;
				callback(null, game);
			}
			counter++;
			if (counter === timedGame.length && !found)
				callback(new Error('Your Steam games files are corrupted. Please reinstall your game'), null);
		});
	}
}

export function getSteamPlayTimeWrapper(steamConfig: any, game: PlayableGame): Promise<any> {
	return new Promise((resolve, reject) => {
		new SteamPlayTimeWrapper(steamConfig).getOwnedGames(game, (error: Error, timedGame: PlayableGame) => {
			if (error)
				reject(error);
			else
				resolve(timedGame);
		});
	});
}
