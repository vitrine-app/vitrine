import { ProgressInfo } from 'builder-util-runtime';
import { autoUpdater, UpdateCheckResult } from 'electron-updater';
import * as fs from 'fs-extra';
import * as moment from 'moment';
import * as path from 'path';
import * as rimraf from 'rimraf';

import { getEnvFolder, randomHashedString } from '../models/env';
import { GamesCollection } from '../models/GamesCollection';
import { PlayableGame} from '../models/PlayableGame';
import { GameSource, PotentialGame } from '../models/PotentialGame';
import { fillIgdbGame, searchIgdbGame } from './api/IgdbWrapper';
import { getGamePlayTime } from './api/SteamPlayTimeWrapper';
import { findSteamUser } from './api/SteamUserFinder';
import { searchBattleNetGames } from './crawlers/BattleNetCrawler';
import { searchEmulatedGames } from './crawlers/EmulatedCrawler';
import { searchOriginGames } from './crawlers/OriginCrawler';
import { getPlayableGames } from './crawlers/PlayableGamesCrawler';
import { searchSteamGames } from './crawlers/SteamCrawler';
import { launchGame } from './GameLauncher';
import { downloadImage, isAlreadyStored } from './helpers';
import { logger } from './Logger';
import { potentialGamesCacher } from './PotentialGamesCacher';
import { WindowsHandler } from './WindowsHandler';

export class Server {
	private vitrineConfig: any;
	private modulesConfig: any;
	private windowsHandler: WindowsHandler;
	private potentialGames: GamesCollection<PotentialGame>;
	private playableGames: GamesCollection<PlayableGame>;
	private gameLaunched: boolean;

	public constructor(config: any, private vitrineConfigFilePath: string) {
		({ vitrineConfig: this.vitrineConfig, modulesConfig: this.modulesConfig } = config);
		this.windowsHandler = new WindowsHandler();
		this.gameLaunched = false;
		this.registerEvents();
	}

	public run() {
		this.windowsHandler.run();
	}

	public registerEvents() {
		this.windowsHandler.listenToLoader('ready', this.loaderReady.bind(this))
			.listenToLoader('launch-client', this.windowsHandler.createClientWindow.bind(this.windowsHandler))
			.listenToLoader('update-and-restart', this.updateApp.bind(this));

		this.windowsHandler.listenToClient('settings-asked', this.clientSettingsAsked.bind(this))
			.listenToClient('ready', this.windowsHandler.clientReady.bind(this.windowsHandler))
			.listenToClient('quit-application', this.quitApplication.bind(this))
			.listenToClient('fill-igdb-game', this.fillIgdbGame.bind(this))
			.listenToClient('search-igdb-games', this.searchIgdbGames.bind(this))
			.listenToClient('add-game', this.addGame.bind(this))
			.listenToClient('edit-game', this.editGame.bind(this))
			.listenToClient('edit-game-time-played', this.editGameTimePlayed.bind(this))
			.listenToClient('launch-game', this.launchGame.bind(this))
			.listenToClient('remove-game', this.removeGame.bind(this))
			.listenToClient('refresh-potential-games', this.findPotentialGames.bind(this))
			.listenToClient('update-settings', this.updateSettings.bind(this));
	}

	public async loaderReady() {
		logger.info('Server', 'Checking for updates.');
		autoUpdater.allowPrerelease = true;
		autoUpdater.signals.progress((progress: ProgressInfo) => {
			this.windowsHandler.sendToLoader('update-progress', progress);
		});
		autoUpdater.signals.updateDownloaded(() => {
			autoUpdater.quitAndInstall(true, true);
		});
		try {
			const lastUpdate: UpdateCheckResult = await autoUpdater.checkForUpdates();
			if (lastUpdate.updateInfo.version !== autoUpdater.currentVersion) {
				logger.info('Server', `Update ${lastUpdate.updateInfo.version} found.`);
				this.windowsHandler.sendToLoader('update-found', lastUpdate.updateInfo.version);
			}
			else {
				logger.info('Server', 'No updates found.');
				this.windowsHandler.sendToLoader('no-update-found');
			}
		}
		catch (error) {
			logger.info('Server', 'Internet is offline, aborting updates checking.');
			this.windowsHandler.sendToLoader('no-update-found');
		}
	}

