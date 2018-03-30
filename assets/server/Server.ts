import * as fs from 'fs-extra';
import * as path from 'path';
import { autoUpdater, UpdateCheckResult } from 'electron-updater';
import { ProgressInfo } from 'builder-util-runtime';
import * as rimraf from 'rimraf';
import * as moment from 'moment';

import { WindowsHandler } from './WindowsHandler';
import { GamesCollection } from '../models/GamesCollection';
import { GameSource, PotentialGame } from '../models/PotentialGame';
import { PlayableGame} from '../models/PlayableGame';
import { getEnvFolder, randomHashedString } from '../models/env';
import { launchGame } from './GameLauncher';
import { getPlayableGames } from './games/PlayableGamesCrawler';
import { searchSteamGames } from './games/SteamGamesCrawler';
import { searchOriginGames } from './games/OriginGamesCrawler';
import { searchBattleNetGames } from './games/BattleNetGamesCrawler';
import { searchEmulatedGames } from './games/EmulatedGamesCrawler';
import { fillIgdbGame, searchIgdbGame } from './api/IgdbWrapper';
import { findSteamUser } from './api/SteamUserFinder';
import { getGamePlayTime } from './api/SteamPlayTimeWrapper';
import { downloadImage, isAlreadyStored } from './helpers';
import { logger} from './Logger';

interface ModulesConfig {
	steam?: {
		gamesFolders: string[],
		launchCommand: string
	},
	origin?: {
		regHive: string,
		regKey: string
	},
	battleNet?: {
		configFilePath: string
	}
}

export class Server {
	private windowsHandler: WindowsHandler;
	private emulatorsConfigFilePath: string;
	private potentialGames: GamesCollection<PotentialGame>;
	private playableGames: GamesCollection<PlayableGame>;
	private gameLaunched: boolean;
	private modulesConfig: ModulesConfig;

	public constructor(private vitrineConfig: any, private vitrineConfigFilePath: string, configFolderPath: string) {
		this.windowsHandler = new WindowsHandler();
		this.emulatorsConfigFilePath = path.resolve(configFolderPath, 'emulators.json');
		this.gameLaunched = false;
		this.modulesConfig = {
			steam: {
				gamesFolders: [
					'~steamapps'
				],
				launchCommand: 'steam://run/%id'
			},
			origin: {
				regHive: 'HKLM',
				regKey: '\\Software\\Microsoft\\Windows\\CurrentVersion\\GameUX\\Games'
			},
			battleNet: {
				configFilePath: '%appdata%/Battle.net/Battle.net.config'
			}
		}
	}

	public run(prod?: boolean) {
		this.windowsHandler.run(!prod);
	}

