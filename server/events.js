const IgdbWrapper = require('./api/IgdbWrapper');

module.exports = events = {
	'client.get-game': (event, args) => {
		let wrapper = new IgdbWrapper();
		wrapper.getGame(args, function(doc) {
			event.sender.send('server.send-game', doc);
		});
	}
};
