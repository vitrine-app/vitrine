import * as googleTranslate from 'google-translate-api';
import * as igdb from 'igdb-api-node';

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
		try {
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
			const { body: [ response ] } = rawResponse;
			const [ game, developer, publisher, series, genres ]: any[] = await Promise.all([
				this.basicFormatting(response),
				this.findCompaniesByIds(response.developers),
				this.findCompaniesByIds(response.publishers),
				this.findSeriesById(response.collection),
				this.findGenresByIds(response.genres)
			]);
			return {
				...game,
				publisher: publisher || developer,
				developer,
				series,
				genres
			};
		}
		catch (error) {
			return error;
		}
	}

	public async searchGames(name: string, resultsNb?: number) {
		const limit = resultsNb || this.levenshteinRefiner;
		logger.info('IgdbWrapper', `Looking for ${limit} result(s) of ${name} in IGDB.`);
		try {
			const rawResponse: any = await this.timeOutPromise(this.client.games({
				limit,
				search: name.replace('²', '2')
			}, [
				'name',
				'cover'
			]));
			if (rawResponse === false)
				throw new Error('IGDB API timed out.');
			const { body: response } = rawResponse;
			const foundGames: any[] = [];
			await response.forEachEnd((game: any, done: () => void) => {
				logger.info('IgdbWrapper', `${game.name} found in IGDB.`);
				const foundGame: any = { ...game };
				if (foundGame.cover) {
					if (foundGame.cover.url.substr(0, 6) === 'https:')
						foundGame.cover.url = game.cover.url.substr(6);
					foundGame.cover = `https:${game.cover.url.replace('t_thumb', 't_cover_small_2x')}`;
				}
				else // TODO: Change default image
					foundGame.cover = 'https://images.igdb.com/igdb/image/upload/t_cover_small_2x/nocover_qhhlj6.jpg';
				done();
				foundGames.push(foundGame);
			});
			return foundGames;
		}
		catch (error) {
			return error;
		}
	}

	private async basicFormatting(game: any) {
		const { ...foundGame } = { ...game };
		delete foundGame.collection;
		delete foundGame.developers;
		delete foundGame.publishers;
		if (foundGame.total_rating) {
			const rating: number = foundGame.total_rating;
			foundGame.rating = Math.round(rating);
			delete foundGame.total_rating;
		}
		if (foundGame.first_release_date) {
			foundGame.releaseDate = foundGame.first_release_date;
			delete foundGame.first_release_date;
		}
		if (foundGame.cover) {
			if (foundGame.cover.url.substr(0, 6) === 'https:')
				foundGame.cover.url = foundGame.cover.url.substr(6);
			foundGame.cover = `https:${foundGame.cover.url.replace('t_thumb', 't_cover_big_2x')}`;
		}
		else // TODO: Change default image
			foundGame.cover = 'https://images.igdb.com/igdb/image/upload/t_cover_big_2x/nocover_qhhlj6.jpg';
		foundGame.screenshots = foundGame.screenshots
			.map(({ url: screenshotUrl }: any) => `https:${screenshotUrl.replace('t_thumb', 't_screenshot_med')}`);
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

	private async findGenresByIds(ids: number[]) {
		if (!ids.length)
			return '';
		const { body: response }: any = await this.client.genres({ ids }, [ 'name' ]);
		if (!response.length)
			return '';
		return response.map((genres: any) => genres.name);
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

export function fillIgdbGame(gameId: number, lang?: string): Promise<any> {
	return new Promise((resolve, reject) => {
		igdbWrapper.setLang(lang).findGameById(gameId).then((game: any) => {
			if (game instanceof Error)
				reject(game);
			else
				resolve(game);
		}).catch((error: Error) => {
			reject(error);
		});
	});
}

export function searchIgdbGame(gameName: string, resultsNb?: number): Promise<any> {
	return new Promise((resolve, reject) => {
		igdbWrapper.searchGames(gameName, resultsNb).then((games: any) => {
			if (games instanceof Error)
				reject(games);
			else
				resolve(games);
		}).catch((error: Error) => {
			reject(error);
		});
	});
}