	public registerEvents() {
		this.windowsHandler.listenToLoader('ready', this.loaderReady.bind(this))
			.listenToLoader('launch-client', this.windowsHandler.createClientWindow.bind(this.windowsHandler))
			.listenToLoader('update-and-restart', this.updateApp.bind(this));

		this.windowsHandler.listenToClient('settings-asked', this.clientSettingsAsked.bind(this))
			.listenToClient('ready', this.windowsHandler.clientReady.bind(this.windowsHandler))
			.listenToClient('quit-application', (mustRelaunch?: boolean) => this.windowsHandler.quitApplication(mustRelaunch))
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

	private throwServerError(error: Error) {
		logger.info('Server', 'An error happened.');
		this.windowsHandler.sendToClient('error', error.name, error.stack);
	}

	private loaderReady() {
		logger.info('Server', 'Checking for updates.');
		autoUpdater.allowPrerelease = true;
		autoUpdater.signals.progress((progress: ProgressInfo) => {
			this.windowsHandler.sendToLoader('update-progress', progress);
		});
		autoUpdater.signals.updateDownloaded(() => {
			autoUpdater.quitAndInstall(true, true);
		});
		autoUpdater.checkForUpdates().then((lastUpdate: UpdateCheckResult) => {
			if (lastUpdate.updateInfo.version !== autoUpdater.currentVersion) {
				logger.info('Server', `Update ${lastUpdate.updateInfo.version} found.`);
				this.windowsHandler.sendToLoader('update-found', lastUpdate.updateInfo.version);
			}
			else {
				logger.info('Server', 'No updates found.');
				this.windowsHandler.sendToLoader('no-update-found');
			}
		});
	}

	private clientSettingsAsked() {
		this.potentialGames = new GamesCollection();
		this.playableGames = new GamesCollection();

		logger.info('Server', 'Sending configuration to client.');
		this.windowsHandler.sendToClient('init-settings', this.vitrineConfig);
		if (!this.vitrineConfig.firstLaunch) {
			if (this.vitrineConfig.steam) {
				findSteamUser(this.vitrineConfig.steam).then((steamUser: any) => {
					Object.assign(this.vitrineConfig.steam, { ...steamUser });
				}).catch((error: Error) => {
					this.throwServerError(error);
				});
			}
			getPlayableGames().then((games: GamesCollection<PlayableGame>) => {
				this.playableGames = games;
				logger.info('Server', 'Sending playable games to client.');
				this.windowsHandler.sendToClient('add-playable-games', this.playableGames.getGames());
				this.findPotentialGames();
			}).catch((error: Error) => {
				this.throwServerError(error);
			});
		}
		else
			logger.info('Server', 'Vitrine first launch.');
	}

	private updateApp() {
		logger.info('Server', 'Quitting Vitrine and installing new version.');
		autoUpdater.quitAndInstall(true, true);
	}

	private fillIgdbGame(gameId: number) {
		fillIgdbGame(gameId, this.vitrineConfig.lang).then((game) => {
			this.windowsHandler.sendToClient('send-igdb-game', game);
		}).catch((error: Error) => {
			this.throwServerError(error);
		});
	}

	private searchIgdbGames(gameName: string, resultsNb?: number) {
		searchIgdbGame(gameName, resultsNb).then((games: any) => {
			this.windowsHandler.sendToClient('send-igdb-searches', gameName, games);
		}).catch((error: Error) => {
			this.throwServerError(error);
		});
	}

	private addGame(gameForm: any) {
		logger.info('Server', `Adding ${gameForm.name} to Vitrine.`);
		let gameName: string = gameForm.name;
		let addedGame: PlayableGame = new PlayableGame(gameName, gameForm);
		addedGame.source = gameForm.source;

		this.registerGame(addedGame, gameForm, false);
	}

	private editGame(gameUuid: string, gameForm: any) {
		logger.info('Server', `Editing ${gameForm.name}.`);
		let editedGame: PlayableGame = this.playableGames.getGame(gameUuid);
		editedGame.name = gameForm.name;
		editedGame.commandLine = [];
		let { backgroundScreen, cover } = editedGame.details;
		editedGame.details = {
			...gameForm,
			backgroundScreen,
			cover
		};
		this.registerGame(editedGame, gameForm, true);
	}

	private editGameTimePlayed(gameUuid: string, timePlayed: number) {
		let editedGame: PlayableGame = this.playableGames.getGame(gameUuid);
		let gameDirectory: string = path.resolve(getEnvFolder('games'), editedGame.uuid);
		let configFilePath: string = path.resolve(gameDirectory, 'config.json');

		editedGame.timePlayed = timePlayed;
		logger.info('Server', `Editing time played for ${editedGame.name} (${timePlayed})`);
		this.sendRegisteredGame(editedGame, configFilePath, true);
	}

	private launchGame(gameUuid: string) {
		if (this.gameLaunched) {
			logger.info('Server', 'Trying to launch a game but another one is already running.');
			return;
		}
		let launchingGame: PlayableGame = this.playableGames.getGame(gameUuid);
		this.gameLaunched = true;
		launchGame(launchingGame).then((secondsPlayed: number) => {
			this.gameLaunched = false;
			launchingGame.addPlayTime(secondsPlayed, (error: Error) => {
				logger.info('Server', `Adding time played ${secondsPlayed} to ${launchingGame.name} (${launchingGame.uuid}).`);
				this.throwServerError(error);
			});
			this.windowsHandler.sendToClient('stop-game', gameUuid, launchingGame.timePlayed);
		}).catch((error: Error) => {
			this.gameLaunched = false;
			this.throwServerError(error);
		});
	}

	private removeGame(gameUuid: string) {
		this.potentialGames.removeGame(gameUuid);
		let gameDirectory: string = path.resolve(getEnvFolder('games'), gameUuid);
		rimraf(gameDirectory, () => {
			logger.info('Server', `Removing game ${gameUuid} from Vitrine and deleting corresponding directory.`);
			this.windowsHandler.sendToClient('remove-playable-game', gameUuid);
		});
	}

	// TODO: Improve potential games pipeline
	private findPotentialGames() {
		logger.info('Server', 'Beginning to search potential games.');
		this.windowsHandler.sendToClient('potential-games-search-begin');
		this.potentialGames.clean();
		this.searchSteamGames()
			.then(this.searchOriginGames.bind(this))
			.then(this.searchBattleNetGames.bind(this))
			.then(this.searchEmulatedGames.bind(this))
			.then(() => {
				logger.info('Server', `${this.potentialGames.size()} potential games sent to client.`);
				this.windowsHandler.sendToClient('add-potential-games', this.potentialGames.getGames());
			});
	}

	private updateSettings(settingsForm: any) {
		logger.info('Server', 'Updating global settings.');
		let config: any = {
			lang: settingsForm.lang
		};
		if (settingsForm.steamPath) {
			logger.info('Server', 'Updating Steam configuration.');
			config.steam = {
				installFolder: settingsForm.steamPath,
				...this.modulesConfig.steam
			};
		}
		if (settingsForm.originPath) {
			logger.info('Server', 'Updating Origin configuration.');
			config.origin = {
				installFolder: settingsForm.originPath,
				...this.modulesConfig.origin
			};
		}
		if (settingsForm.battleNetEnabled) {
			logger.info('Server', 'Updating Battle.net configuration.');
			config.battleNet = {
				...this.modulesConfig.battleNet
			};
		}
		if (settingsForm.emulatedPath) {
			logger.info('Server', 'Updating emulated games configuration.');
			config.emulated = {
				romsFolder: settingsForm.emulatedPath
			};
		}
		fs.outputJson(this.vitrineConfigFilePath, config, { spaces: 2 }).then(() => {
			logger.info('Server', 'Settings outputted to vitrine_config.json.');
			let emulatorsConfig: any = {
				...this.vitrineConfig.emulated,
				...config.emulated,
				emulators: settingsForm.emulators
			};
			if (!settingsForm.emulatedPath)
				delete emulatorsConfig.romsFolder;
			fs.outputJson(this.emulatorsConfigFilePath, emulatorsConfig.emulators, { spaces: 2 }).then(() => {
				logger.info('Server', 'Emulators config outputted to emulators.json.');
				this.vitrineConfig = { ...config, emulated: emulatorsConfig };
				this.windowsHandler.sendToClient('settings-updated', this.vitrineConfig);
				this.findPotentialGames();
			}).catch((error: Error) => {
				this.throwServerError(error);
			});
		}).catch((error: Error) => {
			this.throwServerError(error);
		});
	}

	private async searchSteamGames(): Promise<any> {
		if (!this.vitrineConfig.steam)
			return;

		try {
			let games: GamesCollection<PotentialGame> = await searchSteamGames(this.vitrineConfig.steam, this.playableGames.getGames());
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
			let games: GamesCollection<PotentialGame> = await searchOriginGames(this.vitrineConfig.origin, this.playableGames.getGames());
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
			let games: GamesCollection<PotentialGame> = await searchBattleNetGames(this.vitrineConfig.battleNet, this.playableGames.getGames());
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
		if (!this.vitrineConfig.emulated.romsFolder)
			return;

		try {
			let games: GamesCollection<PotentialGame> = await searchEmulatedGames(this.vitrineConfig.emulated, this.playableGames.getGames());
			logger.info('Server', 'Adding potential emulated games to potential games list.');
			this.potentialGames.addGames(games.getGames());
			return;
		}
		catch (error) {
			this.throwServerError(error);
			return;
		}
	}

	private registerGame(game: PlayableGame, gameForm: any, editing: boolean) {
		game.commandLine = [ gameForm.executable ];
		if (gameForm.arguments)
			game.commandLine.push(gameForm.arguments);
		game.details.rating = parseInt(game.details.rating);
		game.details.genres = game.details.genres.split(', ');
		game.details.releaseDate = moment(game.details.date, 'DD/MM/YYYY').unix() * 1000;
		if (!editing && game.source == GameSource.STEAM)
			game.details.steamId = parseInt(game.commandLine[1].match(/\d+/g)[0]);
		delete game.details.name;
		delete game.details.date;
		delete game.details.executable;
		delete game.details.arguments;
		logger.info('Server', `Game form data for ${game.name} being formatted.`);

		if (!editing && game.source === GameSource.STEAM) {
			getGamePlayTime(this.vitrineConfig.steam.userId, game.details.steamId).then((timePlayed: number) => {
				game.timePlayed = timePlayed;
				this.ensureRegisteredGame(game, gameForm, editing);
			}).catch((error: Error) => this.throwServerError(error));
		}
		else
			this.ensureRegisteredGame(game, gameForm, editing);
	}

	private ensureRegisteredGame(game: PlayableGame, gameForm: any, editing: boolean) {
		let gameDirectory: string = path.resolve(getEnvFolder('games'), game.uuid);
		let configFilePath: string = path.resolve(gameDirectory, 'config.json');
		if (!editing && fs.existsSync(configFilePath))
			return;
		fs.ensureDirSync(gameDirectory);

		if (!isAlreadyStored(game.details.backgroundScreen, gameForm.backgroundScreen) || !isAlreadyStored(game.details.cover, gameForm.cover)) {
			let gameHash: string = randomHashedString(8);
			let backgroundPath: string = path.resolve(gameDirectory, `background.${gameHash}.jpg`);
			let coverPath: string = path.resolve(gameDirectory, `cover.${gameHash}.jpg`);
			logger.info('Server', `Creating hashed versions for background picture and cover for ${game.name}.`);

			let backgroundUrl: string = (editing) ? (gameForm.backgroundScreen)
				: (game.details.backgroundScreen.replace('t_screenshot_med', 't_screenshot_huge'));
			let coverUrl: string = (editing) ? (gameForm.cover) : (game.details.cover);
			this.downloadGamePictures(game, {backgroundUrl, backgroundPath, coverUrl, coverPath}).then(() => {
				this.sendRegisteredGame(game, configFilePath, editing);
			}).catch((error: Error) => this.throwServerError(error));
		}
		else {
			logger.info('Server', `Background picture and cover for ${game.name} already stored.`);
			this.sendRegisteredGame(game, configFilePath, editing);
		}
	}

	private async downloadGamePictures(game: PlayableGame, {backgroundUrl, backgroundPath, coverUrl, coverPath}: any): Promise<any> {
		try {
			let isStored: boolean = await downloadImage(backgroundUrl, backgroundPath);
			game.details.backgroundScreen = (isStored) ? (backgroundPath) : (game.details.backgroundScreen);
			if (game.details.steamId)
				delete game.details.screenshots;
			else
				delete game.details.background;
			try {
				let isStored: boolean = await downloadImage(coverUrl, coverPath);
				game.details.cover = (isStored) ? (coverPath) : (game.details.cover);
				if (isStored) {
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

	private sendRegisteredGame(game: PlayableGame, configFilePath: string, editing: boolean) {
		logger.info('Server', `Outputting game config file for ${game.name}.`);
		fs.outputJSON(configFilePath, game , { spaces: 2 }).then(() => {
			if (!editing && game.source !== GameSource.LOCAL)
				this.findPotentialGames();
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
		}).catch((error: Error) => {
			this.throwServerError(error);
		});
	}
}
