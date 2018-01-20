import * as path from 'path';
import * as fs from 'fs-extra';
import * as glob from 'glob';

import { AcfParser } from '../api/AcfParser';
import { GameSource, PotentialGame } from '../../models/PotentialGame';
import { PlayableGame } from '../../models/PlayableGame';
import { GamesCollection } from '../../models/GamesCollection';
import { getEnvFolder, uuidV5 } from '../../models/env';
import { searchIgdbGame } from '../api/IgdbWrapper';

class SteamGamesCrawler {
	private steamConfig: any;
	private manifestRegEx: string;
	private potentialGames: PotentialGame[];
	private playableGames: PlayableGame[];
	private callback: Function;

	public setPlayableGames(playableGames?: PlayableGame[]): this {
		this.manifestRegEx = 'appmanifest_*.acf';
		this.potentialGames = [];
		this.playableGames = playableGames || [];
		return this;
	}

	public search(steamConfig: any, callback: Function) {
		this.steamConfig = steamConfig;
		this.callback = callback;
		this.steamConfig.gamesFolders.forEach((folder) => {
			let gameFolder: string = '';

			if (folder.startsWith('~')) {
				gameFolder = path.resolve(this.steamConfig.installFolder, folder.substr(1), this.manifestRegEx);
			}
			else
				gameFolder = path.resolve(folder, this.manifestRegEx);
			glob(gameFolder, this.processGames.bind(this));
		});
	}

	private processGames(error: Error, files: string[]) {
		if (error) {
			this.callback(error, null);
			return;
		}
		if (!files.length) {
			let potentialGames: GamesCollection<PotentialGame> = new GamesCollection();
			this.callback(null, potentialGames);
			return;
		}
		let counter: number = 0;
		files.forEach((appManifest, index, array) => {
			let gameManifest: any = new AcfParser(appManifest).toObject().AppState;

			if (this.isGameAlreadyAdded(gameManifest.name)) {
				counter++;
				if (counter === array.length) {
					let potentialGames: GamesCollection<PotentialGame> = new GamesCollection();
					potentialGames.games = this.potentialGames;
					this.callback(null, potentialGames);
				}
				return;
			}
			for (let playableGame of this.playableGames) {
				if (gameManifest.appid == playableGame.details.steamId) {
					counter++;
					if (counter === array.length) {
						let potentialGames: GamesCollection<PotentialGame> = new GamesCollection();
						potentialGames.games = this.potentialGames;
						this.callback(null, potentialGames);
					}
					return;
				}
			}
			searchIgdbGame(gameManifest.name, 1).then((game: any) => {
				game = game[0];
				delete game.name;
				let potentialGame: PotentialGame = new PotentialGame(gameManifest.name, game);
				potentialGame.source = GameSource.STEAM;
				potentialGame.commandLine = [
					path.resolve(this.steamConfig.installFolder, 'steam.exe'),
					this.steamConfig.launchCommand.replace('%id', gameManifest.appid)
				];
				potentialGame.details.steamId = parseInt(gameManifest.appid);
				this.potentialGames.push(potentialGame);
				counter++;
				if (counter === array.length) {
					let potentialGames: GamesCollection<PotentialGame> = new GamesCollection();
					potentialGames.games = this.potentialGames;
					this.callback(null, potentialGames);
				}
			}).catch((error: Error) => {
				this.callback(error, null);
			});
		});
	}

	private isGameAlreadyAdded(name: string): boolean {
		let gameUuid: string = uuidV5(name);

		let gameDirectory: string = path.resolve(getEnvFolder('games'), gameUuid);
		let configFilePath: string = path.resolve(gameDirectory, 'config.json');

		return fs.existsSync(configFilePath);
	}
}

let steamGamesCrawler: SteamGamesCrawler = new SteamGamesCrawler();

export function searchSteamGames(steamConfig: any, playableGames?: PlayableGame[]): Promise<any> {
	return new Promise((resolve, reject) => {
		steamGamesCrawler.setPlayableGames(playableGames)
			.search(steamConfig, (error: Error, potentialGames: GamesCollection<PotentialGame>) => {
				if (error)
					reject(error);
				else
					resolve(potentialGames);
			});
	});
}
