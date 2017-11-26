import * as fs from 'fs-extra';
import * as path from 'path';
import { app, BrowserWindow, Tray, Menu, ipcMain, screen } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as rimraf from 'rimraf';
import * as moment from 'moment';

import { GamesCollection } from '../models/GamesCollection';
import { GameSource, PotentialGame } from '../models/PotentialGame';
import { PlayableGame} from '../models/PlayableGame';
import { getEnvFolder, uuidV5 } from '../models/env';
import { getGameLauncher } from './GameLauncher';
import { getSteamCrawler } from './games/SteamGamesCrawler';
import { getPlayableGamesCrawler } from './games/PlayableGamesCrawler';
import { getEmulatedGamesCrawler } from './games/EmulatedGamesCrawler';
import { getOriginCrawler } from './games/OriginGamesCrawler';
import { getIgdbWrapperFiller, getIgdbWrapperSearcher } from './api/IgdbWrapper';
import { getSteamUserFinder } from './api/SteamUserFinder';
import { getSteamPlayTimeWrapper } from './api/SteamPlayTimeWrapper';
import { downloadImage, randomHashedString } from './helpers';

export class VitrineServer {
	private windowsList: any;
	private mainEntryPoint: string;
	private loadingEntryPoint: string;
	private tray: Tray;
	private devTools: boolean;
	private iconPath: string;
	private potentialGames: GamesCollection<PotentialGame>;
	private playableGames: GamesCollection<PlayableGame>;
	private gameLaunched: boolean;
	private appQuit: boolean;

	public constructor(private vitrineConfig?: any, private vitrineConfigFilePath?: string) {
		this.windowsList = {};
		this.mainEntryPoint = path.resolve('file://', __dirname, 'main.html');
		this.loadingEntryPoint = path.resolve('file://', __dirname, 'loading.html');
		this.iconPath = path.resolve(__dirname, 'img', 'vitrine.ico');
		this.devTools = false;
		this.gameLaunched = false;
		this.appQuit = false;
	}

	public run(devTools?: boolean) {
		if (devTools)
			this.devTools = devTools;
		if (app.makeSingleInstance(this.restoreAndFocus.bind(this))) {
			this.quitApplication();
			return;
		}
		app.on('ready', this.runVitrine.bind(this));
		app.on('window-all-closed', () => {
			if (process.platform !== 'darwin')
				this.quitApplication();
		});
		app.on('activate', () => {
			if (!this.windowsList.mainWindow)
				this.createMainWindow();
		});
	}

	public registerEvents() {
		ipcMain.on('client.ready', this.clientReady.bind(this))
			.on('client.quit-application', this.quitApplication.bind(this))
			.on('client.update-app', this.updateApp.bind(this))
			.on('client.fill-igdb-game', this.fillIgdbGame.bind(this))
			.on('client.search-igdb-games', this.searchIgdbGames.bind(this))
			.on('client.add-game', this.addGame.bind(this))
			.on('client.edit-game', this.editGame.bind(this))
			.on('client.launch-game', this.launchGame.bind(this))
			.on('client.remove-game', this.removeGame.bind(this))
			.on('client.refresh-potential-games', this.findPotentialGames.bind(this))
			.on('client.update-settings', this.updateSettings.bind(this));
	}

	public throwServerError(event: any, error: Error) {
		return event.sender.send('server.error', error.name, error.stack);
	}

	private clientReady(event: Electron.Event) {
		this.potentialGames = new GamesCollection();
		this.playableGames = new GamesCollection();

		if (this.vitrineConfig) {
			if (this.vitrineConfig.steam) {
				getSteamUserFinder(this.vitrineConfig.steam).then((steamUser: any) => {
					Object.assign(this.vitrineConfig.steam, steamUser);
				}).catch((error: Error) => {
					return this.throwServerError(event, error);
				});
			}

			getPlayableGamesCrawler().then((games: GamesCollection<PlayableGame>) => {
				this.playableGames = games;
				event.sender.send('server.add-playable-games', this.playableGames.games);
				this.findPotentialGames(event);
				this.windowsList.loadingWindow.destroy();
				this.windowsList.mainWindow.show();
			}).catch((error: Error) => {
				return this.throwServerError(event, error);
			});
		}
		else {
			event.sender.send('server.first-launch');
			this.windowsList.loadingWindow.destroy();
			this.windowsList.mainWindow.show();
		}
	}

