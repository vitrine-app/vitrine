import * as fs from 'fs-extra';
import * as path from 'path';
import { ipcMain } from 'electron';
import { autoUpdater, UpdateCheckResult } from 'electron-updater';
import { ProgressInfo } from 'builder-util-runtime';
import * as rimraf from 'rimraf';
import * as moment from 'moment';

import { WindowsHandler } from './WindowsHandler';
import { GamesCollection } from '../models/GamesCollection';
import { GameSource, PotentialGame } from '../models/PotentialGame';
import { PlayableGame} from '../models/PlayableGame';
import { getEnvFolder, uuidV5 } from '../models/env';
import { launchGame } from './GameLauncher';
import { searchSteamGames } from './games/SteamGamesCrawler';
import { getPlayableGames } from './games/PlayableGamesCrawler';
import { searchEmulatedGames } from './games/EmulatedGamesCrawler';
import { searchOriginGames } from './games/OriginGamesCrawler';
import { fillIgdbGame, searchIgdbGame } from './api/IgdbWrapper';
import { findSteamUser } from './api/SteamUserFinder';
import { getGamePlayTime } from './api/SteamPlayTimeWrapper';
import { downloadImage, isAlreadyStored, randomHashedString } from './helpers';

export class VitrineServer {
	private windowsHandler: WindowsHandler;
	private emulatorsConfigFilePath: string;
	private potentialGames: GamesCollection<PotentialGame>;
	private playableGames: GamesCollection<PlayableGame>;
	private gameLaunched: boolean;

	public constructor(private vitrineConfig: any, private vitrineConfigFilePath: string, configFolderPath: string) {
		this.windowsHandler = new WindowsHandler();
		this.emulatorsConfigFilePath = path.resolve(configFolderPath, 'emulators.json');
		this.gameLaunched = false;
	}

	public run(prod?: boolean) {
		this.windowsHandler.run(!prod);
	}

	public registerEvents() {
		ipcMain.on('loader.ready', this.loaderReady.bind(this))
			.on('loader.launch-client', () => this.windowsHandler.createMainWindow())
			.on('loader.update-and-restart', this.updateApp.bind(this));

		ipcMain.on('client.settings-asked', this.clientSettingsAsked.bind(this))
			.on('client.ready', () => this.windowsHandler.clientReady())// this.clientReady.bind(this))
			.on('client.quit-application', (event: Electron.Event, mustRelaunch?: boolean) => this.windowsHandler.quitApplication(mustRelaunch))// this.quitApplication.bind(this))
			.on('client.fill-igdb-game', this.fillIgdbGame.bind(this))
			.on('client.search-igdb-games', this.searchIgdbGames.bind(this))
			.on('client.add-game', this.addGame.bind(this))
			.on('client.edit-game', this.editGame.bind(this))
			.on('client.edit-game-time-played', this.editGameTimePlayed.bind(this))
			.on('client.launch-game', this.launchGame.bind(this))
			.on('client.remove-game', this.removeGame.bind(this))
			.on('client.refresh-potential-games', this.findPotentialGames.bind(this))
			.on('client.update-settings', this.updateSettings.bind(this));
	}

	private throwServerError(event: any, error: Error) {
		return event.sender.send('server.error', error.name, error.stack);
	}

	private loaderReady(event: Electron.Event) {
		autoUpdater.allowPrerelease = true;
		autoUpdater.signals.progress((progress: ProgressInfo) => {
			event.sender.send('loaderServer.update-progress', progress);
		});
		autoUpdater.signals.updateDownloaded(() => {
			autoUpdater.quitAndInstall(true, true);
		});
		autoUpdater.checkForUpdates().then((lastUpdate: UpdateCheckResult) => {
			if (lastUpdate.updateInfo.version !== autoUpdater.currentVersion)
				event.sender.send('loaderServer.update-found', lastUpdate.updateInfo.version);
			else
				event.sender.send('loaderServer.no-update-found');
		});
	}

	private clientSettingsAsked(event: Electron.Event) {
		this.potentialGames = new GamesCollection();
		this.playableGames = new GamesCollection();

		event.sender.send('server.init-settings', this.vitrineConfig);
		if (!this.vitrineConfig.firstLaunch) {
			if (this.vitrineConfig.steam) {
				findSteamUser(this.vitrineConfig.steam).then((steamUser: any) => {
					Object.assign(this.vitrineConfig.steam, { ...steamUser });
				}).catch((error: Error) => this.throwServerError(event, error));
			}
			getPlayableGames().then((games: GamesCollection<PlayableGame>) => {
				this.playableGames = games;
				event.sender.send('server.add-playable-games', this.playableGames.games);
				this.findPotentialGames(event);
			}).catch((error: Error) => this.throwServerError(event, error));
		}
	}

	private updateApp() {
		autoUpdater.quitAndInstall(true, true);
	}

	private fillIgdbGame(event: Electron.Event, gameId: number) {
		fillIgdbGame(gameId, this.vitrineConfig.lang).then((game) => {
			event.sender.send('server.send-igdb-game', game);
		}).catch((error: Error) => {
			this.throwServerError(event, error);
		});
	}

