import { ProgressInfo } from 'builder-util-runtime';
import * as compareVersion from 'compare-versions';
import { autoUpdater, UpdateCheckResult } from 'electron-updater';
import * as fs from 'fs-extra';
import * as moment from 'moment';
import * as path from 'path';
import * as rimraf from 'rimraf';

import { getEnvFolder, isProduction, randomHashedString } from '@models/env';
import { GamesCollection } from '@models/GamesCollection';
import { PlayableGame } from '@models/PlayableGame';
import { GameSource, PotentialGame } from '@models/PotentialGame';
import { getFirstGame, getGameById, searchGame } from './api/igdbWrapper';
import { findSteamData } from './api/SteamDataFinder';
import { getSteamGamePlayTime, getSteamGamesPlayTimes } from './api/SteamPlayTimeWrapper';
import { searchBattleNetGames } from './crawlers/BattleNetCrawler';
import { searchEmulatedGames } from './crawlers/EmulatedCrawler';
import { searchOriginGames } from './crawlers/OriginCrawler';
import { getPlayableGames } from './crawlers/PlayableGamesCrawler';
import { searchSteamGames } from './crawlers/SteamCrawler';
import { launchGame } from './GameLauncher';
import { downloadGamePictures, isAlreadyStored } from './helpers';
import { logger } from './Logger';
import { potentialGamesCacher } from './PotentialGamesCacher';
import { WindowsHandler } from './WindowsHandler';

export class Server {
  private readonly windowsHandler: WindowsHandler;
  private vitrineConfig: any;
  private modulesConfig: any;
  private potentialGames: GamesCollection<PotentialGame>;
  private playableGames: GamesCollection<PlayableGame>;
  private gameLaunched: boolean;

  public constructor(config: any, private locales: any[], private vitrineConfigFilePath: string) {
    ({ modulesConfig: this.modulesConfig, vitrineConfig: this.vitrineConfig } = config);
    this.windowsHandler = new WindowsHandler();
    this.gameLaunched = false;
    this.registerEvents();
  }

  public run() {
    this.windowsHandler.run();
  }

  public registerEvents() {
    this.windowsHandler
      .listenToLoader('ready', this.loaderReady.bind(this))
      .listenToLoader('launch-client', this.windowsHandler.createClientWindow.bind(this.windowsHandler));

    this.windowsHandler
      .listenToClient('settings-asked', this.clientSettingsAsked.bind(this))
      .listenToClient('ready', this.windowsHandler.clientReady.bind(this.windowsHandler))
      .listenToClient('quit-application', this.quitApplication.bind(this))
      .listenToClient('fill-igdb-game', this.fillIgdbGame.bind(this))
      .listenToClient('search-igdb-games', this.searchIgdbGames.bind(this))
      .listenToClient('add-all-games', this.addAllPotentialGames.bind(this))
      .listenToClient('add-game', this.addGame.bind(this))
      .listenToClient('edit-game', this.editGame.bind(this))
      .listenToClient('edit-game-time-played', this.editGameTimePlayed.bind(this))
      .listenToClient('launch-game', this.launchGame.bind(this))
      .listenToClient('remove-game', this.removeGame.bind(this))
      .listenToClient('refresh-potential-games', this.findPotentialGames.bind(this))
      .listenToClient('update-settings', this.updateSettings.bind(this));
  }

  public async loaderReady() {
    if (!isProduction()) {
      this.windowsHandler.sendToLoader('no-update-found');
      return;
    }
    logger.info('Server', 'Checking for updates.');
    autoUpdater.allowPrerelease = true;
    autoUpdater.signals.progress((progress: ProgressInfo) => {
      this.windowsHandler.sendToLoader('update-progress', Math.round(progress.percent));
    });
    autoUpdater.signals.updateDownloaded(() => {
      autoUpdater.quitAndInstall(true, true);
    });
    try {
      const lastUpdate: UpdateCheckResult = await autoUpdater.checkForUpdates();
      if (compareVersion(lastUpdate.updateInfo.version, autoUpdater.currentVersion) === 1) {
        logger.info('Server', `Update ${lastUpdate.updateInfo.version} found.`);
        this.windowsHandler.sendToLoader('update-found', lastUpdate.updateInfo.version);
      } else {
        logger.info('Server', 'No updates found.');
        this.windowsHandler.sendToLoader('no-update-found');
      }
    } catch (error) {
      logger.info('Server', 'Internet is offline, aborting updates checking.');
      this.windowsHandler.sendToLoader('no-update-found');
    }
  }

