import * as igdb from 'igdb-api-node';
import * as getClosest from 'get-closest';

import {levenshteinDistanceCmp, nameArray} from '../helpers';

class IgdbWrapper {
	private apiKey: string;
	private client: any;
	private levenshteinRefiner: number;
	private callback: any;
	private game: any;

	constructor() {
		this.apiKey = 'XBbCSfnCremsh2OsjrJlRE83AIbmp1ZMAbtjsn7puoI7G57gpl';
		this.client = igdb.default(this.apiKey);
		this.levenshteinRefiner = 5;

		this.game = null;
		this.callback = null;
	}

	public getGame(name: string, callback: Function) {
		this.refinerSwitch(name);
		this.client.games({
			limit: this.levenshteinRefiner,
			search: name
		}, ['name']).then((response) => {
			let gamesNames: string[] = nameArray(response.body);
			let gameId: number = getClosest.custom(name, gamesNames, levenshteinDistanceCmp);

			this.findGameById(response.body[gameId].id, (error, game) => {
				if (error && !game)
					callback(error, null);
				else {
					this.game = game;
					this.callback = callback;
					this.basicFormatting();
					this.findCompanyById(game.developers, this.addDeveloperCallback.bind(this));
				}

			});
		}).catch((error) => {
			if (error)
				callback(error, null);
		});
	}

	public searchGames(name: string, callback: Function, resultsNb?: number) {
		this.client.games({
			limit: (resultsNb) ? (resultsNb) : (this.levenshteinRefiner),
			search: name
		}, ['name', 'cover']).then((response) => {
			let counter: number = 0;
			response.body.forEach((game: any) => {
				if (game.cover)
					game.cover = 'https:' + game.cover.url.replace('t_thumb', 't_cover_small');
				counter++;
				if (counter === response.body.length)
					callback(null, response.body);
			});
		}).catch((error) => {
			if (error)
				callback(error, null);
		});
	}

	private refinerSwitch(name: string) {
		if (name === 'Magicka')
			this.levenshteinRefiner = 13;
		else if (name === 'Sanctum')
			this.levenshteinRefiner = 11;
		else if (name === 'Assassin\'s Creed')
			this.levenshteinRefiner = 7;
		else if (name === 'Warframe')
			this.levenshteinRefiner = 6;
	}

	private basicFormatting() {
		if (this.game.total_rating) {
			let rating = this.game.total_rating;
			this.game.rating = Math.round(rating);
			delete this.game.total_rating;
		}
		if (this.game.first_release_date) {
			this.game.releaseDate = this.game.first_release_date;
			delete this.game.first_release_date;
		}
		if (this.game.cover)
			this.game.cover = 'https:' + this.game.cover.url.replace('t_thumb', 't_cover_big_2x');
		else // TODO: Change default image
			this.game.cover = 'https://images.igdb.com/igdb/image/upload/t_cover_big_2x/nocover_qhhlj6.jpg';
		if (this.game.screenshots) {
			this.game.screenshots.forEach((element, key) => {
				this.game.screenshots[key] = 'https:' + element.url.replace('t_thumb', 't_screenshot_med');
			});
		}
		else
			this.game.screenshots = [];
	}

	private findGameById(id: number, callback: Function) {
		this.client.games({
			ids: [id]
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
		]).then((response) => {
			let firstGame = response.body[0];
			callback(null, firstGame);
		}).catch((error) => {
			callback(error, null);
		});
	}

	private findCompanyById(array: number[], callback: Function) {
		if (!array || !array.length) {
			callback({name: ''});
			return;
		}
		let ids = (Array.isArray(array[0])) ? (array[0]) : ([array[0]]);

		this.client.companies({
			ids: ids
		}, ['name']).then((response) => {
			callback(response.body[0]);
		}).catch((error) => {
			this.callback(error, null);
		});
	}

	private findSeriesById(id: number, callback: Function) {
		let ids = (Array.isArray(id)) ? (id) : ([id]);

		this.client.collections({
			ids: ids
		}, ['name']).then((response) => {
			callback(response.body[0]);
		}).catch((error) => {
			this.callback(error, null);
		});
	}

	private findGenreById(id: number, callback: Function) {
		let ids = (Array.isArray(id)) ? (id) : ([id]);

		this.client.genres({
			ids: ids
		}, ['name']).then((response) => {
			callback(response.body);
		}).catch((error) => {
			this.callback(error, null);
		});
	}

	private addDeveloperCallback(developer: any) {
		delete this.game.developers;
		this.game.developer = developer.name;

		this.findCompanyById(this.game.publishers, this.addPublisherCallback.bind(this));
	}

	private addPublisherCallback(publisher: any) {
		delete this.game.publishers;
		this.game.publisher = publisher.name;

		this.findSeriesById(this.game.collection, this.addSeriesCallback.bind(this));
	}

	private addSeriesCallback(series: any) {
		delete this.game.collection;
		this.game.series = series.name;

		this.findGenreById(this.game.genres, this.addGenresCallback.bind(this));
	}

	private addGenresCallback(genres: any) {
		let genresArray = [];
		genres.forEach((genre) => {
			genresArray.push(genre.name);
		});
		this.game.genres = genresArray;

		this.callback(null, this.game);
	}
}

export function getIgdbWrapperFiller(gameName: string) {
	return new Promise((resolve, reject) => {
		new IgdbWrapper().getGame(gameName, (error, game) => {
			if (error)
				reject(error);
			else
				resolve(game);
		});
	});
}

export function getIgdbWrapperSearcher(gameName: string, resultsNb?: number) {
	return new Promise((resolve, reject) => {
		new IgdbWrapper().searchGames(gameName,(error, game) => {
			if (error)
				reject(error);
			else
				resolve(game);
		}, resultsNb);
	});
}
