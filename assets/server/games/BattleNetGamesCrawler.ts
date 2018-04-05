import * as fs from 'fs-extra';
import * as path from 'path';

import { GamesCollection } from '../../models/GamesCollection';
import { PlayableGame } from '../../models/PlayableGame';
import { GameSource, PotentialGame } from '../../models/PotentialGame';
import { searchIgdbGame } from '../api/IgdbWrapper';
import { logger } from '../Logger';
import { PotentialGamesCrawler } from './PotentialGamesCrawler';

interface BattleNetGame {
	tag: string;
	name: string;
	execTag?: string;
	path?: string;
}

const gamesData: BattleNetGame[] = [
	{
		name: 'World of Warcraft',
		tag: 'wow',
		execTag: 'WoW'
	},
	{
		name: 'Diablo III',
		tag: 'd3cn',
		execTag: 'D3'
	},
	{
		name: 'StarCraft II',
		tag: 's2',
		execTag: 'S2'
	},
	{
		name: 'Hearthstone',
		tag: 'hs_beta',
		path: 'Hearthstone.exe',
		execTag: 'WTCG'
	},
	{
		name: 'StarCraft',
		tag: 's1',
		execTag: 'SCR'
	},
	{
		name: 'Heroes of the Storm',
		tag: 'heroes',
		execTag: 'Hero'
	},
	{
		name: 'Destiny 2',
		tag: 'destiny2',
		execTag: 'DST2'
	}
];

class BattleNetGamesCrawler extends PotentialGamesCrawler {
	private gamesData: BattleNetGame[];
	private rootInstallPath: string;

	public setPlayableGames(playableGames?: PlayableGame[]): this {
		super.setPlayableGames(playableGames);

		this.gamesData = [];
		return this;
	}

	public async search(moduleConfig: any, callback: (error: Error, potentialGames: GamesCollection<PotentialGame>) => void) {
		super.search(moduleConfig, callback);

		const configFilePath: string = path.resolve(moduleConfig.configFilePath.replace('%appdata%', process.env.APPDATA));
		logger.info('BattleNetGamesCrawler', `Reading Battle.net config file ${configFilePath}.`);
		try {
			this.parseConfigFile(await fs.readJson(configFilePath));
		}
		catch (error) {
			this.callback(error, null);
		}
	}

	private parseConfigFile(battleNetConfig: any) {
		this.rootInstallPath = battleNetConfig.Client.Install.DefaultInstallPath;
		const gameTags: string[] = Object.keys(battleNetConfig.Games)
			.filter((gamesTag: string) => gamesTag !== 'battle_net' && battleNetConfig.Games[gamesTag].Resumable);

		gameTags.forEachEnd((gameTag: string, done: () => void) => {
			const gameData: BattleNetGame = gamesData.filter((battleNetGame: BattleNetGame) => battleNetGame.tag === gameTag)[0];
			logger.info('BattleNetGamesCrawler', `Battle.net game ${gameData.name} found.`);
			if (!this.gameDirExists(gameData.name))
				this.gamesData.push(gameData);
			else
				logger.info('BattleNetGamesCrawler', `Battle.net game ${gameData.name} is already a playable game.`);
			done();
		}, () => {
			this.parseFolders();
		});
	}

	private parseFolders() {
		if (!this.gamesData.length) {
			logger.info('BattleNetGamesCrawler', 'No Battle.net games found.');
			this.sendResults();
			return;
		}
		const foundGames: BattleNetGame[] = [];
		this.gamesData.forEachEnd(async (gameData: BattleNetGame, done: () => void) => {
			gameData.path = path.resolve(this.rootInstallPath, gameData.name, gameData.path);
			if (await fs.pathExists(gameData.path)) {
				logger.info('BattleNetGamesCrawler', `Battle.net game ${gameData.name} is present on disk.`);
				foundGames.push(gameData);
			}
			done();
		}, () => {
			this.getGamesData(foundGames);
		});
	}

	private getGamesData(foundGames: BattleNetGame[]) {
		foundGames.forEachEnd(async (foundGame: BattleNetGame, done: () => void) => {
			try {
				const game: any = (await searchIgdbGame(foundGame.name, 1))[0];
				delete game.name;
				const potentialGame: PotentialGame = new PotentialGame(foundGame.name, game);
				potentialGame.source = GameSource.BATTLE_NET;
				potentialGame.commandLine = [foundGame.path];
				this.potentialGames.push(potentialGame);
				logger.info('BattleNetGamesCrawler', `Adding ${foundGame.name} to potential Battle.net games.`);
				done();
			}
			catch (error) {
				this.callback(error, null);
			}
		}, () => {
			this.sendResults();
		});
	}
}

const battleNetGamesCrawler: BattleNetGamesCrawler = new BattleNetGamesCrawler();

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
