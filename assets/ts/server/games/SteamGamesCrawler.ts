import * as path from 'path';
import * as fs from 'fs';
import * as glob from 'glob';

import { AcfParser } from '../api/AcfParser';
import { PotentialSteamGame } from './PotentialSteamGame';
import { IgdbWrapper } from '../api/IgdbWrapper';

export class SteamGamesCrawler {
	private configFilePath: string;
	private configFile: any;
	private manifestRegEx: string;
	private potentialGames: PotentialSteamGame[];

	constructor() {
		this.configFilePath = path.join('config/steam.json');
		this.configFile = JSON.parse(fs.readFileSync(this.configFilePath).toString());
		this.manifestRegEx = 'appmanifest_*.acf';
		this.potentialGames = [];
	}

	public search(): void {
		this.configFile.gamesFolders.forEach((folder) => {
			let gameFolder: string = '';

			if (folder.startsWith('~')) {
				gameFolder = path.join(this.configFile.installFolder, folder.substr(1), this.manifestRegEx);
			}
			else
				gameFolder = path.join(folder, this.manifestRegEx);
			glob(gameFolder, this.processGames.bind(this));
		});
	}

	private processGames(error, files): void {
		files.forEach((appManifest) => {
			let gameManifest: any = new AcfParser(appManifest).toObject().AppState;
			let igdbWrapper: IgdbWrapper = new IgdbWrapper();

			igdbWrapper.getGame(gameManifest.name, (game) => {
				let potentialGame: PotentialSteamGame = new PotentialSteamGame(gameManifest.name, game);
				this.potentialGames.push(potentialGame);
				console.log(potentialGame.details);
			});
		});
	}
}