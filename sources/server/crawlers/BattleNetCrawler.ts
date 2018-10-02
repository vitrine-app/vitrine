import * as fs from 'fs-extra';
import * as path from 'path';

import { GamesCollection } from '../../models/GamesCollection';
import { PlayableGame } from '../../models/PlayableGame';
import { GameSource, PotentialGame } from '../../models/PotentialGame';
import { logger } from '../Logger';
import { PotentialGamesCrawler } from './PotentialGamesCrawler';

interface BattleNetGame {
  tag: string;
  name: string;
  path?: string;
}

class BattleNetCrawler extends PotentialGamesCrawler {
  private gamesData: BattleNetGame[];
  private rootInstallPath: string;
  private foundGames: BattleNetGame[];

  public setPlayableGames(playableGames?: PlayableGame[]): this {
    super.setPlayableGames(playableGames);

    this.gamesData = [];
    this.foundGames = [];
    return this;
  }

  public async search(moduleConfig: any, callback: (error: Error, potentialGames: GamesCollection<PotentialGame>) => void) {
    super.search(moduleConfig, callback);

    const configFilePath: string = path.resolve(moduleConfig.configFilePath.replace('%appdata%', process.env.APPDATA));
    logger.info('BattleNetCrawler', `Reading Battle.net config file ${configFilePath}.`);
    try {
      this.parseConfigFile(await fs.readJson(configFilePath));
    }
    catch (error) {
      this.callback(error, null);
    }
  }

  private async parseConfigFile(battleNetConfig: any) {
    this.rootInstallPath = battleNetConfig.Client.Install.DefaultInstallPath;
    const gameTags: string[] = Object.keys(battleNetConfig.Games)
      .filter((gamesTag: string) => gamesTag !== 'battle_net' && battleNetConfig.Games[gamesTag].Resumable);

    await gameTags.forEachEnd((gameTag: string, done: () => void) => {
      const gameData: BattleNetGame = this.moduleConfig.gamesData.filter((battleNetGame: BattleNetGame) => battleNetGame.tag === gameTag)[0];
      logger.info('BattleNetCrawler', `Battle.net game ${gameData.name} found.`);
      if (!this.gameDirExists(gameData.name))
        this.gamesData.push(gameData);
      else
        logger.info('BattleNetCrawler', `Battle.net game ${gameData.name} is already a playable game.`);
      done();
    });
    await this.parseFolders();
    await this.getGamesData();
    this.sendResults();
  }

  private async parseFolders() {
    if (!this.gamesData.length) {
      logger.info('BattleNetCrawler', 'No Battle.net games found.');
      this.sendResults();
      return;
    }
    await this.gamesData.forEachEnd(async (gameData: BattleNetGame, done: () => void) => {
      gameData.path = path.resolve(this.rootInstallPath, gameData.name, gameData.path);
      if (await fs.pathExists(gameData.path)) {
        logger.info('BattleNetCrawler', `Battle.net game ${gameData.name} is present on disk.`);
        this.foundGames.push(gameData);
      }
      done();
    });
  }

  private async getGamesData() {
    await this.foundGames.forEachEnd(async (foundGame: BattleNetGame, done: () => void) => {
      try {
        const potentialGame: PotentialGame = new PotentialGame(foundGame.name);
        potentialGame.source = GameSource.BATTLE_NET;
        potentialGame.commandLine = [ foundGame.path ];
        this.potentialGames.push(potentialGame);
        logger.info('BattleNetCrawler', `Adding ${foundGame.name} to potential Battle.net games.`);
        done();
      }
      catch (error) {
        this.callback(error, null);
      }
    });
  }
}

const battleNetCrawler: BattleNetCrawler = new BattleNetCrawler();

export function searchBattleNetGames(battleNetConfig: any, playableGames?: PlayableGame[]): Promise<any> {
  return new Promise((resolve, reject) => {
    battleNetCrawler.setPlayableGames(playableGames)
      .search(battleNetConfig, (error: Error, potentialGames: GamesCollection<PotentialGame>) => {
        if (error)
          reject(error);
        else
          resolve(potentialGames);
      });
  });
}
