import * as glob from 'glob';
import * as path from 'path';
import * as Registry from 'winreg';

import { GamesCollection } from '../../models/GamesCollection';
import { PlayableGame } from '../../models/PlayableGame';
import { GameSource, PotentialGame } from '../../models/PotentialGame';
import { searchIgdbGame } from '../api/IgdbWrapper';
import { spatStr } from '../helpers';
import { logger } from '../Logger';
import { PotentialGamesCrawler } from './PotentialGamesCrawler';

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
		const regKey = new Registry({
			hive: Registry[this.moduleConfig.regHive],
			key: this.moduleConfig.regKey
		});
		logger.info('OriginGamesCrawler', `Parsing registry key ${this.moduleConfig.regKey}.`);
		regKey.keys(this.parseRegistry.bind(this));
	}

	private parseRegistry(error: Error, items: Winreg.Registry[]) {
		if (error)
			this.callback(error, null);

		items.forEachEnd((key: Winreg.Registry, done: () => void) => {
			key.values((error: Error, values: Winreg.RegistryItem[]) => {
				if (error)
					this.callback(error, null);

				logger.info('OriginGamesCrawler', `Installed game found in registry (${values[5].value}).`);
				this.regDetails.push({
					path: values[1].value,
					exe: values[5].value
				});
				done();
			});
		}, () => {
			logger.info('OriginGamesCrawler', `Looking for games folders in (${this.gamesFolder}).`);
			glob(`${this.gamesFolder}/*`, this.parseFolder.bind(this));
		});
	}

	private parseFolder(error: Error, files: string[]) {
		if (error)
			this.callback(error, null);
		if (!files.length) {
			logger.info('OriginGamesCrawler', 'Not Origin games found in this directory.');
			const potentialGames: GamesCollection<PotentialGame> = new GamesCollection();
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
			if (found)
				logger.info('OriginGamesCrawler', `Origin game ${gameName} is already a playable game.`);
			return !found;
		});

		gameInfos.forEachEnd(async ({gameName, gameFolder}: any, done: () => void) => {
			try {
				const [ gamePath, [ game ] ]: any = await Promise.all([
					this.getRegGamePath(gameFolder),
					await searchIgdbGame(gameName, 1)
				]);
				delete game.name;
				const potentialGame: PotentialGame = new PotentialGame(gameName, game);
				potentialGame.source = GameSource.ORIGIN;
				potentialGame.commandLine = [ path.resolve(gamePath) ];
				this.potentialGames.push(potentialGame);
				logger.info('OriginGamesCrawler', `Adding ${gameName} to potential Origin games.`);
				done();
			}
			catch (error) {
				this.callback(error, null);
			}
		}, () => {
			this.sendResults();
		});
	}

	private getRegGamePath(gamePath: string): Promise<any> {
		return new Promise((resolve, reject) => {
			let found: boolean = false;
			this.regDetails.forEachEnd((regDetail: any, done: () => void) => {
				if (path.resolve(gamePath) === path.resolve(regDetail.path)) {
					logger.info('OriginGamesCrawler', `Origin game found (${gamePath}).`);
					resolve(regDetail.exe);
					found = true;
				}
				done();
			}, () => {
				if (!found)
					reject(new Error('Registry not matching.'));
			});
		});
	}
}

const originGamesCrawler: OriginGamesCrawler = new OriginGamesCrawler();

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
