import * as igdb from 'igdb-api-node';
import * as getClosest from 'get-closest';

import {levenshteinDistanceCmp, nameArray} from '../helpers';

class IgdbWrapper {
	private apiKey: string;
	private client: any;
	private operating: boolean;
	private levenshteinRefiner: number;
	private callback: any;
	private game: any;

	constructor() {
		this.apiKey = 'XBbCSfnCremsh2OsjrJlRE83AIbmp1ZMAbtjsn7puoI7G57gpl';
		this.client = igdb.default(this.apiKey);
		this.operating = false;
		this.levenshteinRefiner = 5;

		this.game = null;
		this.callback = null;
	}

	public getGame(name, callback) {
		this.operating = true;
		this.client.games({
			limit: this.levenshteinRefiner,
			search: name
		}, ['name']).then((response) => {
			let gamesNames: string[] = nameArray(response.body);
			let gameId: number = getClosest.custom(name, gamesNames, levenshteinDistanceCmp);

			this.findGameById(response.body[gameId].id, (error, game) => {
				if (error && !game) {
					console.error(error);
					callback(name + ' not found.', null);
				}

				this.game = game;
				this.callback = callback;

				if (this.game) {
					this.basicFormatting();
					this.findCompanyById(game.developers, this.addDeveloperCallback.bind(this));
				}
			});
		}).catch((error) => {
			if (error)
				this.callback(error, null);
		});
	}

	private basicFormatting() {
		if (this.game.total_rating) {
			let rating = this.game.total_rating;
			this.game.rating = Math.round(rating);
			delete this.game['total_rating'];
		}
		if (this.game.cover)
			this.game.cover = 'https:' + this.game.cover.url.replace('t_thumb', 't_cover_big_2x');
		else /* TODO: Change default image */
			this.game.cover = 'https://images.igdb.com/igdb/image/upload/t_cover_big_2x/nocover_qhhlj6.jpg';
		if (this.game.screenshots) {
			this.game.screenshots.forEach((element, key) => {
				this.game.screenshots[key] = 'https:' + element.url.replace('t_thumb', 't_screenshot_med');
			});
		}
		else
			this.game.screenshots = [];
	}

	private findGameById(id, callback) {
		this.client.games({
			ids: [id]
			/*filters: {
				'name-eq': name
			}*/
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

	private findCompanyById(array, callback) {
		if (!array || !array.length) {
			callback({name: ''});
			return;
		}
		let ids = (Array.isArray(array[0])) ? (array[0]) : ([array[0]]);

		this.client.companies({
			ids: ids
		}, ['name']).then((response) => {
			callback(response.body[0]);
		}).catch((err) => {
			throw err;
		});
	}

	private findSeriesById(id, callback) {
		let ids = (Array.isArray(id)) ? (id) : ([id]);

		this.client.collections({
			ids: ids
		}, ['name']).then((response) => {
			callback(response.body[0]);
		}).catch((err) => {
			throw err;
		});
	}

	private findGenreById(id, callback) {
		let ids = (Array.isArray(id)) ? (id) : ([id]);

		this.client.genres({
			ids: ids
		}, ['name']).then((response) => {
			callback(response.body);
		}).catch((err) => {
			throw err;
		});
	}

	private addDeveloperCallback(developer) {
		this.game.developers = developer.name;

		this.findCompanyById(this.game.publishers, this.addPublisherCallback.bind(this));
	}

	private addPublisherCallback(publisher) {
		this.game.publishers = publisher.name;

		this.findSeriesById(this.game.collection, this.addSeriesCallback.bind(this));
	}

	private addSeriesCallback(series) {
		delete this.game['collection'];
		this.game.series = series.name;

		this.findGenreById(this.game.genres, this.addGenresCallback.bind(this));
	}

	private addGenresCallback(genres) {
		let genresArray = [];
		genres.forEach((genre) => {
			genresArray.push(genre.name);
		});
		this.game.genres = genresArray;

		this.callback(null, this.game)
		this.operating = false;
	}
}

export function getIgdbWrapper(gameName: string) {
	return new Promise((resolve, reject) => {
		new IgdbWrapper().getGame(gameName, (error, game) => {
			if (error)
				reject(error);
			else
				resolve(game);
		});
	});
}
