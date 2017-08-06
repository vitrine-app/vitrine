import * as fs from 'fs';
import * as path from 'path';
import { app, BrowserWindow, ipcMain } from 'electron';

import { GamesCollection } from '../models/GamesCollection';
import { PotentialGame } from '../models/PotentialGame';
import { PlayableGame } from '../models/PlayableGame';
import { getGameLauncher } from './GameLauncher';
import { getSteamCrawler } from './games/SteamGamesCrawler';
import { getPlayableGamesCrawler } from './games/PlayableGamesCrawler';
import { getIgdbWrapper } from './api/IgdbWrapper';
import { downloadFile, getEnvFolder, uuidV5 } from './helpers';

export class Vitrine {
	private windowsList;
	private mainEntryPoint: string;
	private devTools: boolean;
	private iconPath: string;
	private potentialGames: GamesCollection<PotentialGame>;
	private playableGames: GamesCollection<PlayableGame>;

	constructor() {
		this.windowsList = {};
		this.mainEntryPoint = path.resolve('file://', __dirname, 'main.html');
		this.iconPath = path.resolve(__dirname, '../build/icon.png');
		this.devTools = false;
	}

	public run(devTools?: boolean) {
		if (devTools)
			this.devTools = devTools;

		app.on('ready', () => {
			this.createLoadingWindow();
			this.createMainWindow();
		});
		app.on('window-all-closed', () => {
			if (process.platform !== 'darwin') {
				app.quit();
			}
		});
		app.on('activate', () => {
			if (this.windowsList.mainWindow === null) {
				this.createMainWindow();
			}
		});

	}

	public registerEvents() {
		ipcMain.on('client.ready', (event) => {
			console.log('Client is ready');
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
		});
		ipcMain.on('client.get-game', (event, gameName) => {
			getIgdbWrapper(gameName).then((game) => {
				event.sender.send('server.send-game', game);
			}).catch((error) => {
				event.sender.send('server.send-game-error', error);
			});
		});
		ipcMain.on('client.add-game', (event, gameId) => {
			this.potentialGames.getGame(gameId, (error, potentialSteamGame) => {
				if (error)
					throw new Error(error);
				let gameDirectory = path.resolve(getEnvFolder('games'), potentialSteamGame.uuid);
				let configFilePath = path.resolve(gameDirectory, 'config.json');

				if (fs.existsSync(configFilePath))
					return;
				fs.mkdirSync(gameDirectory);

				let addedGame: any = PlayableGame.toPlayableGame(potentialSteamGame);
				let screenPath = path.resolve(gameDirectory, 'background.jpg');
				let coverPath = path.resolve(gameDirectory, 'cover.jpg');

				downloadFile(addedGame.details.cover, coverPath, true, () => {
					addedGame.details.cover = coverPath;
					downloadFile(addedGame.details.screenshots[0].replace('t_screenshot_med', 't_screenshot_huge'), screenPath, true,() => {
						addedGame.details.backgroundScreen = screenPath;
						delete addedGame.details.screenshots;
						fs.writeFile(configFilePath, JSON.stringify(addedGame, null, 2), (err) => {
							if (err)
								throw err;
							event.sender.send('server.remove-potential-game', potentialSteamGame.uuid);
							event.sender.send('server.add-playable-game', addedGame);
							this.playableGames.addGame(addedGame);
						});
					});
				});
			});
		});
		ipcMain.on('client.launch-game', (event, gameId) => {
			this.playableGames.getGame(gameId, (error, game: PlayableGame) => {
				if (error)
					throw new Error(error);
				if (game.uuid !== uuidV5(game.name))
					throw new Error('Hashed codes do\'nt match. Your game is probably corrupted.');
				getGameLauncher(game).then((secondsPlayed: number) => {
					console.log('You played', secondsPlayed, 'seconds.');
					game.addPlayTime(secondsPlayed);
					event.sender.send('server.stop-game', true);
				}).catch((error) => {
					if (error)
						throw new Error(error);
				});
			});
		});
	}

	private createLoadingWindow() {
		this.windowsList.loadingWindow = new BrowserWindow({
			height: 300,
			width: 500,
			frame: false
		});
	}

	private createMainWindow() {
		this.windowsList.mainWindow = new BrowserWindow({
			width: 800,
			height: 600,
			minWidth: 800,
			minHeight: 500,
			icon: this.iconPath,
			show: false
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
}
