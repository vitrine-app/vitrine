import * as path from 'path';
import * as glob from 'glob';

import { PotentialGamesCrawler } from './PotentialGamesCrawler';
import { AcfParser } from '../api/AcfParser';
import { searchIgdbGame } from '../api/IgdbWrapper';
import { GameSource, PotentialGame } from '../../models/PotentialGame';
import { PlayableGame } from '../../models/PlayableGame';
import { GamesCollection } from '../../models/GamesCollection';
import { logger } from '../Logger';

class SteamGamesCrawler extends PotentialGamesCrawler {
	private manifestRegEx: string;

	public setPlayableGames(playableGames?: PlayableGame[]): this {
		super.setPlayableGames(playableGames);
		this.manifestRegEx = 'appmanifest_*.acf';
		return this;
	}

	public search(moduleConfig: any, callback: (error: Error, potentialGames: GamesCollection<PotentialGame>) => void) {
		super.search(moduleConfig, callback);

		this.moduleConfig.gamesFolders.forEach((folder: string) => {
			let gameFolder: string = '';

			if (folder.startsWith('~'))
				gameFolder = path.resolve(this.moduleConfig.installFolder, folder.substr(1), this.manifestRegEx);
			else
				gameFolder = path.resolve(folder, this.manifestRegEx);
			logger.info('SteamGamesCrawler', `Looking for Steam games manifests in ${gameFolder}.`);
			glob(gameFolder, this.processGames.bind(this));
		});
	}

	private processGames(error: Error, files: string[]) {
		if (error) {
			this.callback(error, null);
			return;
		}
		if (!files.length) {
			logger.info('SteamGamesCrawler', `No Steam games found in this directory.`);
			this.callback(null, new GamesCollection());
			return;
		}
		let gameManifests: any[] = files.map((appManifest: any) => new AcfParser(appManifest).toObject().AppState)
			.filter((appManifest: any) => {
				const found: boolean = this.playableGames.filter((playableGame: any) =>
					appManifest.appid === playableGame.details.steamId
				).length > 0;

				if (this.gameDirExists(appManifest.name) || found) {
					logger.info('SteamGamesCrawler', `Steam game ${appManifest.name} is already a playable game.`);
					return false;
				}
				return true;
			});

		let counter: number = 0;
		gameManifests.forEach((gameManifest: any) => {
			logger.info('SteamGamesCrawler', `Steam game ${gameManifest.name} (Steam ID ${gameManifest.appid}) found.`);
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
				logger.info('SteamGamesCrawler', `Adding ${gameManifest.name} to potential Steam games.`);
				counter++;
				if (counter === gameManifests.length)
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
