import * as path from 'path';
import * as fs from 'fs-extra';
import * as glob from 'glob';

import { AcfParser } from '../api/AcfParser';
import { GameSource, PotentialGame } from '../../models/PotentialGame';
import { GamesCollection } from '../../models/GamesCollection';
import { getIgdbWrapperSearcher } from '../api/IgdbWrapper';
import { getEnvFolder, getGamesFolder, uuidV5} from '../helpers';
import { PlayableGame } from '../../models/PlayableGame';

class SteamGamesCrawler {
	private configFilePath: string;
	private configFile: any;
	private manifestRegEx: string;
	private potentialGames: PotentialGame[];
	private playableGames: PlayableGame[];
	private callback: Function;

	public constructor(playableGames?: PlayableGame[]) {
		this.configFilePath = path.resolve(getEnvFolder('config'), 'steam.json');
		this.configFile = JSON.parse(fs.readFileSync(this.configFilePath).toString());
		this.manifestRegEx = 'appmanifest_*.acf';
		this.potentialGames = [];
		this.playableGames = (playableGames) ? (playableGames) : ([]);
	}

	public search(callback: Function): void {
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

			if (SteamGamesCrawler.isGameAlreadyAdded(gameManifest.name)) {
				counter++;
				return;
			}
			for (let playableGame of this.playableGames) {
				if (gameManifest.appid == playableGame.details.steamId) {
					counter++;
					return;
				}
			}
			getIgdbWrapperSearcher(gameManifest.name, 1).then((game: any) => {
				game = game[0];
				delete game.name;
				let potentialGame: PotentialGame = new PotentialGame(gameManifest.name, game);
				potentialGame.source = GameSource.STEAM;
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
				this.callback(error, null);
			});
		});
	}

	private static isGameAlreadyAdded(name: string): boolean {
		let gameId: string = uuidV5(name);

		let gameDirectory = path.resolve(getGamesFolder(), gameId);
		let configFilePath = path.resolve(gameDirectory, 'config.json');

		return fs.existsSync(configFilePath);
	}
}

export function getSteamCrawler(playableGames?: PlayableGame[]): Promise<any> {
	return new Promise((resolve, reject) => {
		new SteamGamesCrawler(playableGames).search((error, potentialGames: PotentialGame[]) => {
			if (error)
				reject(error);
			else
				resolve(potentialGames);
		});
	});
}