	public updateApp() {
		logger.info('Server', 'Quitting Vitrine and installing new version.');
		autoUpdater.quitAndInstall(true, true);
	}

	public async clientSettingsAsked() {
		this.potentialGames = new GamesCollection();
		this.playableGames = new GamesCollection();

		logger.info('Server', 'Sending configuration to client.');
		this.windowsHandler.sendToClient('init-settings', this.vitrineConfig, this.modulesConfig);
		if (!this.vitrineConfig.firstLaunch) {
			try {
				if (this.vitrineConfig.steam) {
					const steamUser: any = await findSteamUser(this.vitrineConfig.steam);
					Object.assign(this.vitrineConfig.steam, { ...steamUser });
				}
				this.playableGames = await getPlayableGames();
				logger.info('Server', 'Sending playable games to client.');
				this.windowsHandler.sendToClient('add-playable-games', this.playableGames.getGames());
				this.findPotentialGames();
			}
			catch (error) {
				this.throwServerError(error);
			}
		}
		else
			logger.info('Server', 'Vitrine first launch.');
	}

	public quitApplication(mustRelaunch?: boolean) {
		this.windowsHandler.quitApplication(mustRelaunch);
	}

	public async fillIgdbGame(gameId: number) {
		try {
			this.windowsHandler.sendToClient('send-igdb-game', await fillIgdbGame(gameId, this.vitrineConfig.lang));
		}
		catch (error) {
			this.throwServerError(error);
		}
	}

	public async searchIgdbGames(gameName: string, resultsNb?: number) {
		try {
			this.windowsHandler.sendToClient('send-igdb-searches', gameName, await searchIgdbGame(gameName, resultsNb));
		}
		catch (error) {
			this.throwServerError(error);
		}
	}

	public addGame(gameForm: any) {
		logger.info('Server', `Adding ${gameForm.name} to Vitrine.`);
		const gameName: string = gameForm.name;
		const addedGame: PlayableGame = new PlayableGame(gameName, gameForm);
		addedGame.source = gameForm.source;
		delete gameForm.source;
		this.registerGame(addedGame, gameForm, false);
	}

	public editGame(gameUuid: string, gameForm: any) {
		logger.info('Server', `Editing ${gameForm.name}.`);
		const editedGame: PlayableGame = this.playableGames.getGame(gameUuid);
		editedGame.name = gameForm.name;
		editedGame.commandLine = [];
		const { backgroundScreen, cover } = editedGame.details;
		editedGame.details = {
			...gameForm,
			backgroundScreen,
			cover
		};
		this.registerGame(editedGame, gameForm, true);
	}

	public editGameTimePlayed(gameUuid: string, timePlayed: number) {
		const editedGame: PlayableGame = this.playableGames.getGame(gameUuid);
		const gameDirectory: string = path.resolve(getEnvFolder('games'), editedGame.uuid);
		const configFilePath: string = path.resolve(gameDirectory, 'config.json');

		editedGame.timePlayed = timePlayed;
		logger.info('Server', `Editing time played for ${editedGame.name} (${timePlayed})`);
		this.sendRegisteredGame(editedGame, configFilePath, true);
	}

	public async launchGame(gameUuid: string) {
		if (this.gameLaunched) {
			logger.info('Server', 'Trying to launch a game but another one is already running.');
			return;
		}
		const launchingGame: PlayableGame = this.playableGames.getGame(gameUuid);
		this.gameLaunched = true;
		try {
			const secondsPlayed: number = await launchGame(launchingGame);
			this.gameLaunched = false;
			launchingGame.addPlayTime(secondsPlayed, (error: Error) => {
				logger.info('Server', `Adding time played ${secondsPlayed} to ${launchingGame.name} (${launchingGame.uuid}).`);
				this.throwServerError(error);
			});
			this.windowsHandler.sendToClient('stop-game', gameUuid, launchingGame.timePlayed);
		}
		catch (error) {
			this.gameLaunched = false;
			this.throwServerError(error);
		}
	}

