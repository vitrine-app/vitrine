import * as igdb from 'igdb-api-node';

class IgdbWrapper {
	private apiKey: string;
	private client: any;
	private levenshteinRefiner: number;
	private callback: any;
	private game: any;

	public constructor() {
		this.apiKey = '68f4f0d8675a0f3341ee52bcabae1f46';
		this.client = igdb.default(this.apiKey);
		this.levenshteinRefiner = 5;

		this.game = null;
		this.callback = null;
	}

	public findGameById(id: number, callback: Function) {
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
			this.game = response.body[0];
			this.callback = callback;
			this.basicFormatting();
			this.findCompanyById(this.game.developers, this.addDeveloperCallback.bind(this));
		}).catch((error) => {
			callback(error, null);
		});
	}

	public searchGames(name: string, callback: Function, resultsNb?: number) {
		this.client.games({
			limit: (resultsNb) ? (resultsNb) : (this.levenshteinRefiner),
			search: name.replace('²', '2')
		}, ['name', 'cover']).then((response) => {
			let counter: number = 0;
			response.body.forEach((game: any) => {
				if (game.cover)
					game.cover = 'https:' + game.cover.url.replace('t_thumb', 't_cover_small_2x');
				else // TODO: Change default image
					game.cover = 'https://images.igdb.com/igdb/image/upload/t_cover_small_2x/nocover_qhhlj6.jpg';
				counter++;
				if (counter === response.body.length)
					callback(null, response.body);
			});
		}).catch((error) => {
			callback(error, null);
		});
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
		if (!id) {
			callback('');
			return;
		}
		this.client.collections({
			ids: [id]
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

export function getIgdbWrapperFiller(gameId: number): Promise<any> {
	return new Promise((resolve, reject) => {
		new IgdbWrapper().findGameById(gameId, (error, game) => {
			if (error)
				reject(error);
			else
				resolve(game);
		});
	});
}

export function getIgdbWrapperSearcher(gameName: string, resultsNb?: number): Promise<any> {
	return new Promise((resolve, reject) => {
		new IgdbWrapper().searchGames(gameName,(error, games) => {
			if (error)
				reject(error);
			else
				resolve(games);
		}, resultsNb);
	});
}