  public async clientSettingsAsked() {
    this.potentialGames = new GamesCollection();
    this.playableGames = new GamesCollection();

    logger.info('Server', 'Sending configuration to client.');
    this.windowsHandler.sendToClient('init-settings', this.vitrineConfig, this.modulesConfig, this.locales);
    if (!this.vitrineConfig.firstLaunch) {
      try {
        if (this.vitrineConfig.steam) {
          const steamConfig: any = await findSteamData(this.vitrineConfig.steam);
          this.vitrineConfig.steam = {
            ...this.vitrineConfig.steam,
            ...steamConfig
          };
          await getSteamGamesPlayTimes(this.vitrineConfig.steam.userId);
        }
        this.playableGames = await getPlayableGames(this.vitrineConfig.steam);
        logger.info('Server', 'Sending playable games to client.');
        this.windowsHandler.sendToClient('add-playable-games', this.playableGames.getGames());
        this.findPotentialGames();
      } catch (error) {
        this.throwServerError(error);
      }
    } else {
      logger.info('Server', 'Vitrine first launch.');
    }
  }

  public quitApplication(mustRelaunch?: boolean) {
    this.windowsHandler.quitApplication(mustRelaunch);
  }

  public async fillIgdbGame(gameId: number) {
    try {
      this.windowsHandler.sendToClient('send-igdb-game', await getGameById(gameId, this.vitrineConfig.lang));
    } catch (error) {
      this.throwServerError(error);
    }
  }

  public async searchIgdbGames(gameName: string, resultsNb?: number) {
    try {
      this.windowsHandler.sendToClient('send-igdb-searches', gameName, await searchGame(gameName, resultsNb));
    } catch (error) {
      this.throwServerError(error);
    }
  }

  public async addAllPotentialGames() {
    try {
      await Promise.all([...this.potentialGames.getGames()].map(async (potentialGame: PotentialGame) => {
        const filledGame: any = await getFirstGame(potentialGame.name, this.vitrineConfig.lang);
        const [executable, ...args]: string[] = potentialGame.commandLine;
        filledGame.executable = executable;
        filledGame.arguments = args.join(' ');
        console.log(filledGame);
        const addedGame: PlayableGame = new PlayableGame(filledGame.name, filledGame);
        console.log(addedGame);
        addedGame.source = potentialGame.source;
        delete filledGame.source;
        delete filledGame.id;
        const game: PlayableGame = await Server.registerGame(addedGame, filledGame);
        logger.info('Server', `Outputting game config file for ${game.name}.`);
        const configFilePath: string = path.resolve(path.resolve(getEnvFolder('games'), game.uuid), 'config.json');
        await fs.outputJson(configFilePath, game, { spaces: 2 });
        logger.info('Server', `Added game ${game.name} sent to client.`);
        this.playableGames.addGame(game);
        this.playableGames.alphaSort();
        this.potentialGames.removeGame(game.uuid);
        this.potentialGames.alphaSort();
        this.windowsHandler.sendToClient('update-add-all-games-status', this.playableGames.getGames(), this.potentialGames.getGames());
      }));
    } catch (error) {
      console.log(error);
      this.throwServerError(error);
    }
  }

  public async addGame(gameForm: any) {
    logger.info('Server', `Adding ${gameForm.name} to Vitrine.`);
    const addedGame: PlayableGame = new PlayableGame(gameForm.name, gameForm);
    addedGame.source = gameForm.source;
    delete gameForm.source;
    await this.sendRegisteredGame(await Server.registerGame(addedGame, gameForm));
  }

