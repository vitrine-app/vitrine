import * as fs from 'fs-extra';
import * as path from 'path';

import { PotentialGamesCrawler } from './PotentialGamesCrawler';
import { PlayableGame } from '../../models/PlayableGame';
import { GameSource, PotentialGame } from '../../models/PotentialGame';
import { GamesCollection } from '../../models/GamesCollection';
import { searchIgdbGame } from '../api/IgdbWrapper';

interface BattleNetGame {
	tag: string,
	name: string,
	path?: string
}

const gamesData: BattleNetGame[] = [
	{
		name: 'World of Warcraft',
		tag: 'wow'
	},
	{
		name: 'Diablo III',
		tag: 'd3cn'
	},
	{
		name: 'StarCraft II',
		tag: 's2'
	},
	{
		name: 'Hearthstone',
		tag: 'hs_beta',
		path: 'Hearthstone Beta Launcher.exe'
	},
	{
		name: 'StarCraft',
		tag: 's1'
	},
	{
		name: 'Destiny 2',
		tag: 'destiny2'
	}
];

const config: any = {
	configFilePath: '%appdata%/Battle.net/Battle.net.config'
};

class BattleNetGamesCrawler extends PotentialGamesCrawler {
	private gamesData: BattleNetGame[];
	private rootInstallPath: string;

	public setPlayableGames(playableGames?: PlayableGame[]): this {
		super.setPlayableGames(playableGames);

		this.gamesData = [];
		return this;
	}

	public search(moduleConfig: any, callback: (error: Error, potentialGames: GamesCollection<PotentialGame>) => void) {
		super.search(moduleConfig, callback);

		let configFilePath: string = path.resolve(config.configFilePath.replace('%appdata%', process.env.APPDATA));
		fs.readJson(configFilePath).then(this.parseConfigFile.bind(this)).catch((error: Error) => {
			this.callback(error, null);
		});
	}

	private parseConfigFile(battleNetConfig: any) {
		this.rootInstallPath = battleNetConfig.Client.Install.DefaultInstallPath;
		const gameTags: string[] = Object.keys(battleNetConfig.Games)
			.filter((gamesTag: string) => gamesTag !== 'battle_net' && battleNetConfig.Games[gamesTag].Resumable);

		let counter: number = 0;
		gameTags.forEach((gameTag: string) => {
			let gameData: BattleNetGame = gamesData.filter((battleNetGame: BattleNetGame) => battleNetGame.tag === gameTag)[0];
			if (!this.isGameAlreadyAdded(gameData.name))
				this.gamesData.push(gameData);
			counter++;
			if (counter === gameTags.length)
				this.parseFolders();
		});
	}

	private parseFolders() {
		let foundGames: BattleNetGame[] = [];
		let counter: number = 0;
		this.gamesData.forEach((gameData: BattleNetGame) => {
			gameData.path = path.resolve(this.rootInstallPath, gameData.name, gameData.path);
			fs.pathExists(gameData.path).then((exists: boolean) => {
				if (exists)
					foundGames.push(gameData);
				counter++;
				if (counter === this.gamesData.length)
					this.getGamesData(foundGames);
			}).catch((error: Error) => {
				this.callback(error, null);
			});
		});
	}

	private getGamesData(foundGames: BattleNetGame[]) {
		let counter: number = 0;

		foundGames.forEach((foundGame: BattleNetGame) => {
			searchIgdbGame(foundGame.name, 1).then((game: any) => {
				game = game[0];
				delete game.name;
				let potentialGame: PotentialGame = new PotentialGame(foundGame.name, game);
				potentialGame.source = GameSource.BATTLE_NET;
				potentialGame.commandLine = [ foundGame.path ];
				this.potentialGames.push(potentialGame);
				counter++;
				if (counter === foundGames.length)
					this.sendResults();
			}).catch((error: Error) => {
				this.callback(error, null);
			});
		});
	}
}

let battleNetGamesCrawler: BattleNetGamesCrawler = new BattleNetGamesCrawler();

export function searchBattleNetGames(battleNetConfig: any, playableGames?: PlayableGame[]): Promise<any> {
	return new Promise((resolve, reject) => {
		battleNetGamesCrawler.setPlayableGames(playableGames)
			.search(battleNetConfig, (error: Error, potentialGames: GamesCollection<PotentialGame>) => {
				if (error)
					reject(error);
				else
					resolve(potentialGames);
			});
	});
}