	private quitApplication(event?: Electron.Event, mustRelaunch?: boolean) {
		if (mustRelaunch)
			app.relaunch();
		this.appQuit = true;
		if (this.tray)
			this.tray.destroy();
		app.quit();
	}

	private updateApp() {
		autoUpdater.quitAndInstall(true, true);
	}

	private handleUpdates() {
		autoUpdater.allowPrerelease = true;
		autoUpdater.signals.progress((progress: any) => {
			this.windowsList.mainWindow.webContents.send('server.update-progress', progress)
		});
		autoUpdater.signals.updateDownloaded((version) => {
			this.windowsList.mainWindow.webContents.send('server.update-downloaded', version.version)
		});
		autoUpdater.checkForUpdates();
	}

	private restoreAndFocus() {
		if (this.windowsList.mainWindow) {
			this.windowsList.mainWindow.show();
			if (this.windowsList.mainWindow.isMinimized())
				this.windowsList.mainWindow.restore();
			this.windowsList.mainWindow.focus();
		}
	}

	private fillIgdbGame(event: Electron.Event, gameId: number) {
		getIgdbWrapperFiller(gameId, this.vitrineConfig.lang).then((game) => {
			event.sender.send('server.send-igdb-game', game);
		}).catch((error: Error) => {
			this.throwServerError(event, error);
		});
	}

	private searchIgdbGames(event: Electron.Event, gameName: string, resultsNb?: number) {
		getIgdbWrapperSearcher(gameName, resultsNb).then((games: any) => {
			event.sender.send('server.send-igdb-searches', gameName, games);
		}).catch((error: Error) => {
			event.sender.send('server.server-error', error);
		})
	}

	private addGame(event: Electron.Event, gameForm: any) {
		let gameName: string = gameForm.name;
		let addedGame: PlayableGame = new PlayableGame(gameName, gameForm);
		addedGame.source = gameForm.source;

		this.registerGame(event, addedGame, gameForm, false);
	}

	private editGame(event: Electron.Event, gameUuid: string, gameForm: any) {
		this.playableGames.getGame(gameUuid).then((editedGame: PlayableGame) => {
			editedGame.name = gameForm.name;
			editedGame.commandLine = [];
			editedGame.details = gameForm;

			this.registerGame(event, editedGame, gameForm, true);
		}).catch((error: Error) => {
			return this.throwServerError(event, error);
		});
	}

	private launchGame(event: Electron.Event, gameUuid: string) {
		this.playableGames.getGame(gameUuid).then((launchingGame: PlayableGame) => {
			if (launchingGame.uuid !== uuidV5(launchingGame.name))
				return this.throwServerError(event, new Error('Hashed codes don\'t match. Your game is probably corrupted.'));
			if (this.gameLaunched)
				return;
			this.gameLaunched = true;
			getGameLauncher(launchingGame).then((secondsPlayed: number) => {
				this.gameLaunched = false;
				console.log('You played', secondsPlayed, 'seconds.');
				launchingGame.addPlayTime(secondsPlayed, (error) => {
					return this.throwServerError(event, error);
				});
				event.sender.send('server.stop-game', gameUuid, launchingGame.timePlayed);
			}).catch((error: Error) => {
				this.gameLaunched = false;
				return this.throwServerError(event, error);
			});
		}).catch((error: Error) => {
			return this.throwServerError(event, error);
		});
	}

	private removeGame(event: Electron.Event, gameUuid: string) {
		this.playableGames.removeGame(gameUuid, (error) => {
			if (error)
				event.sender.send('server.server-error', error);
			let gameDirectory: string = path.resolve(getEnvFolder('games'), gameUuid);
			rimraf(gameDirectory, () => {
				event.sender.send('server.remove-playable-game', gameUuid);
			});
		});
	}

