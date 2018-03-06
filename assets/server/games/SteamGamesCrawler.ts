import * as path from 'path';
import * as glob from 'glob';

import { PotentialGamesCrawler } from './PotentialGamesCrawler';
import { AcfParser } from '../api/AcfParser';
import { searchIgdbGame } from '../api/IgdbWrapper';
import { GameSource, PotentialGame } from '../../models/PotentialGame';
import { PlayableGame } from '../../models/PlayableGame';
import { GamesCollection } from '../../models/GamesCollection';

class SteamGamesCrawler extends PotentialGamesCrawler {
	private manifestRegEx: string;

	public setPlayableGames(playableGames?: PlayableGame[]): this {
		super.setPlayableGames(playableGames);
		this.manifestRegEx = 'appmanifest_*.acf';
		return this;
	}

	public search(moduleConfig: any, callback: (error: Error, potentialGames: GamesCollection<PotentialGame>) => void) {
		super.search(moduleConfig, callback);
		this.moduleConfig.gamesFolders.forEach((folder) => {
			let gameFolder: string = '';

			if (folder.startsWith('~')) {
				gameFolder = path.resolve(this.moduleConfig.installFolder, folder.substr(1), this.manifestRegEx);
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
			this.callback(null, new GamesCollection());
			return;
		}
		let counter: number = 0;
		files.forEach((appManifest, index, array) => {
			let gameManifest: any = new AcfParser(appManifest).toObject().AppState;

			if (this.isGameAlreadyAdded(gameManifest.name)) {
				counter++;
				if (counter === array.length)
					this.sendResults();
				return;
			}
			for (let playableGame of this.playableGames) {
				if (gameManifest.appid == playableGame.details.steamId) {
					counter++;
					if (counter === array.length)
						this.sendResults();
					return;
				}
			}
			searchIgdbGame(gameManifest.name, 1).then((game: any) => {
				game = game[0];
				delete game.name;
				let potentialGame: PotentialGame = new PotentialGame(gameManifest.name, game);
				potentialGame.source = GameSource.STEAM;
				potentialGame.commandLine = [
					path.resolve(this.moduleConfig.installFolder, 'steam.exe'),
					this.moduleConfig.launchCommand.replace('%id', gameManifest.appid)
				];
				potentialGame.details.steamId = parseInt(gameManifest.appid);
				this.potentialGames.push(potentialGame);
				counter++;
				if (counter === array.length)
					this.sendResults();
			}).catch((error: Error) => {
				this.callback(error, null);
			});
		});
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