	public removeGame(gameUuid: string) {
		this.playableGames.removeGame(gameUuid);
		const gameDirectory: string = path.resolve(getEnvFolder('games'), gameUuid);
		rimraf(gameDirectory, () => {
			logger.info('Server', `Removing game ${gameUuid} from Vitrine and deleting corresponding directory.`);
			this.windowsHandler.sendToClient('remove-playable-game', gameUuid);
			this.findPotentialGames();
		});
	}

	public async findPotentialGames() {
		logger.info('Server', 'Beginning to search potential games.');
		this.windowsHandler.sendToClient('potential-games-search-begin');
		this.potentialGames.clean();
		await Promise.all([
			this.searchSteamGames(),
			this.searchOriginGames(),
			this.searchBattleNetGames(),
			this.searchEmulatedGames()
		]);
		logger.info('Server', `Potential games are about to be cached.`);
		this.potentialGames.setGames(await potentialGamesCacher.cache(this.potentialGames.getGames()));
		logger.info('Server', `${this.potentialGames.size()} potential games sent to client.`);
		this.windowsHandler.sendToClient('add-potential-games', this.potentialGames.getGames());
	}

	public async updateSettings(settingsForm: any) {
		logger.info('Server', 'Updating global settings.');
		const config: any = { ...settingsForm };
		let firstTimeSteam: boolean = false;
		if (settingsForm.steam && !this.modulesConfig.steam.userId)
			firstTimeSteam = true;
		try {
			await fs.outputJson(this.vitrineConfigFilePath, config, { spaces: 2 });
			logger.info('Server', 'Settings outputted to vitrine_config.json.');
			this.vitrineConfig = config;
			if (firstTimeSteam) {
				const steamUser: any = await findSteamUser(this.vitrineConfig.steam);
				Object.assign(this.vitrineConfig.steam, { ...steamUser });
			}
			this.windowsHandler.sendToClient('settings-updated', this.vitrineConfig);
			this.findPotentialGames();
		}
		catch (error) {
			this.throwServerError(error);
		}
	}

	private async searchSteamGames(): Promise<any> {
		if (!this.vitrineConfig.steam)
			return;
		try {
			const games: GamesCollection<PotentialGame> = await searchSteamGames({
					...this.modulesConfig.steam,
					...this.vitrineConfig.steam
				},
				this.playableGames.getGamesFromSource(GameSource.STEAM));
			logger.info('Server', 'Adding potential Steam games to potential games list.');
			this.potentialGames.addGames(games.getGames());
			return;
		}
		catch (error) {
			this.throwServerError(error);
			return;
		}
	}

	private async searchOriginGames(): Promise<any> {
		if (!this.vitrineConfig.origin)
			return;
		try {
			const games: GamesCollection<PotentialGame> = await searchOriginGames({
					...this.modulesConfig.origin,
					...this.vitrineConfig.origin
				},
				this.playableGames.getGamesFromSource(GameSource.ORIGIN));
			logger.info('Server', 'Adding potential Origin games to potential games list.');
			this.potentialGames.addGames(games.getGames());
			return;
		}
		catch (error) {
			this.throwServerError(error);
			return;
		}
	}

	private async searchBattleNetGames(): Promise<any> {
		if (!this.vitrineConfig.battleNet)
			return;
		try {
			const games: GamesCollection<PotentialGame> = await searchBattleNetGames({
					...this.modulesConfig.battleNet,
					...this.vitrineConfig.battleNet
				},
				this.playableGames.getGamesFromSource(GameSource.BATTLE_NET));
			logger.info('Server', 'Adding potential Battle.net games to potential games list.');
			this.potentialGames.addGames(games.getGames());
			return;
		}
		catch (error) {
			this.throwServerError(error);
			return;
		}
	}

	private async searchEmulatedGames(): Promise<any> {
		if (!this.vitrineConfig.emulated)
			return;
		try {
			const games: GamesCollection<PotentialGame> = await searchEmulatedGames({
					...this.modulesConfig.emulated,
					...this.vitrineConfig.emulated
				},
				this.playableGames.getGamesFromSource(GameSource.EMULATED));
			logger.info('Server', 'Adding potential emulated games to potential games list.');
			this.potentialGames.addGames(games.getGames());
			return;
		}
		catch (error) {
			this.throwServerError(error);
			return;
		}
	}

