import * as path from 'path';
import * as glob from 'glob';

import { GameSource, PotentialGame } from '../../models/PotentialGame';
import { PlayableGame } from '../../models/PlayableGame';
import { GamesCollection } from '../../models/GamesCollection';
import { getIgdbWrapperSearcher } from '../api/IgdbWrapper';

class EmulatedGamesCrawler {
	private potentialGames: PotentialGame[];
	private playableGames: PlayableGame[];
	private callback: Function;
	private romsFolders: any[];

	public constructor(private emulatedConfig: any, playableGames?: PlayableGame[]) {
		this.potentialGames = [];
		this.romsFolders = [];
		this.playableGames = (playableGames) ? (playableGames) : ([]);
	}

	public search(callback: Function) {
		this.callback = callback;
		glob(`${this.emulatedConfig.romsFolder}\\*`, (error: Error, folders: string[]) => {
			if (error) {
				this.callback(error, null);
				return;
			}
			let counter: number = 0;
			folders.forEach((folder: string) => {
				let secondCounter: number = 0;
				this.emulatedConfig.consoles.forEach((console: any) => {
					if (console.folder === path.basename(folder))
						this.romsFolders.push({
							console,
							folder
						});
					secondCounter++;
					if (secondCounter === this.emulatedConfig.consoles.length) {
						counter++;
						if (counter === folders.length) {
							this.analyzeFolders();
						}
					}
				});
			});
		});
	}

	private analyzeFolders() {
		let counter: number = 0;
		this.romsFolders.forEach(({folder: romFolder, console: romConsole}) => {
			glob(`${romFolder}/*`, (error: Error, roms: string[]) => {
				if (error) {
					this.callback(error, null);
					return;
				}
				let secondCounter: number = 0;
				roms.forEach((romPath: string) => {
					this.getEmulator(romConsole, (error: Error, emulator: any) => {
						if (error)
							return;
						let romName = path.parse(romPath).name;
						for (let playableGame of this.playableGames) {
							if (romName == playableGame.name) {
								secondCounter++;
								if (secondCounter === roms.length) {
									counter++;
									if (counter === this.romsFolders.length) {
										let potentialGames: GamesCollection<PotentialGame> = new GamesCollection();
										potentialGames.games = this.potentialGames;
										this.callback(null, potentialGames);
									}
								}
								return;
							}
						}
						getIgdbWrapperSearcher(romName, 1).then((game: any) => {
							game = game[0];
							delete game.name;
							let potentialGame: PotentialGame = new PotentialGame(romName, game);
							potentialGame.source = GameSource.ROM;
							potentialGame.commandLine = [
								'PROGRAM',
								emulator.command.replace('%g', romPath)
							];
							this.potentialGames.push(potentialGame);
							secondCounter++;
							if (secondCounter === roms.length) {
								counter++;
								if (counter === this.romsFolders.length) {
									let potentialGames: GamesCollection<PotentialGame> = new GamesCollection();
									potentialGames.games = this.potentialGames;
									this.callback(null, potentialGames);
								}
							}
						}).catch((error: Error) => {
							this.callback(error, null);
						});
					});
				});
			});
		});
	}

	private getEmulator(romConsole: any, callback: Function) {
		let counter: number = 0;
		let found: boolean = false;
		this.emulatedConfig.emulators.forEach((emulator: any) => {
			if (emulator.consoles.indexOf(romConsole.id) !== -1) {
				callback(null, emulator);
				found = true;
			}
			counter++;
			if (counter === emulator.consoles.length && !found)
				callback(new Error('Emulator not found.'), null);
		});
	}
}

export function getEmulatedGamesCrawler(emulatedConfig: any, playableGames?: PlayableGame[]): Promise<any> {
	return new Promise((resolve, reject) => {
		new EmulatedGamesCrawler(emulatedConfig, playableGames).search((error: Error, potentialGames: GamesCollection<PotentialGame>) => {
			if (error)
				reject(error);
			else
				resolve(potentialGames);
		});
	});
}
