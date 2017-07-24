const { ipcMain } = require('electron');

const Igdb = require('./api/IgdbWrapper');

ipcMain.on('client.get-game', (event, args) => {
	let wrapper = new Igdb();
	wrapper.getGame(args, function(doc) {
		event.sender.send('server.send-game', doc);
	});
});