  public async editGame(gameUuid: string, gameForm: any) {
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
    await this.sendRegisteredGame(await Server.registerGame(editedGame, gameForm, true), true);
  }

  public editGameTimePlayed(gameUuid: string, timePlayed: number) {
    const editedGame: PlayableGame = this.playableGames.getGame(gameUuid);
    editedGame.timePlayed = timePlayed;
    logger.info('Server', `Editing time played for ${editedGame.name} (${timePlayed})`);
    this.sendRegisteredGame(editedGame, true);
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
      await launchingGame.addPlayTime(secondsPlayed);
      logger.info('Server', `Adding time played ${secondsPlayed} to ${launchingGame.name} (${launchingGame.uuid}).`);
      this.windowsHandler.sendToClient('stop-game', gameUuid, launchingGame.timePlayed);
    } catch (error) {
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
    try {
      logger.info('Server', 'Beginning to search potential games.');
      this.windowsHandler.sendToClient('potential-games-search-begin');
      this.potentialGames.clear();
      await Promise.all([
        // TODO: return PotentialGames[] and refactor crawlers
        this.searchSteamGames(),
        this.searchOriginGames(),
        this.searchBattleNetGames(),
        this.searchEmulatedGames()
      ]);
      this.potentialGames.alphaSort();
      this.potentialGames.setGames(await potentialGamesCacher.cache(this.potentialGames.getGames()));
      logger.info('Server', `${this.potentialGames.size()} potential games sent to client.`);
      this.windowsHandler.sendToClient('add-potential-games', this.potentialGames.getGames());
    } catch (error) {
      this.throwServerError(error);
    }
  }

  public async updateSettings(settingsForm: any) {
    logger.info('Server', 'Updating global settings.');
    const config: any = { ...settingsForm };
    let firstTimeSteam: boolean = false;
    if (settingsForm.steam && !this.modulesConfig.steam.userId) {
      firstTimeSteam = true;
    }
    try {
      await fs.outputJson(this.vitrineConfigFilePath, config, { spaces: 2 });
      logger.info('Server', 'Settings outputted to vitrine_config.json.');
      this.vitrineConfig = config;
      if (firstTimeSteam) {
        const steamConfig: any = await findSteamData(this.vitrineConfig.steam);
        this.vitrineConfig.steam = {
          ...this.vitrineConfig.steam,
          ...steamConfig
        };
        await getSteamGamesPlayTimes(this.vitrineConfig.steam.userId);
      }
      this.windowsHandler.sendToClient('settings-updated', this.vitrineConfig);
      this.findPotentialGames();
    } catch (error) {
      this.throwServerError(error);
    }
  }

  private async searchSteamGames() {
    if (!this.vitrineConfig.steam) {
      return;
    }
    const games: GamesCollection<PotentialGame> = await searchSteamGames(
      {
        ...this.modulesConfig.steam,
        ...this.vitrineConfig.steam
      },
      this.playableGames.getGamesFromSource(GameSource.STEAM)
    );
    logger.info('Server', 'Adding potential Steam games to potential games list.');
    this.potentialGames.addGames(games.getGames());
  }

  private async searchOriginGames() {
    if (!this.vitrineConfig.origin) {
      return;
    }
    const games: GamesCollection<PotentialGame> = await searchOriginGames(
      {
        ...this.modulesConfig.origin,
        ...this.vitrineConfig.origin
      },
      this.playableGames.getGamesFromSource(GameSource.ORIGIN)
    );
    logger.info('Server', 'Adding potential Origin games to potential games list.');
    this.potentialGames.addGames(games.getGames());
  }

  private async searchBattleNetGames() {
    if (!this.vitrineConfig.battleNet) {
      return;
    }
    const games: GamesCollection<PotentialGame> = await searchBattleNetGames({
      ...this.modulesConfig.battleNet,
      ...this.vitrineConfig.battleNet
    });
    logger.info('Server', 'Adding potential Battle.net games to potential games list.');
    this.potentialGames.addGames(games.getGames());
  }

