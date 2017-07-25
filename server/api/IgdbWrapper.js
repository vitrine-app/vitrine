const igdb = require('igdb-api-node').default;
const cbw = require('./callbacksWrapper');

class IgdbWrapper {
	constructor() {
		this.apiKey = 'XBbCSfnCremsh2OsjrJlRE83AIbmp1ZMAbtjsn7puoI7G57gpl';
		this.client = igdb(this.apiKey);
		this.operating = false;

		this.currentGame = this.currentCallback = null;
	}

	getGame(name, callback, errorCallback) {
		this.operating = true;

		this._findGameByName(name, (game) => {
			if (game === undefined) {
				console.log('entering callback');
				errorCallback(name + ' not found.');
			}
			// Register currents elements
			this.currentGame = game;
			this.currentCallback = callback;

			this._basicFormatting();
			this._findCompanyById(game.developers[0], cbw._addDeveloperCallback.bind(this));
		});
	}

	_basicFormatting() {
		let rating = this.currentGame.total_rating;
		this.currentGame.rating = Math.round(rating);
		delete this.currentGame['total_rating'];

		this.currentGame.cover = 'https:' + this.currentGame.cover.url.replace('t_thumb', 't_cover_big_2x');
		if (this.currentGame.screenshots) {
			this.currentGame.screenshots.forEach((element, key) => {
				this.currentGame.screenshots[key] = 'https:' + element.url.replace('t_thumb', 't_screenshot_med');
			});
		}
		else
			this.currentGame.screenshots = [];
	}

	_findGameByName(name, callback) {
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
		]).then(function(response) {
			callback(response.body[0]);
		}).catch(function(err) {
			throw err;
		});
	}

	_findCompanyById(id, callback) {
		let ids = (Array.isArray(id)) ? (id) : ([id]);

		this.client.companies({
			ids: ids
		}, ['name']).then(function(response) {
			callback(response.body[0]);
		}).catch(function(err) {
			throw err;
		});
	}

	_findSeriesById(id, callback) {
		let ids = (Array.isArray(id)) ? (id) : ([id]);

		this.client.collections({
			ids: ids
		}, ['name']).then(function(response) {
			callback(response.body[0]);
		}).catch(function(err) {
			throw err;
		});
	}

	_findGenreById(id, callback) {
		let ids = (Array.isArray(id)) ? (id) : ([id]);

		this.client.genres({
			ids: ids
		}, ['name']).then(function(response) {
			callback(response.body);
		}).catch(function(err) {
			throw err;
		});
	}
}

module.exports = IgdbWrapper;
