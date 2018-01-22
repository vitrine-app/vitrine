import * as path from 'path';
import * as glob from 'glob';

import { PotentialGamesCrawler } from './PotentialGamesCrawler';
import { GameSource, PotentialGame } from '../../models/PotentialGame';
import { PlayableGame } from '../../models/PlayableGame';
import { GamesCollection } from '../../models/GamesCollection';
import { searchIgdbGame } from '../api/IgdbWrapper';
import { spatStr } from '../helpers';

class EmulatedGamesCrawler extends PotentialGamesCrawler {
	private romsFolders: any[];

	public setPlayableGames(playableGames?: PlayableGame[]): this {
		super.setPlayableGames(playableGames);
		this.romsFolders = [];
		return this;
	}

	public search(moduleConfig: any, callback: Function) {
		super.search(moduleConfig, callback);
		glob(`${this.moduleConfig.romsFolder}\\*`, (error: Error, folders: string[]) => {
			if (error)
				return this.callback(error, null);
			let counter: number = 0;
			folders.forEach((romFolder: string) => {
				let secondCounter: number = 0;
				this.moduleConfig.platforms.forEach((platform: any) => {
					if (platform.folder === path.basename(romFolder)) {
						this.getEmulator(platform, (error: Error, romEmulator: any) => {
							if (error || !romEmulator.active)
								return;
							this.romsFolders.push({
								romFolder,
								romEmulator
							});
						});
					}
					secondCounter++;
					if (secondCounter === this.moduleConfig.platforms.length) {
						counter++;
						if (counter === folders.length)
							this.analyzeFolders();
					}
				});
			});
		});
	}

	private analyzeFolders() {
		let counter: number = 0;
		this.romsFolders.forEach(({romFolder, romEmulator}) => {
			glob(`${romFolder}/${romEmulator.glob}`, (error: Error, roms: string[]) => {
				if (error)
					return this.callback(error, null);
				let secondCounter: number = 0;
				roms.forEach((romPath: string) => {
					let romName = path.parse(romPath).name;
					for (let playableGame of this.playableGames) {
						if (spatStr(romName) === spatStr(playableGame.name)) {
							secondCounter++;
							if (secondCounter === roms.length) {
								counter++;
								if (counter === this.romsFolders.length)
									this.sendResults();
							}
							return;
						}
					}
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
						secondCounter++;
						if (secondCounter === roms.length) {
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

	private getEmulator(romPlatform: any, callback: Function) {
		let counter: number = 0;
		let found: boolean = false;
		this.moduleConfig.emulators.forEach((emulator: any) => {
			if (emulator.platforms.indexOf(romPlatform.id) !== -1) {
				callback(null, emulator);
				found = true;
			}
			counter++;
			if (counter === emulator.platforms.length && !found)
				callback(new Error('Emulator not found.'), null);
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
