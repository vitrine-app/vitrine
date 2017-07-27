import * as igdb from 'igdb-api-node';

export class IgdbWrapper {
	private apiKey: string;
	private client: any;
	private operating: boolean;
	private currentCallback: any;
	private currentGame: any;
	private c: number;

	constructor() {
		this.apiKey = 'XBbCSfnCremsh2OsjrJlRE83AIbmp1ZMAbtjsn7puoI7G57gpl';
		this.client = igdb.default(this.apiKey);
		this.operating = false;

		this.currentGame = null;
		this.currentCallback = null;
	}

	public getGame(name, callback) {
		this.operating = true;

		this.findGameByName(name, (error, game) => {
			if (error && !game) {
				console.error(error);
				callback(name + ' not found.', null);
			}

			this.currentGame = game;
			this.currentCallback = callback;

			this.basicFormatting();
			this.findCompanyById(game.developers, this.addDeveloperCallback.bind(this));
		});
	}

	private basicFormatting() {
		if (this.currentGame.total_rating) {
			let rating = this.currentGame.total_rating;
			this.currentGame.rating = Math.round(rating);
			delete this.currentGame['total_rating'];
		}
		if (this.currentGame.cover)
			this.currentGame.cover = 'https:' + this.currentGame.cover.url.replace('t_thumb', 't_cover_big_2x');
		else /* TODO: Change default image */
				this.currentGame.cover = 'https://images.igdb.com/igdb/image/upload/t_cover_big_2x/nocover_qhhlj6.jpg';
		if (this.currentGame.screenshots) {
			this.currentGame.screenshots.forEach((element, key) => {
				this.currentGame.screenshots[key] = 'https:' + element.url.replace('t_thumb', 't_screenshot_med');
			});
		}
		else
			this.currentGame.screenshots = [];
	}

	private findGameByName(name, callback) {
		this.client.games({
			limit: 1,
			filters: {
				'name-eq': name
			}
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
			callback(null, response.body[0]);
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
		this.currentGame.developers = developer.name;

		this.findCompanyById(this.currentGame.publishers, this.addPublisherCallback.bind(this));
	}

	private addPublisherCallback(publisher) {
		this.currentGame.publishers = publisher.name;

		this.findSeriesById(this.currentGame.collection, this.addSeriesCallback.bind(this));
	}

	private addSeriesCallback(series) {
		delete this.currentGame['collection'];
		this.currentGame.series = series.name;

		this.findGenreById(this.currentGame.genres, this.addGenresCallback.bind(this));
	}

	private addGenresCallback(genres) {
		let genresArray = [];
		genres.forEach(function(genre) {
			genresArray.push(genre.name);
		});
		this.currentGame.genres = genresArray;

		this.currentCallback(null, this.currentGame);
		delete this.currentGame;
		delete this.currentCallback;
		this.operating = false;
	}
}