	private async registerGame(game: PlayableGame, gameForm: any, editing: boolean) {
		game.commandLine = [ gameForm.executable ];
		if (gameForm.arguments)
			game.commandLine.push(gameForm.arguments);
		game.details.rating = parseInt(game.details.rating);
		game.details.genres = game.details.genres.split(', ');
		game.details.releaseDate = moment(game.details.date, 'DD/MM/YYYY').unix() * 1000;
		if (game.source === GameSource.STEAM)
			game.details.steamId = parseInt(game.commandLine[1].match(/\d+/g)[0]);
		delete game.details.name;
		delete game.details.date;
		delete game.details.executable;
		delete game.details.arguments;
		logger.info('Server', `Game form data for ${game.name} being formatted.`);

		if (!editing && game.source === GameSource.STEAM) {
			try {
				game.timePlayed = await getGamePlayTime(this.vitrineConfig.steam.userId, game.details.steamId);
			}
			catch (error) {
				this.throwServerError(error);
				return;
			}
		}
		this.ensureRegisteredGame(game, gameForm, editing);
	}

	private async ensureRegisteredGame(game: PlayableGame, gameForm: any, editing: boolean) {
		const gameDirectory: string = path.resolve(getEnvFolder('games'), game.uuid);
		const configFilePath: string = path.resolve(gameDirectory, 'config.json');
		if (!editing && await fs.pathExists(configFilePath))
			return;
		await fs.ensureDir(gameDirectory);

		if (!isAlreadyStored(game.details.backgroundScreen, gameForm.backgroundScreen) || !isAlreadyStored(game.details.cover, gameForm.cover)) {
			const gameHash: string = randomHashedString(8);
			const backgroundPath: string = path.resolve(gameDirectory, `background.${gameHash}.jpg`);
			const coverPath: string = path.resolve(gameDirectory, `cover.${gameHash}.jpg`);
			logger.info('Server', `Creating hashed versions for background picture and cover for ${game.name}.`);

			const backgroundUrl: string = (editing) ? (gameForm.backgroundScreen)
				: (game.details.backgroundScreen.replace('t_screenshot_med', 't_screenshot_huge'));
			const coverUrl: string = (editing) ? (gameForm.cover) : (game.details.cover);
			try {
				await this.downloadGamePictures(game, {backgroundUrl, backgroundPath, coverUrl, coverPath});
			}
			catch (error) {
				this.throwServerError(error);
				return;
			}
		}
		else
			logger.info('Server', `Background picture and cover for ${game.name} already stored.`);
		this.sendRegisteredGame(game, configFilePath, editing);
	}

	private async downloadGamePictures(game: PlayableGame, { backgroundUrl, backgroundPath, coverUrl, coverPath }: any): Promise<any> {
		try {
			const stored: boolean = await downloadImage(backgroundUrl, backgroundPath);
			game.details.backgroundScreen = (stored) ? (backgroundPath) : (game.details.backgroundScreen);
			if (game.details.steamId)
				delete game.details.screenshots;
			else
				delete game.details.background;
			try {
				const stored: boolean = await downloadImage(coverUrl, coverPath);
				game.details.cover = (stored) ? (coverPath) : (game.details.cover);
				if (stored) {
					game.details.cover = coverPath;
					return;
				}
			}
			catch (error) {
				return error;
			}
		}
		catch (error) {
			return error;
		}
	}

	private async sendRegisteredGame(game: PlayableGame, configFilePath: string, editing: boolean) {
		logger.info('Server', `Outputting game config file for ${game.name}.`);
		try {
			await fs.outputJson(configFilePath, game , { spaces: 2 });
			if (!editing) {
				logger.info('Server', `Added game ${game.name} sent to client.`);
				this.playableGames.addGame(game);
				this.windowsHandler.sendToClient('add-playable-game', game);
			}
			else {
				logger.info('Server', `Edited game ${game.name} sent to client.`);
				this.playableGames.editGame(game);
				this.windowsHandler.sendToClient('edit-playable-game', game);
			}
			if (!editing && game.source !== GameSource.LOCAL)
				this.findPotentialGames();
		}
		catch (error) {
			this.throwServerError(error);
		}
	}

	private throwServerError(error: Error) {
		logger.info('Server', `An error happened: ${error.message}`);
		this.windowsHandler.sendToClient('error', error.name, error.stack);
	}
}
