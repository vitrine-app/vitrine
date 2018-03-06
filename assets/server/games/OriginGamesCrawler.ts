import * as path from 'path';
import * as Registry from 'winreg';
import * as glob from 'glob';

import { PotentialGamesCrawler } from './PotentialGamesCrawler';
import { GameSource, PotentialGame } from '../../models/PotentialGame';
import { PlayableGame } from '../../models/PlayableGame';
import { GamesCollection } from '../../models/GamesCollection';
import { searchIgdbGame } from '../api/IgdbWrapper';
import { spatStr } from '../helpers';

class OriginGamesCrawler extends PotentialGamesCrawler {
	private regDetails: any[];
	private gamesFolder: string;

	public setPlayableGames(playableGames?: PlayableGame[]): this {
		super.setPlayableGames([]);
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

				this.regDetails.push({
					path: values[1].value,
					exe: values[5].value
				});
				counter++;
				if (counter === items.length)
					glob(`${this.gamesFolder}/*`, this.parseFolder.bind(this));
			});
		});
	}

	private parseFolder(error: Error, files: string[]) {
		if (error)
			this.callback(error, null);
		if (!files.length) {
			let potentialGames: GamesCollection<PotentialGame> = new GamesCollection();
			this.callback(null, potentialGames);
			return;
		}
		let counter: number = 0;
		files.forEach((gameFolder: string) => {
			let gameName: string = gameFolder.split('/').pop();

			if (this.isGameAlreadyAdded(gameName)) {
				counter++;
				if (counter === files.length)
					this.sendResults();
				return;
			}
			for (let playableGame of this.playableGames) {
				if (spatStr(gameName) === spatStr(playableGame.name)) {
					counter++;
					if (counter === files.length)
						this.sendResults();
					return;
				}
			}

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
					counter++;
					if (counter === files.length)
						this.sendResults();
				}).catch((error: Error) => {
					this.callback(error, null);
				});
			});
		});
	}

	private getRegExe(gamePath: string, callback: (error: Error, gamePath: string) => void) {
		let counter: number = 0;
		let found: boolean = false;
		this.regDetails.forEach((regDetail: any) => {
			if (path.resolve(gamePath) === path.resolve(regDetail.path)) {
				callback(null, regDetail.exe);
				found = true;
			}
			counter++;
			if (!found && counter === this.regDetails.length)
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
