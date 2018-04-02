import * as glob from 'glob';
import * as path from 'path';

import { GamesCollection } from '../../models/GamesCollection';
import { PlayableGame } from '../../models/PlayableGame';
import { GameSource, PotentialGame } from '../../models/PotentialGame';
import { searchIgdbGame } from '../api/IgdbWrapper';
import { spatStr } from '../helpers';
import { logger } from '../Logger';
import { PotentialGamesCrawler } from './PotentialGamesCrawler';

class EmulatedGamesCrawler extends PotentialGamesCrawler {
	private romsFolders: any[];

	public setPlayableGames(playableGames?: PlayableGame[]): this {
		super.setPlayableGames(playableGames);
		this.romsFolders = [];
		return this;
	}

	public search(moduleConfig: any, callback: (error: Error, potentialGames: GamesCollection<PotentialGame>) => void) {
		super.search(moduleConfig, callback);
		logger.info('EmulatedGamesCrawler', `Searching roms folders in ${this.moduleConfig.romsFolder}.`);
		glob(`${this.moduleConfig.romsFolder}/*`, (error: Error, folders: string[]) => {
			if (error)
				return this.callback(error, null);

			folders.forEachEnd((romFolder: string, done: () => void) => {
				this.moduleConfig.platforms.forEachEnd((platform: any, secondDone: () => void) => {
					if (platform.folder.toUpperCase() === path.basename(romFolder).toUpperCase()) {
						const romEmulator: any = this.moduleConfig.emulators.filter((emulator: any) => emulator.platforms
							.filter((platformId: number) => platformId === platform.id).length)[0];
						if (romEmulator.active) {
							logger.info('EmulatedGamesCrawler', `Roms folder ${romFolder} found and binded to ${romEmulator.name}.`);
							this.romsFolders.push({
								romFolder,
								romEmulator
							});
						}
					}
					secondDone();
				}, () => {
					done();
				});
			}, () => {
				this.analyzeFolders();
			});
		});
	}

	private analyzeFolders() {
		this.romsFolders.forEachEnd(({romFolder, romEmulator}: any, done: () => void) => {
			logger.info('EmulatedGamesCrawler', `Parsing roms in ${romFolder} with ${romEmulator.name} pattern (${romEmulator.glob}).`);
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

				romInfos.forEachEnd(({romName, romPath}: any, secondDone: () => void) => {
					searchIgdbGame(romName, 1).then((game: any) => {
						game = game[0];
						delete game.name;
						const potentialGame: PotentialGame = new PotentialGame(romName, game);
						potentialGame.source = GameSource.ROM;
						potentialGame.commandLine = [
							romEmulator.path,
							romEmulator.command.replace('%g', romPath)
						];
						this.potentialGames.push(potentialGame);
						logger.info('EmulatedGamesCrawler', `Adding ${romName} to potential emulated games.`);
						secondDone();
					}).catch((error: Error) => {
						this.callback(error, null);
					});
				}, () => {
					done();
				});
			});
		}, () => {
			this.sendResults();
		});
	}
}

const emulatedGamesCrawler: EmulatedGamesCrawler = new EmulatedGamesCrawler();

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
