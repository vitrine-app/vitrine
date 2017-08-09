import * as path from 'path';
import * as fs from 'fs';
import * as glob from 'glob';

import { AcfParser } from '../api/AcfParser';
import { PotentialGame } from '../../models/PotentialGame';
import { GamesCollection } from '../../models/GamesCollection';
import { getIgdbWrapper } from '../api/IgdbWrapper';
import { getEnvFolder, uuidV5 } from '../helpers';

class SteamGamesCrawler {
	private configFilePath: string;
	private configFile: any;
	private manifestRegEx: string;
	private potentialGames: PotentialGame[];
	private callback: Function;

	constructor() {
		this.configFilePath = path.resolve(getEnvFolder('config'), 'steam.json');
		this.configFile = JSON.parse(fs.readFileSync(this.configFilePath).toString());
		this.manifestRegEx = 'appmanifest_*.acf';
		this.potentialGames = [];
	}

	public search(callback): void {
		this.callback = callback;
		this.configFile.gamesFolders.forEach((folder) => {
			let gameFolder: string = '';

			if (folder.startsWith('~')) {
				gameFolder = path.resolve(this.configFile.installFolder, folder.substr(1), this.manifestRegEx);
			}
			else
				gameFolder = path.resolve(folder, this.manifestRegEx);
			glob(gameFolder, this.processGames.bind(this));
		});
	}

	private processGames(error, files) {
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

			if (SteamGamesCrawler.isGameAlreadyAdded(gameManifest.name)) {
				counter++;
				return;
			}
			getIgdbWrapper(gameManifest.name).then((game: any) => {
				delete game.name;
				let potentialGame: PotentialGame = new PotentialGame(gameManifest.name, game);
				potentialGame.commandLine = [
					path.resolve(this.configFile.installFolder, 'steam.exe'),
					this.configFile.launchCommand.replace('%id', gameManifest.appid)
				];
				potentialGame.details.steamId = parseInt(gameManifest.appid);
				this.potentialGames.push(potentialGame);
				counter++;
				if (counter === array.length) {
					let potentialGames: GamesCollection<PotentialGame> = new GamesCollection();
					potentialGames.games = this.potentialGames;
					this.callback(null, potentialGames);
				}
			}).catch((error) => {
				if (error)
					this.callback(error, null);
			});
		});
	}

	private static isGameAlreadyAdded(name: string) {
		let gameId: string = uuidV5(name);

		let gameDirectory = path.resolve(getEnvFolder('games'), gameId);
		let configFilePath = path.resolve(gameDirectory, 'config.json');

		return fs.existsSync(configFilePath);

	}
}

export function getSteamCrawler() {
	return new Promise((resolve, reject) => {
		new SteamGamesCrawler().search((error, potentialGames: PotentialGame[]) => {
			if (error)
				reject(error);
			else
				resolve(potentialGames);
		});
	});
}
