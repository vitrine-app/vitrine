import * as path from 'path';
import * as Registry from 'winreg';
import * as glob from 'glob';

import { PotentialGamesCrawler } from './PotentialGamesCrawler';
import { GameSource, PotentialGame } from '../../models/PotentialGame';
import { PlayableGame } from '../../models/PlayableGame';
import { GamesCollection } from '../../models/GamesCollection';
import { searchIgdbGame } from '../api/IgdbWrapper';
import { spatStr } from '../helpers';
import { logger } from '../Logger';

class OriginGamesCrawler extends PotentialGamesCrawler {
	private regDetails: any[];
	private gamesFolder: string;

	public setPlayableGames(playableGames?: PlayableGame[]): this {
		super.setPlayableGames(playableGames);
		this.regDetails = [];
		return this;
	}

	public search(moduleConfig: any, callback: (error: Error, potentialGames: GamesCollection<PotentialGame>) => void) {
		super.search(moduleConfig, callback);

		this.gamesFolder = path.resolve(this.moduleConfig.installFolder);
		let regKey = new Registry({
			hive: Registry[this.moduleConfig.regHive],
			key: this.moduleConfig.regKey
		});
		logger.info('OriginGamesCrawler', `Parsing registry key ${this.moduleConfig.regKey}.`);
		regKey.keys(this.parseRegistry.bind(this));
	}

	private parseRegistry(error: Error, items: Winreg.Registry[]) {
		if (error)
			this.callback(error, null);

		let counter: number = 0;
		items.forEach((key: Winreg.Registry) => {
			key.values((error: Error, values: Winreg.RegistryItem[]) => {
				if (error)
					this.callback(error, null);

				logger.info('OriginGamesCrawler', `Installed game found in registry (${values[5].value}).`);
				this.regDetails.push({
					path: values[1].value,
					exe: values[5].value
				});
				counter++;
				if (counter === items.length) {
					logger.info('OriginGamesCrawler', `Looking for games folders in (${this.gamesFolder}).`);
					glob(`${this.gamesFolder}/*`, this.parseFolder.bind(this));
				}
			});
		});
	}

	private parseFolder(error: Error, files: string[]) {
		if (error)
			this.callback(error, null);
		if (!files.length) {
			logger.info('OriginGamesCrawler', 'Not Origin games found in this directory.');
			let potentialGames: GamesCollection<PotentialGame> = new GamesCollection();
			this.callback(null, potentialGames);
			return;
		}
		const gameInfos: any[] = files.map((gameFolder: string) => ({
			gameName: gameFolder.split('/').pop(),
			gameFolder
		})).filter(({gameName}: any) => {
			const found: boolean = this.playableGames.filter((playableGame: any) =>
				spatStr(gameName) === spatStr(playableGame.name)
			).length > 0;

			if (this.gameDirExists(gameName) || found) {
				logger.info('OriginGamesCrawler', `Origin game ${gameName} is already a playable game.`);
				return false;
			}
			return true;
		});

		let counter: number = 0;
		gameInfos.forEach(({gameName, gameFolder}: any) => {
			this.getRegExe(gameFolder, (error: Error, gamePath: string) => {
				if (error)
					this.callback(error, null);
				searchIgdbGame(gameName, 1).then((game: any) => {
					game = game[0];
					delete game.name;
					let potentialGame: PotentialGame = new PotentialGame(gameName, game);
					potentialGame.source = GameSource.ORIGIN;
					potentialGame.commandLine = [ path.resolve(gamePath) ];
					this.potentialGames.push(potentialGame);
					logger.info('OriginGamesCrawler', `Adding ${gameName} to potential Origin games.`);
					counter++;
					if (counter === gameInfos.length)
						this.sendResults();
				}).catch((error: Error) => {
					this.callback(error, null);
				});
			});
		});
	}

	private getRegExe(gamePath: string, callback: (error: Error, gamePath: string) => void) {
		let found: boolean = false;
		this.regDetails.forEach((regDetail: any) => {
			if (path.resolve(gamePath) === path.resolve(regDetail.path)) {
				logger.info('OriginGamesCrawler', `Origin game found (${gamePath}).`);
				callback(null, regDetail.exe);
				found = true;
			}
		}, () => {
			if (!found)
				callback(new Error('Registry not matching.'), null);
		});
	}
}

let originGamesCrawler: OriginGamesCrawler = new OriginGamesCrawler();

export function searchOriginGames(originConfig: any, playableGames?: PlayableGame[]): Promise<any> {
	return new Promise((resolve, reject) => {
		originGamesCrawler.setPlayableGames(playableGames)
			.search(originConfig, (error: Error, potentialGames: GamesCollection<PotentialGame>) => {
				if (error)
					reject(error);
				else
					resolve(potentialGames);
			});
	});
}
