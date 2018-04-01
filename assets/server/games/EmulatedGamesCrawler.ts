import * as path from 'path';
import * as glob from 'glob';

import { PotentialGamesCrawler } from './PotentialGamesCrawler';
import { GameSource, PotentialGame } from '../../models/PotentialGame';
import { PlayableGame } from '../../models/PlayableGame';
import { GamesCollection } from '../../models/GamesCollection';
import { searchIgdbGame } from '../api/IgdbWrapper';
import { spatStr } from '../helpers';
import { logger } from '../Logger';

class EmulatedGamesCrawler extends PotentialGamesCrawler {
	private romsFolders: any[];

	public setPlayableGames(playableGames?: PlayableGame[]): this {
		super.setPlayableGames(playableGames);
		this.romsFolders = [];
		return this;
	}

	public search(moduleConfig: any, callback: (error: Error, potentialGames: GamesCollection<PotentialGame>) => void) {
		super.search(moduleConfig, callback);
		logger.info('EmulatedGamesCrawler',`Searching roms folders in ${this.moduleConfig.romsFolder}.`);
		glob(`${this.moduleConfig.romsFolder}/*`, (error: Error, folders: string[]) => {
			if (error)
				return this.callback(error, null);
			let counter: number = 0;
			folders.forEach((romFolder: string) => {
				this.moduleConfig.platforms.forEach((platform: any) => {
					if (platform.folder.toUpperCase() === path.basename(romFolder).toUpperCase()) {
						let romEmulator: any = this.moduleConfig.emulators.filter((emulator: any) => emulator.platforms
							.filter((platformId: number) => platformId === platform.id).length)[0];
						if (romEmulator.active) {
							logger.info('EmulatedGamesCrawler',`Roms folder ${romFolder} found and binded to ${romEmulator.name}.`);
							this.romsFolders.push({
								romFolder,
								romEmulator
							});
						}
					}
				}, () => {
					counter++;
					if (counter === folders.length)
						this.analyzeFolders();
				});
			});
		});
	}

	private analyzeFolders() {
		let counter: number = 0;
		this.romsFolders.forEach(({romFolder, romEmulator}) => {
			logger.info('EmulatedGamesCrawler',`Parsing roms in ${romFolder} with ${romEmulator.name} pattern (${romEmulator.glob}).`);
			glob(`${romFolder}/${romEmulator.glob}`, (error: Error, roms: string[]) => {
				if (error) {
					this.callback(error, null);
					return;
				}
				const romInfos: any[] = roms.map((romPath: string) => {
					const parsedPath: string[] = romPath.split('/');
					const romName: string = parsedPath[parsedPath.length - romEmulator.glob.split('/').length]
						.replace(/(\w+)\.(\w+)/g, '$1');
					return {
						romName,
						romPath
					};
				}).filter(({romName}: any) => {
					const found: boolean = this.playableGames.filter((playableGame: any) =>
						spatStr(romName) === spatStr(playableGame.name)
					).length > 0;
					return !found;
				});

				let secondCounter: number = 0;
				romInfos.forEach(({romName, romPath}: any) => {
					searchIgdbGame(romName, 1).then((game: any) => {
						game = game[0];
						delete game.name;
						let potentialGame: PotentialGame = new PotentialGame(romName, game);
						potentialGame.source = GameSource.ROM;
						potentialGame.commandLine = [
							romEmulator.path,
							romEmulator.command.replace('%g', romPath)
						];
						this.potentialGames.push(potentialGame);
						logger.info('EmulatedGamesCrawler', `Adding ${romName} to potential emulated games.`);
						secondCounter++;
						if (secondCounter === romInfos.length) {
							counter++;
							if (counter === this.romsFolders.length)
								this.sendResults();
						}
					}).catch((error: Error) => {
						this.callback(error, null);
					});
				});
			});
		});
	}
}

let emulatedGamesCrawler: EmulatedGamesCrawler = new EmulatedGamesCrawler();

export function searchEmulatedGames(emulatedConfig: any, playableGames?: PlayableGame[]): Promise<any> {
	return new Promise((resolve, reject) => {
		emulatedGamesCrawler.setPlayableGames(playableGames)
			.search(emulatedConfig, (error: Error, potentialGames: GamesCollection<PotentialGame>) => {
				if (error)
					reject(error);
				else
					resolve(potentialGames);
			});
	});
}
