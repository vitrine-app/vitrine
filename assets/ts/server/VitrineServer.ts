import * as fs from 'fs';
import * as path from 'path';
import { app, BrowserWindow, ipcMain, screen } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as rimraf from 'rimraf';

import { GamesCollection } from '../models/GamesCollection';
import { PotentialGame } from '../models/PotentialGame';
import { GameSource, PlayableGame} from '../models/PlayableGame';
import { getGameLauncher } from './GameLauncher';
import { getSteamCrawler } from './games/SteamGamesCrawler';
import { getPlayableGamesCrawler } from './games/PlayableGamesCrawler';
import { getIgdbWrapperFiller, getIgdbWrapperSearcher } from './api/IgdbWrapper';
import { downloadFile, getEnvFolder, getGamesFolder, uuidV5 } from './helpers';

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
		ipcMain.on('client.add-game-manual', this.addGameManual.bind(this));
		ipcMain.on('client.launch-game', this.launchGame.bind(this));
		ipcMain.on('client.remove-game', this.removeGame.bind(this));
	}

	private ready(event: Electron.Event) {
		this.potentialGames = new GamesCollection();
		this.playableGames = new GamesCollection();

		getSteamCrawler().then((games: GamesCollection<PotentialGame>) => {
			this.potentialGames = games;
			event.sender.send('server.add-potential-games', this.potentialGames.games);
		}).catch((error) => {
			throw error;
		});

		getPlayableGamesCrawler().then((games: GamesCollection<PlayableGame>) => {
			this.playableGames = games;
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

	private addGame(event: Electron.Event, gameId: string) {
		this.potentialGames.getGame(gameId, (error, potentialSteamGame) => {
			if (error)
				return this.throwServerError(event, error);
			let addedGame: PlayableGame = PlayableGame.toPlayableGame(potentialSteamGame);
			addedGame.source = GameSource.STEAM;
			delete addedGame.details.id;
			this.registerGame(event, addedGame);
		});
	}

	private addGameManual(event: Electron.Event, gameForm: any) {
		let gameName: string = gameForm.name;
		let programName: string = gameForm.executable;
		let game: PlayableGame = new PlayableGame(gameName, gameForm);
		game.source = GameSource.LOCAL;

		game.commandLine.push(programName);
		game.commandLine = game.commandLine.concat(gameForm.arguments.split(' '));
		game.details.rating = parseInt(game.details.rating);
		game.details.genres = game.details.genres.split(', ');
		game.details.releaseDate = new Date(game.details.date).getTime();

		delete game.details.date;
		delete game.details.arguments;
		this.registerGame(event, game);
	}

	private launchGame(event: Electron.Event, gameId: string)  {
		this.playableGames.getGame(gameId, (error, game: PlayableGame) => {
			if (error)
				return this.throwServerError(event, error);
			if (game.uuid !== uuidV5(game.name))
				return this.throwServerError(event, 'Hashed codes don\'t match. Your game is probably corrupted.');
			if (this.gameLaunched)
				return;
			this.gameLaunched = true;
			getGameLauncher(game).then((secondsPlayed: number) => {
				this.gameLaunched = false;
				console.log('You played', secondsPlayed, 'seconds.');
				game.addPlayTime(secondsPlayed, (error) => {
					if (error)
						return this.throwServerError(event, error);
				});
				event.sender.send('server.stop-game', gameId, game.timePlayed);
			}).catch((error) => {
				if (error)
					return this.throwServerError(event, error);
				this.gameLaunched = false;
			});
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

	private registerGame(event: any, game: PlayableGame) {
		let gameDirectory = path.resolve(getGamesFolder(), game.uuid);
		let configFilePath = path.resolve(gameDirectory, 'config.json');

		if (fs.existsSync(configFilePath))
			return;
		fs.mkdirSync(gameDirectory);

		let screenPath: string = path.resolve(gameDirectory, 'background.jpg');
		let coverPath: string = path.resolve(gameDirectory, 'cover.jpg');
		let backgroundScreen: string = (game.details.steamId) ? (game.details.screenshots[0]) : (game.details.background);

		downloadFile(game.details.cover, coverPath, true, (success: boolean) => {
			if (success)
				game.details.cover = coverPath;
			downloadFile(backgroundScreen.replace('t_screenshot_med', 't_screenshot_huge'), screenPath, true,(success: boolean) => {
				if (success)
					game.details.backgroundScreen = screenPath;
				if (game.details.steamId)
					delete game.details.screenshots;
				else
					delete game.details.background;
				fs.writeFile(configFilePath, JSON.stringify(game, null, 2), (err) => {
					if (err)
						throw err;
					if (game.details.steamId)
						event.sender.send('server.remove-potential-game', game.uuid);
					event.sender.send('server.add-playable-game', game);
					this.playableGames.addGame(game);
				});
			});
		});
	}

	private throwServerError(event: any, error: string | Error) {
		return event.sender.send('server.server-error', error);
	}
}