	private searchIgdbGames(event: Electron.Event, gameName: string, resultsNb?: number) {
		searchIgdbGame(gameName, resultsNb).then((games: any) => {
			event.sender.send('server.send-igdb-searches', gameName, games);
		}).catch((error: Error) => {
			event.sender.send('server.server-error', error);
		});
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
			let { backgroundScreen, cover } = editedGame.details;
			editedGame.details = {
				...gameForm,
				backgroundScreen,
				cover
			};

			this.registerGame(event, editedGame, gameForm, true);
		}).catch((error: Error) => {
			return this.throwServerError(event, error);
		});
	}

	private editGameTimePlayed(event: Electron.Event, gameUuid: string, timePlayed: number) {
		this.playableGames.getGame(gameUuid).then((editedGame: PlayableGame) => {
			let gameDirectory: string = path.resolve(getEnvFolder('games'), editedGame.uuid);
			let configFilePath: string = path.resolve(gameDirectory, 'config.json');

			editedGame.timePlayed = timePlayed;
			this.sendRegisteredGame(event, editedGame, configFilePath, true);
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
			launchGame(launchingGame).then((secondsPlayed: number) => {
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
		if (settingsForm.emulatedPath) {
			config.emulated = {
				romsFolder: settingsForm.emulatedPath
			};
		}
		fs.outputJson(this.vitrineConfigFilePath, config, {
			spaces: 2
		}).then(() => {
			let emulatorsConfig: any = {
				...this.vitrineConfig.emulated,
				...config.emulated,
				emulators: settingsForm.emulators
			};
			if (!settingsForm.emulatedPath)
				delete emulatorsConfig.romsFolder;
			fs.outputJson(this.emulatorsConfigFilePath, emulatorsConfig.emulators, {
				spaces: 2
			}).then(() => {
				this.vitrineConfig = { ...config, emulated: emulatorsConfig };
				event.sender.send('server.settings-updated', this.vitrineConfig);
			}).catch((error: Error) => {
				return this.throwServerError(event, error);
			});
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
			searchSteamGames(this.vitrineConfig.steam, this.playableGames.games).then((games: GamesCollection<PotentialGame>) => {
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
			searchOriginGames(this.vitrineConfig.origin, this.playableGames.games).then((games: GamesCollection<PotentialGame>) => {
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
			if (!this.vitrineConfig.emulated.romsFolder) {
				resolve();
				return;
			}
			searchEmulatedGames(this.vitrineConfig.emulated, this.playableGames.games).then((games: GamesCollection<PotentialGame>) => {
				this.potentialGames.addGames(games, () => {
					resolve();
				});
			}).catch((error: Error) => {
				resolve();
				return this.throwServerError(event, error);
			});
		});
	}

	private registerGame(event: Electron.Event, game: PlayableGame, gameForm: any, editing: boolean) {
		game.commandLine = [
			gameForm.executable
		];
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

		if (!editing && game.source === GameSource.STEAM) {
			getGamePlayTime(this.vitrineConfig.steam, game.details.steamId).then((timePlayed: number) => {
				game.timePlayed = timePlayed;
				this.ensureRegisteredGame(event, game, gameForm, editing);
			}).catch((error: Error) => {
				return this.throwServerError(event, error);
			});
		}
		else
			this.ensureRegisteredGame(event, game, gameForm, editing);
	}

	private ensureRegisteredGame(event: Electron.Event, game: PlayableGame, gameForm: any, editing: boolean) {
		let gameDirectory: string = path.resolve(getEnvFolder('games'), game.uuid);
		let configFilePath: string = path.resolve(gameDirectory, 'config.json');
		if (!editing && fs.existsSync(configFilePath))
			return;
		fs.ensureDirSync(gameDirectory);

		if (!isAlreadyStored(game.details.backgroundScreen, gameForm.backgroundScreen) || !isAlreadyStored(game.details.cover, gameForm.cover)) {
			let gameHash: string = randomHashedString(8);
			let backgroundPath: string = path.resolve(gameDirectory, `background.${gameHash}.jpg`);
			let coverPath: string = path.resolve(gameDirectory, `cover.${gameHash}.jpg`);

			let backgroundUrl: string = (editing) ? (gameForm.backgroundScreen) : (game.details.backgroundScreen.replace('t_screenshot_med', 't_screenshot_huge'));
			let coverUrl: string = (editing) ? (gameForm.cover) : (game.details.cover);
			this.downloadGamePictures(game, {backgroundUrl, backgroundPath, coverUrl, coverPath}).then(() => {
				this.sendRegisteredGame(event, game, configFilePath, editing);
			}).catch((error: Error) => this.throwServerError(event, error));
		}
		else
			this.sendRegisteredGame(event, game, configFilePath, editing);
	}

	private downloadGamePictures(game: PlayableGame, {backgroundUrl, backgroundPath, coverUrl, coverPath}: any): Promise<any> {
		return new Promise((resolve, reject) => {
			downloadImage(coverUrl, coverPath).then((isStored: boolean) => {
				game.details.cover = (isStored) ? (coverPath) : (game.details.cover);
				downloadImage(backgroundUrl, backgroundPath).then((isStored: boolean) => {
					game.details.backgroundScreen = (isStored) ? (backgroundPath) : (game.details.backgroundScreen);
					if (game.details.steamId)
						delete game.details.screenshots;
					else
						delete game.details.background;

					resolve();
				}).catch((error: Error) => {
					reject(error);
				});
			}).catch((error: Error) => {
				reject(error);
			});
		});
	}

	private sendRegisteredGame(event: any, game: PlayableGame, configFilePath: string, editing: boolean) {
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
