import * as path from 'path';
import * as fs from 'fs';
import * as glob from 'glob';

import { uuidV5 } from '../helpers';
import { AcfParser } from '../api/AcfParser';
import { PotentialGame } from '../../models/PotentialGame';
import { IgdbWrapper } from '../api/IgdbWrapper';
import { GamesCollection } from '../../models/GamesCollection';

class SteamGamesCrawler {
	private configFilePath: string;
	private configFile: any;
	private manifestRegEx: string;
	private potentialGames: PotentialGame[];
	private callback: Function;

	constructor() {
		this.configFilePath = path.join('config/steam.json');
		this.configFile = JSON.parse(fs.readFileSync(this.configFilePath).toString());
		this.manifestRegEx = 'appmanifest_*.acf';
		this.potentialGames = [];
	}

	public search(callback): void {
		this.callback = callback;
		this.configFile.gamesFolders.forEach((folder) => {
			let gameFolder: string = '';

			if (folder.startsWith('~')) {
				gameFolder = path.join(this.configFile.installFolder, folder.substr(1), this.manifestRegEx);
			}
			else
				gameFolder = path.join(folder, this.manifestRegEx);
			glob(gameFolder, this.processGames.bind(this));
		});
	}

	private processGames(error, files): void {
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

			let igdbWrapper: IgdbWrapper = new IgdbWrapper();
			igdbWrapper.getGame(gameManifest.name, (error, game) => {
				if (error)
					return;
				delete game.name;
				let potentialGame: PotentialGame = new PotentialGame(gameManifest.name, game);
				let commandArgs: string[] = this.configFile.launchCommand.split(' ');
				potentialGame.commandLine = [
					path.join(this.configFile.installFolder, 'steam.exe'),
					commandArgs[0],
					commandArgs[1].replace('%id', gameManifest.appid)
				];
				potentialGame.uuid = uuidV5(potentialGame.name);
				this.potentialGames.push(potentialGame);

				counter++;
				if (counter === array.length) {
					let potentialGames: GamesCollection<PotentialGame> = new GamesCollection();
					potentialGames.games = this.potentialGames;
					this.callback(null, potentialGames);
					delete this.callback;
				}
			});
		});
	}

	private static isGameAlreadyAdded(name: string) {
		let gameId: string = uuidV5(name);

		let gameDirectory = path.join(__dirname, 'games', gameId);
		let configFilePath = path.join(gameDirectory, 'config.json');

		return fs.existsSync(configFilePath);

	}
}

export function getSteamCrawlerPromise() {
	return new Promise((resolve, reject) => {
		new SteamGamesCrawler().search((error, potentialGames: PotentialGame[]) => {
			if (error)
				reject(error);
			else
				resolve(potentialGames);
		});
	});
}
