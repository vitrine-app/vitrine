import * as glob from 'glob';
import * as path from 'path';
import * as SteamWeb from 'steam-web';

import { GamesCollection } from '../../models/GamesCollection';
import { PlayableGame } from '../../models/PlayableGame';
import { GameSource, PotentialGame } from '../../models/PotentialGame';
import { steamKey } from '../../modules/keysProvider';
import { AcfParser } from '../api/AcfParser';
import { logger } from '../Logger';
import { steamAppIdsCacher } from '../SteamAppIdsCacher';
import { PotentialGamesCrawler } from './PotentialGamesCrawler';

class SteamCrawler extends PotentialGamesCrawler {
	private client: SteamWeb;
	private manifestRegEx: string;
	private apiEndPoint: string;
	private steamBinary: string;

	public setPlayableGames(playableGames?: PlayableGame[]): this {
		super.setPlayableGames(playableGames);
		this.client = new SteamWeb({
			apiKey: steamKey(),
			format: 'json'
		});
		this.manifestRegEx = 'appmanifest_*.acf';
		this.apiEndPoint = 'https://store.steampowered.com/api/appdetails/';
		this.steamBinary = (process.platform === 'win32') ? ('steam.exe') : ('steam.sh');
		return this;
	}

	public search(moduleConfig: any, callback: (error: Error, potentialGames: GamesCollection<PotentialGame>) => void) {
		super.search(moduleConfig, callback);

		this.moduleConfig.gamesFolders.forEach((folder: string) => {
			let gameFolder: string = '';

			if (folder.startsWith('~'))
				gameFolder = path.resolve(this.moduleConfig.installFolder, folder.substr(1), this.manifestRegEx);
			else
				gameFolder = path.resolve(folder, this.manifestRegEx);
			logger.info('SteamCrawler', `Looking for Steam games manifests in ${gameFolder}.`);
			glob(gameFolder, this.processGames.bind(this));
		});
	}

	private async processGames(error: Error, files: string[]) {
		if (error) {
			this.callback(error, null);
			return;
		}
		if (!files.length) {
			logger.info('SteamCrawler', `No Steam games found in this directory.`);
			this.callback(null, new GamesCollection());
			return;
		}
		const gameManifests: any[] = files.map((appManifest: any) => new AcfParser(appManifest).toObject().AppState)
			.filter((appManifest: any) => {
				const found: boolean = this.playableGames.filter((playableGame: any) =>
					parseInt(appManifest.appid) === playableGame.details.steamId
				).length > 0;
				if (found)
					logger.info('SteamCrawler', `Steam game ${appManifest.name} is already a playable game.`);
				return !found;
			});

		await gameManifests.forEachEnd((gameManifest: any, done: () => void) => {
			logger.info('SteamCrawler', `Steam game ${gameManifest.name} (Steam ID ${gameManifest.appid}) found.`);
			const potentialGame: PotentialGame = new PotentialGame(gameManifest.name);
			potentialGame.source = GameSource.STEAM;
			potentialGame.commandLine = [
				path.resolve(this.moduleConfig.installFolder, this.steamBinary),
				this.moduleConfig.launchCommand.replace('%id', gameManifest.appid)
			];
			potentialGame.details.steamId = parseInt(gameManifest.appid);
			this.potentialGames.push(potentialGame);
			logger.info('SteamCrawler', `Adding ${gameManifest.name} to potential Steam games.`);
			done();
		});
		if (this.moduleConfig.searchCloud)
			this.searchUninstalledGames();
		else {
			logger.info('SteamCrawler', 'Non-installed games won\'t be searched.');
			this.sendResults();
		}
	}

	private searchUninstalledGames() {
		this.client.getOwnedGames({
			steamid: this.moduleConfig.userId,
			callback: async (error: string, { response }: any) => {
				if (error) {
					logger.info('SteamCrawler', 'Request to Steam API failed.');
					this.callback(new Error(error), null);
					return;
				}
				const appIds: number[] = response.games.map(({ appid: appId }: any) => appId);
				const appDatas: any[] = (await steamAppIdsCacher.cache(appIds)).filter((appData: any) => {
					const found: boolean = this.playableGames.filter((playableGame: any) =>
						parseInt(appData.appId) === playableGame.details.steamId
					).length > 0 || this.potentialGames.filter((potentialGame: PotentialGame) =>
						parseInt(appData.appId) === potentialGame.details.steamId
					).length > 0;
					return !found;
				});
				await appDatas.forEachEnd((appData: any, done: () => void) => {
					const potentialGame: PotentialGame = new PotentialGame(appData.name);
					potentialGame.source = GameSource.STEAM;
					potentialGame.commandLine = [
						path.resolve(this.moduleConfig.installFolder, this.steamBinary),
						this.moduleConfig.launchCommand.replace('%id', appData.appId)
					];
					potentialGame.details.steamId = parseInt(appData.appId);
					this.potentialGames.push(potentialGame);
					logger.info('SteamCrawler', `Adding ${appData.name} to potential Steam games as non-installed.`);
					done();
				});
				this.sendResults();
			}
		});
	}
}

const steamCrawler: SteamCrawler = new SteamCrawler();

export function searchSteamGames(steamConfig: any, playableGames?: PlayableGame[]): Promise<any> {
	return new Promise((resolve, reject) => {
		steamCrawler.setPlayableGames(playableGames)
			.search(steamConfig, (error: Error, potentialGames: GamesCollection<PotentialGame>) => {
				if (error)
					reject(error);
				else
					resolve(potentialGames);
			});
	});
}