	private findPotentialGames(event: Electron.Event) {
		this.potentialGames.games = [];
		this.searchSteamGames(event)
			.then(this.searchOriginGames.bind(this, event))
			.then(this.searchEmulatedGames.bind(this, event))
			.then(() => {
				event.sender.send('server.add-potential-games', this.potentialGames.games);
			});
	}

	private updateSettings(event: Electron.Event, settingsForm: any) {
		let config: any = {
			lang: settingsForm.lang
		};
		if (settingsForm.steamPath) {
			config.steam = {
				installFolder: settingsForm.steamPath,
				gamesFolders: [
					'~steamapps'
				],
				launchCommand: 'steam://run/%id'
			};
		}
		if (settingsForm.originPath) {
			config.origin = {
				installFolder: settingsForm.originPath,
				configFile: '%appdata%/Origin/local.xml',
				regHive: 'HKLM',
				regKey: '\\Software\\Microsoft\\Windows\\CurrentVersion\\GameUX\\Games'
			};
		}
		fs.outputJSON(this.vitrineConfigFilePath, config, {
			spaces: 2
		}).then(() => {
			this.vitrineConfig = config;
			event.sender.send('server.settings-updated', this.vitrineConfig);
		}).catch((error: Error) => {
			return this.throwServerError(event, error);
		});
	}

	private searchSteamGames(event: Electron.Event): Promise<any> {
		return new Promise((resolve) => {
			if (!this.vitrineConfig.steam) {
				resolve();
				return;
			}
			getSteamCrawler(this.vitrineConfig.steam, this.playableGames.games).then((games: GamesCollection<PotentialGame>) => {
				this.potentialGames.addGames(games, () => {
					resolve();
				});
			}).catch((error: Error) => {
				resolve();
				return this.throwServerError(event, error);
			});
		});
	}

	private searchOriginGames(event: Electron.Event): Promise<any> {
		return new Promise((resolve) => {
			if (!this.vitrineConfig.origin) {
				resolve();
				return;
			}
			getOriginCrawler(this.vitrineConfig.origin, this.playableGames.games).then((games: GamesCollection<PotentialGame>) => {
				this.potentialGames.addGames(games, () => {
					resolve();
				});
			}).catch((error: Error) => {
				resolve();
				return this.throwServerError(event, error);
			});
		});
	}

	private searchEmulatedGames(event: Electron.Event): Promise<any> {
		return new Promise((resolve) => {
			if (!this.vitrineConfig.emulated) {
				resolve();
				return;
			}
			getEmulatedGamesCrawler(this.vitrineConfig.emulated, this.playableGames.games).then((games: GamesCollection<PotentialGame>) => {
				this.potentialGames.addGames(games, () => {
					resolve();
				});
			}).catch((error: Error) => {
				resolve();
				return this.throwServerError(event, error);
			});
		});
	}

	private runVitrine() {
		this.createTrayIcon();
		this.createLoadingWindow();
		this.handleUpdates();
		this.createMainWindow();
	}

	private createTrayIcon() {
		this.tray = new Tray(this.iconPath);
		this.tray.setTitle('Vitrine');
		this.tray.setToolTip('Vitrine');
		this.tray.setContextMenu(Menu.buildFromTemplate([
			{
				label: 'Show',
				type: 'normal',
				click: this.restoreAndFocus.bind(this)
			},
			{
				label: 'Quit',
				type: 'normal',
				click: this.quitApplication.bind(this)
			}
		]));
		this.tray.on('double-click', this.restoreAndFocus.bind(this));
	}

	private createLoadingWindow() {
		this.windowsList.loadingWindow = new BrowserWindow({
			height: 400,
			width: 700,
			icon: this.iconPath,
			frame: false
		});
		this.windowsList.loadingWindow.loadURL(this.loadingEntryPoint);
	}

