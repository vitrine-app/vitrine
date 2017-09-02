import * as fs from 'fs-extra';
import * as path from 'path';
import { app, BrowserWindow, ipcMain, screen } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as rimraf from 'rimraf';
import { sync as mkDir } from 'mkdirp';
import * as moment from 'moment';

import { GamesCollection } from '../models/GamesCollection';
import { GameSource, PotentialGame } from '../models/PotentialGame';
import { PlayableGame} from '../models/PlayableGame';
import { getGameLauncher } from './GameLauncher';
import { getSteamCrawler } from './games/SteamGamesCrawler';
import { getPlayableGamesCrawler } from './games/PlayableGamesCrawler';
import { getIgdbWrapperFiller, getIgdbWrapperSearcher } from './api/IgdbWrapper';
import { downloadImage, getGamesFolder, uuidV5 } from './helpers';

export class VitrineServer {
	private windowsList;
	private mainEntryPoint: string;
	private loadingEntryPoint: string;
	private devTools: boolean;
	private iconPath: string;
	private potentialGames: GamesCollection<PotentialGame>;
	private playableGames: GamesCollection<PlayableGame>;
	private gameLaunched: boolean;

	public constructor() {
		this.windowsList = {};
		this.mainEntryPoint = path.resolve('file://', __dirname, 'main.html');
		this.loadingEntryPoint = path.resolve('file://', __dirname, 'loading.html');
		this.iconPath = path.resolve(__dirname, 'img', 'vitrine.ico');
		this.devTools = false;
		this.gameLaunched = false;
	}

	public run(devTools?: boolean) {
		if (devTools)
			this.devTools = devTools;

		app.on('ready', () => {
			this.createLoadingWindow();
			this.handleUpdates();
			this.createMainWindow();
		});
		app.on('window-all-closed', () => {
			if (process.platform !== 'darwin') {
				app.quit();
			}
		});
		app.on('activate', () => {
			if (!this.windowsList.mainWindow)
				this.createMainWindow();
		});
	}

	public registerEvents() {
		ipcMain.on('client.ready', this.ready.bind(this));
		ipcMain.on('client.update-app', this.updateApp.bind(this));
		ipcMain.on('client.fill-igdb-game', this.fillIgdbGame.bind(this));
		ipcMain.on('client.search-igdb-games', this.searchIgdbGames.bind(this));
		ipcMain.on('client.add-game', this.addGame.bind(this));
		ipcMain.on('client.edit-game-manual', this.editGame.bind(this));
		ipcMain.on('client.launch-game', this.launchGame.bind(this));
		ipcMain.on('client.remove-game', this.removeGame.bind(this));
	}

	private ready(event: Electron.Event) {
		this.potentialGames = new GamesCollection();
		this.playableGames = new GamesCollection();


		getPlayableGamesCrawler().then((games: GamesCollection<PlayableGame>) => {
			this.playableGames = games;
			this.searchSteamGames(event);
			event.sender.send('server.add-playable-games', this.playableGames.games);
			this.windowsList.loadingWindow.destroy();
			this.windowsList.mainWindow.show();
		}).catch((error) => {
			throw error;
		});
	}

	private updateApp(event: Electron.Event) {
		autoUpdater.quitAndInstall(true, true);
	}

	private handleUpdates() {
		autoUpdater.allowPrerelease = true;
		autoUpdater.signals.progress((progress) => {
			this.windowsList.mainWindow.webContents.send('server.update-progress', progress)
		});
		autoUpdater.signals.updateDownloaded((version) => {
			this.windowsList.mainWindow.webContents.send('server.update-downloaded', version.version)
		});
		autoUpdater.checkForUpdates();
	}

	private fillIgdbGame(event: Electron.Event, gameId: number) {
		getIgdbWrapperFiller(gameId).then((game) => {
			event.sender.send('server.send-igdb-game', null, game);
		}).catch((error) => {
			event.sender.send('server.send-igdb-game', error, null);
		});
	}

	private searchIgdbGames(event: Electron.Event, gameName: string, resultsNb?: number) {
		getIgdbWrapperSearcher(gameName, resultsNb).then((games: any) => {
			event.sender.send('server.send-igdb-searches', null, games);
		}).catch((error) => {
			event.sender.send('server.send-igdb-searches', error, null);
		})
	}

	private addGame(event: Electron.Event, gameForm: any) {
		let gameName: string = gameForm.name;
		let addedGame: PlayableGame = new PlayableGame(gameName, gameForm);
		addedGame.source = gameForm.source;

		this.registerGame(event, addedGame, gameForm, false);
	}

	private editGame(event: Electron.Event, gameId: string, gameForm: any) {
		this.playableGames.getGame(gameId).then((editedGame: PlayableGame) => {
			editedGame.name = gameForm.name;
			editedGame.commandLine = [];
			editedGame.details = gameForm;

			this.registerGame(event, editedGame, gameForm, true);
		}).catch((error) => {
			if (error)
				throw new Error(error);
		});
	}

	private launchGame(event: Electron.Event, gameId: string)  {
		this.playableGames.getGame(gameId).then((game: PlayableGame) => {
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
			let gameDirectory: string = path.resolve(getGamesFolder(), gameId);
			rimraf(gameDirectory, () => {
				event.sender.send('server.remove-playable-game', error, gameId);
			});
		});
	}

	private searchSteamGames(event: Electron.Event) {
		getSteamCrawler(this.playableGames.games).then((games: GamesCollection<PotentialGame>) => {
			this.potentialGames = games;
			event.sender.send('server.add-potential-games', this.potentialGames.games);
		}).catch((error) => {
			throw error;
		});
	}

	private createLoadingWindow() {
		this.windowsList.loadingWindow = new BrowserWindow({
			height: 300,
			width: 500,
			frame: false
		});
		this.windowsList.loadingWindow.loadURL(this.loadingEntryPoint);
	}

	private createMainWindow() {
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
		if (this.devTools)
			this.windowsList.mainWindow.webContents.openDevTools();

		this.windowsList.mainWindow.on('closed', () => {
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
		mkDir(gameDirectory);

		let screenPath: string = path.resolve(gameDirectory, 'background.jpg');
		let coverPath: string = path.resolve(gameDirectory, 'cover.jpg');
		let backgroundScreen: string = game.details.background.replace('t_screenshot_med', 't_screenshot_huge');

		downloadImage(game.details.cover, coverPath).then(() => {
			game.details.cover = coverPath;
			downloadImage(backgroundScreen, screenPath).then(() => {
				game.details.backgroundScreen = screenPath;
				if (game.details.steamId)
					delete game.details.screenshots;
				else
					delete game.details.background;
				fs.writeFileSync(configFilePath, JSON.stringify(game, null, 2));
				if (!editing && game.source !== GameSource.LOCAL)
					this.searchSteamGames(event);
				if (!editing) {
					event.sender.send('server.add-playable-game', game);
					this.playableGames.addGame(game);
				}
				else {
					event.sender.send('server.edit-playable-game', game);
					this.playableGames.editGame(game);
				}
			}).catch((error: Error) => {
				throw error;
			});
		}).catch((error: Error) => {
			throw error;
		});
	}

	private static throwServerError(event: any, error: string | Error) {
		return event.sender.send('server.server-error', error);
	}
}