  private async searchEmulatedGames() {
    if (!this.vitrineConfig.emulated) {
      return;
    }
    const games: GamesCollection<PotentialGame> = await searchEmulatedGames(
      {
        ...this.modulesConfig.emulated,
        ...this.vitrineConfig.emulated
      },
      this.playableGames.getGamesFromSource(GameSource.EMULATED)
    );
    logger.info('Server', 'Adding potential emulated games to potential games list.');
    this.potentialGames.addGames(games.getGames());
  }

  private static async registerGame(game: PlayableGame, gameForm: any, editing: boolean = false) {
    game.commandLine = gameForm.arguments ? [gameForm.executable, gameForm.arguments] : [gameForm.executable];
    game.details.rating = parseInt(game.details.rating);
    if (typeof game.details.genres === 'string') {
      game.details.genres = game.details.genres.split(', ');
    }
    game.details.releaseDate = moment(game.details.date, 'DD/MM/YYYY').unix() * 1000;
    if (game.source === GameSource.STEAM) {
      game.details.steamId = parseInt(game.commandLine[1].match(/\d+/g)[0]);
    }
    delete game.details.name;
    delete game.details.date;
    delete game.details.executable;
    delete game.details.arguments;
    if (!editing && game.source === GameSource.STEAM) {
      game.timePlayed = getSteamGamePlayTime(game.details.steamId);
    }

    logger.info('Server', `Game form data for ${game.name} being formatted.`);
    const gameDirectory: string = path.resolve(getEnvFolder('games'), game.uuid);
    const configFilePath: string = path.resolve(gameDirectory, 'config.json');
    if (!editing && (await fs.pathExists(configFilePath))) {
      return;
    }
    await fs.ensureDir(gameDirectory);

    if (!isAlreadyStored(game.details.backgroundScreen, gameForm.backgroundScreen) || !isAlreadyStored(game.details.cover, gameForm.cover)) {
      const gameHash: string = randomHashedString(8);
      const backgroundPath: string = path.resolve(gameDirectory, `background.${gameHash}.jpg`);
      const coverPath: string = path.resolve(gameDirectory, `cover.${gameHash}.jpg`);
      logger.info('Server', `Creating hashed versions for background picture and cover for ${game.name}.`);

      const backgroundUrl: string = editing
        ? gameForm.backgroundScreen
        : game.details.backgroundScreen
          ? game.details.backgroundScreen.replace('t_screenshot_med', 't_screenshot_huge')
          : null;
      const coverUrl: string = editing ? gameForm.cover : game.details.cover;
      const images: any = await downloadGamePictures(game.details, {
        backgroundPath,
        backgroundUrl,
        coverPath,
        coverUrl
      });
      delete game.details.screenshots;
      delete game.details.background;
      game.details = { ...game.details, ...images };
    } else {
      logger.info('Server', `Background picture and cover for ${game.name} already stored.`);
    }
    return game;
  }

  private async sendRegisteredGame(game: PlayableGame, editing: boolean = false) {
    logger.info('Server', `Outputting game config file for ${game.name}.`);
    const configFilePath: string = path.resolve(path.resolve(getEnvFolder('games'), game.uuid), 'config.json');
    await fs.outputJson(configFilePath, game, { spaces: 2 });
    if (!editing) {
      logger.info('Server', `Added game ${game.name} sent to client.`);
      this.playableGames.addGame(game);
      this.windowsHandler.sendToClient('add-playable-game', game);
    } else {
      logger.info('Server', `Edited game ${game.name} sent to client.`);
      this.playableGames.editGame(game);
      this.windowsHandler.sendToClient('edit-playable-game', game);
    }
    if (!editing && game.source !== GameSource.LOCAL) {
      this.findPotentialGames();
    }
  }

  private throwServerError(error: Error) {
    logger.info('Server', `An error happened: ${error.message}`);
    this.windowsHandler.sendToClient('error', error.name, error.stack);
  }
}
