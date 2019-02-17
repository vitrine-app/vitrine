import { AxiosInstance, default as axios } from 'axios';
import * as googleTranslate from 'google-translate-api';
import * as jwt from 'jsonwebtoken';

import { vitrineSecretKey } from '../../modules/keysProvider';
import { logger } from '../Logger';

class ServerWrapper {
  private readonly apiEntryPoint: string;
  private instance: AxiosInstance;

  constructor() {
    this.apiEntryPoint = 'http://ec2-35-180-138-49.eu-west-3.compute.amazonaws.com';
    this.instance = axios.create({
      baseURL: this.apiEntryPoint
    });
  }

  public async getGame(gameId: number, locale?: string) {
    logger.info('ServerWrapper', `Connecting to Vitrine API to look for game n°${gameId} in IGDB.`);
    try {
      const {
        data: { data: game }
      }: any = await this.instance.get(`/games/${gameId}`, {
        headers: {
          Authorization: ServerWrapper.generateToken()
        }
      });
      if (game.summary && locale) {
        const { text } = await googleTranslate(game.summary, { to: locale });
        game.summary = text;
      }
      return game;
    } catch (error) {
      throw new Error(`Server error: ${error}`);
    }
  }

  public async getFirstGame(gameName: string, locale?: string) {
    logger.info('ServerWrapper', `Connecting to Vitrine API to look for first game named ${gameName} in IGDB.`);
    try {
      const {
        data: { data: game }
      }: any = await this.instance.get(`/games/research/${gameName}`, {
        headers: {
          Authorization: ServerWrapper.generateToken()
        }
      });
      if (game.summary && locale) {
        const { text } = await googleTranslate(game.summary, { to: locale });
        game.summary = text;
      }
      return game;
    } catch (error) {
      throw new Error(`Server error: ${error}`);
    }
  }

  public async searchGame(gameName: string, listSize?: number) {
    logger.info('ServerWrapper', `Connecting to Vitrine API to look for ${listSize || 5} games named ${gameName} in IGDB.`);
    try {
      const {
        data: { data: games }
      }: any = await this.instance.get(`/games/research/${gameName}/${listSize || 5}`, {
        headers: {
          Authorization: ServerWrapper.generateToken()
        }
      });
      return games;
    } catch (error) {
      throw new Error(`Server error: ${error}`);
    }
  }

  private static generateToken(): string {
    return jwt.sign(
      {
        date: new Date().getTime()
      },
      vitrineSecretKey()
    );
  }
}

const serverWrapper: ServerWrapper = new ServerWrapper();

export async function fillIgdbGame(gameId: number, locale?: string) {
  return serverWrapper.getGame(gameId, locale);
}

export async function fillFirstIgdbResult(gameName: string, locale?: string) {
  return serverWrapper.getFirstGame(gameName, locale);
}

export async function searchIgdbGame(gameName: string, listSize?: number) {
  return serverWrapper.searchGame(gameName, listSize);
}