	private createMainWindow() {
		if (!screen)
			return;
		const { width, height } = screen.getPrimaryDisplay().workAreaSize;
		this.windowsList.mainWindow = new BrowserWindow({
			minWidth: width,
			minHeight: height,
			icon: this.iconPath,
			show: false,
			frame: false,
			width,
			height
		});
		this.windowsList.mainWindow.setMenu(null);
		this.windowsList.mainWindow.maximize();
		this.windowsList.mainWindow.loadURL(this.mainEntryPoint);
		this.windowsList.mainWindow.hide();
		if (this.devTools)
			this.windowsList.mainWindow.webContents.openDevTools();

		this.windowsList.mainWindow.on('close', (event: Event) => {
			if (!this.appQuit) {
				event.preventDefault();
				this.windowsList.mainWindow.hide();
			}
			else
				delete this.windowsList.mainWindow;
		});

	}

	private registerGame(event: Electron.Event, game: PlayableGame, gameForm: any, editing: boolean) {
		game.commandLine = [
			gameForm.executable,
		];
		if (gameForm.arguments)
			game.commandLine.push(gameForm.arguments);
		game.details.rating = parseInt(game.details.rating);
		game.details.genres = game.details.genres.split(', ');
		game.details.releaseDate = moment(game.details.date, 'DD/MM/YYYY').unix();
		if (!editing && game.source == GameSource.STEAM)
			game.details.steamId = parseInt(game.commandLine[1].match(/\d+/g)[0]);
		delete game.details.name;
		delete game.details.date;
		delete game.details.executable;
		delete game.details.arguments;

		let gameDirectory: string = path.resolve(getEnvFolder('games'), game.uuid);
		let configFilePath: string = path.resolve(gameDirectory, 'config.json');

		if (!editing && fs.existsSync(configFilePath))
			return;
		fs.ensureDirSync(gameDirectory);

		let gameHash: string = randomHashedString(8);
		let backgroundPath: string = path.resolve(gameDirectory, `background.${gameHash}.jpg`);
		let coverPath: string = path.resolve(gameDirectory, `cover.${gameHash}.jpg`);
		let backgroundScreen: string = game.details.backgroundScreen.replace('t_screenshot_med', 't_screenshot_huge');

		let backgroundUrl: string = (editing) ? (gameForm.backgroundScreen) : (backgroundScreen);
		let coverUrl: string = (editing) ? (gameForm.cover) : (game.details.cover);
		this.downloadGamePictures(event, configFilePath, game, {backgroundUrl, backgroundPath, coverUrl, coverPath}, editing);
	}

	private downloadGamePictures(event: Electron.Event, configFilePath: string, game: PlayableGame, {backgroundUrl, backgroundPath, coverUrl, coverPath}: any, editing: boolean) {
		downloadImage(coverUrl, coverPath).then((isStored: boolean) => {
			game.details.cover = (isStored) ? (coverPath) : (game.details.cover);
			downloadImage(backgroundUrl, backgroundPath).then((isStored: boolean) => {
				game.details.backgroundScreen = (isStored) ? (backgroundPath) : (game.details.backgroundScreen);
				if (game.details.steamId)
					delete game.details.screenshots;
				else
					delete game.details.background;

				if (!editing && game.source === GameSource.STEAM) {
					getSteamPlayTimeWrapper(this.vitrineConfig.steam, game).then((timedGame: PlayableGame) => {
						this.handleRegisteredGame(event, timedGame, configFilePath, editing);
					}).catch((error: Error) => {
						return this.throwServerError(event, error);
					});
				}
				else
					this.handleRegisteredGame(event, game, configFilePath, editing);

			}).catch((error: Error) => {
				return this.throwServerError(event, error);
			});
		}).catch((error: Error) => {
			return this.throwServerError(event, error);
		});
	}

	private handleRegisteredGame(event: any, game: PlayableGame, configFilePath: string, editing: boolean) {
		fs.outputJSON(configFilePath, game , {
			spaces: 2
		}).then(() => {
			if (!editing && game.source !== GameSource.LOCAL)
				this.findPotentialGames(event);
			if (!editing) {
				event.sender.send('server.add-playable-game', game);
				this.playableGames.addGame(game);
			}
			else {
				this.playableGames.editGame(game, () => {
					event.sender.send('server.edit-playable-game', game);
				});
			}
		}).catch((error: Error) => {
			return this.throwServerError(event, error);
		});
	}
}
