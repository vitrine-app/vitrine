const igdb = require('igdb-api-node').default;
const cbw = require('./callbacksWrapper');

class IgdbWrapper {
	constructor() {
		this.apiKey = 'XBbCSfnCremsh2OsjrJlRE83AIbmp1ZMAbtjsn7puoI7G57gpl';
		this.client = igdb(this.apiKey);

		this.currentGame = this.currentCallback = null;
	}

	getGame(name, callback) {
		this._findGameByName(name, (game) => {
			// Register currents elements
			this.currentGame = game;
			this.currentCallback = callback;
			this._formatImages();
			this._findCompanyById(game.developers[0], cbw._addDeveloperCallback.bind(this));
		});
	}

	_formatImages() {
		this.currentGame.cover = this.currentGame.cover.url.replace('t_thumb', 't_cover_big_2x');

		this.currentGame.screenshots.forEach((element, key) => {
			this.currentGame.screenshots[key] = element.url.replace('t_thumb', 't_screenshot_med');
		});
	}

	_findGameByName(name, callback) {
		this.client.games({
			search: name,
			filters: {
				'name.eq': name
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
}

module.exports = IgdbWrapper;
