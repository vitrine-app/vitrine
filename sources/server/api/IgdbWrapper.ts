import * as googleTranslate from 'google-translate-api';
import * as igdb from 'igdb-api-node';
import * as moment from 'moment';

import { igdbKey } from '../../modules/keysProvider';
import { logger } from '../Logger';

class IgdbWrapper {
  private readonly timeOut: number;
  private readonly levenshteinRefiner: number;
  private client: any;

  public constructor(private lang?: string) {
    this.client = igdb.default(igdbKey());
    this.timeOut = 25000;
    this.levenshteinRefiner = 5;
  }

  public setLang(lang: string): this {
    this.lang = lang;
    return this;
  }

  public async findGameById(id: number) {
    const rawResponse: any = await this.timeOutPromise(this.client.games({
      ids: [ id ]
    }, [
      'name',
      'summary',
      'collection',
      'total_rating',
      'developers',
      'publishers',
      'genres',
      'first_release_date',
      'screenshots',
      'cover'
    ]));
    if (rawResponse === false)
      throw new Error('IGDB API timed out.');
    return await this.formatGame(rawResponse.body[0]);
  }

  public async searchGames(name: string, resultsNb?: number) {
    const limit = resultsNb || this.levenshteinRefiner;
    logger.info('IgdbWrapper', `Looking for ${limit} result(s) of ${name} in IGDB.`);
    const rawResponse: any = await this.timeOutPromise(this.client.games({
      limit,
      search: name.replace('²', '2')
    }, [
      'name',
      'cover'
    ]));
    if (rawResponse === false)
      throw new Error('IGDB API timed out.');
    const { body: games } = rawResponse;
    return games.map((game: any) => {
      logger.info('IgdbWrapper', `${game.name} found in IGDB.`);
      const foundGame: any = { ...game };
      if (foundGame.cover) {
        if (foundGame.cover.url.substr(0, 6) === 'https:')
          foundGame.cover.url = game.cover.url.substr(6);
        foundGame.cover = `https:${game.cover.url.replace('t_thumb', 't_cover_small_2x')}`;
      }
      else // TODO: Change default image
        foundGame.cover = 'https://images.igdb.com/igdb/image/upload/t_cover_small_2x/nocover_qhhlj6.jpg';
      return foundGame;
    });
  }

  public async fillFirstGame(name: string) {
    logger.info('IgdbWrapper', `Looking for first result of ${name} in IGDB.`);
    const rawResponse: any = await this.timeOutPromise(this.client.games({
      limit: 1,
      search: name.replace('²', '2')
    }, [
      'name',
      'summary',
      'collection',
      'total_rating',
      'developers',
      'publishers',
      'genres',
      'first_release_date',
      'screenshots',
      'cover'
    ]));
    if (rawResponse === false)
      throw new Error('IGDB API timed out.');
    return await this.formatGame(rawResponse.body[0], true);
  }

  private async formatGame(response: any, firstResultFormat: boolean = false) {
    const [ game, developer, publisher, series, genres ]: any[] = await Promise.all([
      this.formatGameData(response, firstResultFormat),
      this.findCompaniesByIds(response.developers),
      this.findCompaniesByIds(response.publishers),
      this.findSeriesById(response.collection),
      this.findGenresByIds(response.genres, firstResultFormat)
    ]);
    return {
      ...game,
      publisher: publisher || developer,
      developer,
      series,
      genres
    };
  }

  private async formatGameData(game: any, firstResultFormat: boolean) {
    const foundGame = { ...game };
    delete foundGame.collection;
    delete foundGame.developers;
    delete foundGame.publishers;
    if (foundGame.total_rating) {
      const rating: number = foundGame.total_rating;
      foundGame.rating = Math.round(rating);
      delete foundGame.total_rating;
    }
    if (foundGame.first_release_date) {
      foundGame.releaseDate = firstResultFormat ? moment(foundGame.first_release_date).format('DD/MM/YYYY') : foundGame.first_release_date;
      delete foundGame.first_release_date;
    }
    if (foundGame.cover) {
      if (foundGame.cover.url.substr(0, 6) === 'https:')
        foundGame.cover.url = foundGame.cover.url.substr(6);
      foundGame.cover = `https:${foundGame.cover.url.replace('t_thumb', 't_cover_big_2x')}`;
    }
    else // TODO: Change default image
      foundGame.cover = 'https://images.igdb.com/igdb/image/upload/t_cover_big_2x/nocover_qhhlj6.jpg';
    const screenshots: string[] = foundGame.screenshots ? foundGame.screenshots
      .map(({ url }: any) => `https:${url.replace('t_thumb', 't_screenshot_med')}`) : [];
    if (firstResultFormat) {
      foundGame.backgroundScreen = screenshots.length ? screenshots[0] : null;
      delete foundGame.screenshots;
    }
    else
      foundGame.screenshots = screenshots;
    if (game.summary && this.lang)
      foundGame.summary = (await googleTranslate(game.summary, { to: this.lang })).text;
    return foundGame;
  }

  private async findCompaniesByIds(ids: number[]) {
    if (!ids || !ids.length)
      return '';
    const { body: response }: any = await this.client.companies({ ids }, [ 'name' ]);
    if (!response.length)
      return '';
    return response[0].name;
  }

  private async findSeriesById(id: number) {
    if (!id)
      return '';
    const { body: [ response ] }: any = await this.client.collections({ ids: [ id ] }, [ 'name' ]);
    return response.name;
  }

  private async findGenresByIds(ids: number[], firstResultFormat: boolean) {
    if (!ids || !ids.length)
      return '';
    const { body: response }: any = await this.client.genres({ ids }, [ 'name' ]);
    if (!response.length)
      return '';
    const genres: string[] = response.map((genres: any) => genres.name);
    return firstResultFormat ? genres.join(', ') : genres;
  }

  private timeOutPromise(initialPromise: Promise<any>): Promise<any> {
    return Promise.race([
      initialPromise,
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(false);
        }, this.timeOut);
      })
    ]);
  }
}

const igdbWrapper: IgdbWrapper = new IgdbWrapper();

export async function fillIgdbGame(gameId: number, lang?: string) {
  return await igdbWrapper.setLang(lang).findGameById(gameId);
}

export async function searchIgdbGame(gameName: string, resultsNb?: number) {
  return await igdbWrapper.searchGames(gameName, resultsNb);
}

export async function fillFirstIgdbResult(gameName: string, lang?: string) {
  return await igdbWrapper.setLang(lang).fillFirstGame(gameName);
}
