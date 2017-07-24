const IgdbWrapper = require('./api/IgdbWrapper');

let igdbWrapper = new IgdbWrapper();

module.exports = events = {
	'client.get-game': (event, args) => {
		igdbWrapper.getGame(args, function(doc) {
			event.sender.send('server.send-game', doc);
		});
	}
};
