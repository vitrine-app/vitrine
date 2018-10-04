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
  private rootInstallPath: string;

  public setPlayableGames(playableGames?: PlayableGame[]): this {
    super.setPlayableGames(playableGames);
    return this;
  }

  public async search(moduleConfig: any) {
    super.search(moduleConfig);

    const configFilePath: string = path.resolve(moduleConfig.configFilePath.replace('%appdata%', process.env.APPDATA));
    logger.info('BattleNetCrawler', `Reading Battle.net config file ${configFilePath}.`);
    try {
      const battleNetConfig: any = await fs.readJson(configFilePath);
      this.rootInstallPath = battleNetConfig.Client.Install.DefaultInstallPath;

      const gameTags: string[] = Object.keys(battleNetConfig.Games)
        .filter((gamesTag: string) => gamesTag !== 'battle_net' && battleNetConfig.Games[gamesTag].Resumable);
      const gamesData: BattleNetGame[] = gameTags.map((gameTag: string) =>
        this.moduleConfig.gamesData.filter((battleNetGame: BattleNetGame) => battleNetGame.tag === gameTag)[0]
      ).filter((gameData: any) => !this.gameDirExists(gameData.name));

      if (!gamesData.length) {
        logger.info('BattleNetCrawler', 'No Battle.net games found.');
        return new GamesCollection<PotentialGame>();
      }

      const potentialGames: PotentialGame[] = (await Promise.all(gamesData.filter(async (gameData: BattleNetGame) =>
        await fs.pathExists(path.resolve(this.rootInstallPath, gameData.name, gameData.path))
      ))).map((foundGame: BattleNetGame) => {
        const potentialGame: PotentialGame = new PotentialGame(foundGame.name);
        potentialGame.source = GameSource.BATTLE_NET;
        potentialGame.commandLine = [ foundGame.path ];
        logger.info('BattleNetCrawler', `Adding ${foundGame.name} to potential Battle.net games.`);
        return potentialGame;
      });

      return new GamesCollection(potentialGames);
    }
    catch (error) {
      logger.info('BattleNetCrawler', 'Battle.net config file wasn\'t found.');
      return new GamesCollection<PotentialGame>();
    }
  }
}

const battleNetCrawler: BattleNetCrawler = new BattleNetCrawler();

export async function searchBattleNetGames(battleNetConfig: any, playableGames?: PlayableGame[]) {
  try {
    return await battleNetCrawler.setPlayableGames(playableGames).search(battleNetConfig);
  }
  catch (error) {
    throw error;
  }
}
