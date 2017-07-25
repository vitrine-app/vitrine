const IgdbWrapper = require('./api/IgdbWrapper');

let igdbWrapper = new IgdbWrapper();

const events = {
	'client.get-game': (event, args) => {
		igdbWrapper.getGame(args, (doc) => {
			event.sender.send('server.send-game', doc);
		}, (error) => {
			event.sender.send('server.send-game-error', error);
		});
	}
};

module.exports = events;
