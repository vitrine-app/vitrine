import * as fs from 'fs-extra';
import * as path from 'path';
import { app, BrowserWindow, Tray, Menu, ipcMain, screen } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as rimraf from 'rimraf';
import * as moment from 'moment';

import { GamesCollection } from '../models/GamesCollection';
import { GameSource, PotentialGame } from '../models/PotentialGame';
import { PlayableGame} from '../models/PlayableGame';
import { getGamesFolder, uuidV5 } from '../models/env';
import { getGameLauncher } from './GameLauncher';
import { getSteamCrawler } from './games/SteamGamesCrawler';
import { getPlayableGamesCrawler } from './games/PlayableGamesCrawler';
import { getIgdbWrapperFiller, getIgdbWrapperSearcher } from './api/IgdbWrapper';
import { downloadImage } from './helpers';
import { getOriginCrawler } from './games/OriginGamesCrawler';

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

	public constructor(private vitrineConfig?: any, private configFolderPath?: string) {
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

	public static throwServerError(event: any, error: string | Error) {
		return event.sender.send('server.server-error', error);
	}

	private clientReady(event: Electron.Event) {
		if (this.vitrineConfig) {
			this.potentialGames = new GamesCollection();
			this.playableGames = new GamesCollection();

			getPlayableGamesCrawler().then((games: GamesCollection<PlayableGame>) => {
				this.playableGames = games;
				event.sender.send('server.add-playable-games', this.playableGames.games);
				this.findPotentialGames(event);
				this.windowsList.loadingWindow.destroy();
				this.windowsList.mainWindow.show();
			}).catch((error) => {
				return VitrineServer.throwServerError(event, error);
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
		getIgdbWrapperFiller(gameId).then((game) => {
			event.sender.send('server.send-igdb-game', game);
		}).catch((error) => {
			VitrineServer.throwServerError(event, error);
		});
	}

	private searchIgdbGames(event: Electron.Event, gameName: string, resultsNb?: number) {
		getIgdbWrapperSearcher(gameName, resultsNb).then((games: any) => {
			event.sender.send('server.send-igdb-searches', gameName, games);
		}).catch((error) => {
			event.sender.send('server.server-error', error);
		})
	}

	private addGame(event: Electron.Event, gameForm: any) {
		let gameName: string = gameForm.name;
		let addedGame: PlayableGame = new PlayableGame(gameName, gameForm);
		addedGame.source = gameForm.source;

		this.registerGame(event, addedGame, gameForm, false);
	}

	private editGame(event: Electron.Event, gameId: string, gameForm: any) {
		this.playableGames.getGame(gameId).then(([editedGame]) => {
			editedGame.name = gameForm.name;
			editedGame.commandLine = [];
			editedGame.details = gameForm;

			this.registerGame(event, editedGame, gameForm, true);
		}).catch((error) => {
			return VitrineServer.throwServerError(event, error);
		});
	}

	private launchGame(event: Electron.Event, gameId: string)  {
		this.playableGames.getGame(gameId).then(([game]) => {
			if (game.uuid !== uuidV5(game.name))
				return VitrineServer.throwServerError(event, 'Hashed codes don\'t match. Your game is probably corrupted.');
			if (this.gameLaunched)
				return;
			this.gameLaunched = true;
			getGameLauncher(game).then((secondsPlayed: number) => {
				this.gameLaunched = false;
				console.log('You played', secondsPlayed, 'seconds.');
				game.addPlayTime(secondsPlayed, (error) => {
					return VitrineServer.throwServerError(event, error);
				});
				event.sender.send('server.stop-game', gameId, game.timePlayed);
			}).catch((error) => {
				this.gameLaunched = false;
				return VitrineServer.throwServerError(event, error);
			});
		}).catch((error) => {
			return VitrineServer.throwServerError(event, error);
		});
	}

	private removeGame(event: Electron.Event, gameId: string) {
		this.playableGames.removeGame(gameId, (error) => {
			if (error)
				event.sender.send('server.server-error', error);
			let gameDirectory: string = path.resolve(getGamesFolder(), gameId);
			rimraf(gameDirectory, () => {
				event.sender.send('server.remove-playable-game', gameId);
			});
		});
	}

	private findPotentialGames(event: Electron.Event) {
		this.potentialGames.games = [];
		this.searchSteamGames(() => {
			this.searchOriginGames(() => {
				event.sender.send('server.add-potential-games', this.potentialGames.games);
			});
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
		fs.outputJSON(path.resolve(this.configFolderPath, 'vitrine_config.json'), config).then(() => {
			this.vitrineConfig = config;
		}).catch((error: Error) => {
			return VitrineServer.throwServerError(event, error);
		});
	}

	private searchSteamGames(callback: Function) {
		if (!this.vitrineConfig.steam) {
			callback();
			return;
		}
		getSteamCrawler(this.vitrineConfig.steam, this.playableGames.games).then((games: GamesCollection<PotentialGame>) => {
			this.potentialGames.addGames(games, () => {
				callback();
			});
		}).catch((error) => {
			return VitrineServer.throwServerError(event, error);
		});
	}

	private searchOriginGames(callback: Function) {
		if (!this.vitrineConfig.origin) {
			callback();
			return;
		}
		getOriginCrawler(this.vitrineConfig.origin, this.playableGames.games).then((games: GamesCollection<PotentialGame>) => {
			this.potentialGames.addGames(games, () => {
				callback();
			});
		}).catch((error) => {
			return VitrineServer.throwServerError(event, error);
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
			width: width,
			height: height,
			minWidth: width,
			minHeight: height,
			icon: this.iconPath,
			show: false,
			frame: false
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

	private registerGame(event: any, game: PlayableGame, gameForm: any, editing: boolean) {
		game.commandLine.push(gameForm.executable);
		game.commandLine = game.commandLine.concat(gameForm.arguments.split(' '));
		game.details.rating = parseInt(game.details.rating);
		game.details.genres = game.details.genres.split(', ');
		game.details.releaseDate = moment(game.details.date, 'DD/MM/YYYY').unix();
		if (!editing && game.source == GameSource.STEAM)
			game.details.steamId = parseInt(game.commandLine[1].match(/\d+/g)[0]);
		delete game.details.date;
		delete game.details.arguments;

		let gameDirectory = path.resolve(getGamesFolder(), game.uuid);
		let configFilePath = path.resolve(gameDirectory, 'config.json');

		if (!editing && fs.existsSync(configFilePath))
			return;
		fs.ensureDirSync(gameDirectory);

		let screenPath: string = path.resolve(gameDirectory, 'background.jpg');
		let coverPath: string = path.resolve(gameDirectory, 'cover.jpg');
		let backgroundScreen: string = game.details.backgroundScreen.replace('t_screenshot_med', 't_screenshot_huge');

		downloadImage(game.details.cover, coverPath).then((isStored: boolean) => {
			game.details.cover = (isStored) ? (coverPath) : ('');
			downloadImage(backgroundScreen, screenPath).then((isStored: boolean) => {
				game.details.backgroundScreen = (isStored) ? (screenPath) : ('');
				if (game.details.steamId)
					delete game.details.screenshots;
				else
					delete game.details.background;
				fs.writeFileSync(configFilePath, JSON.stringify(game, null, 2));
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
				return VitrineServer.throwServerError(event, error);
			});
		}).catch((error: Error) => {
			return VitrineServer.throwServerError(event, error);
		});
	}
}
