const { ipcRenderer } = require('electron');

ipcRenderer.on('server.send-game', (event, game) => {
	console.log(game);
	$('#game-title').html(game.name);
	$('#game-cover-image').css({
		'background-image': 'url(' + game.cover + ')',
		'background-repeat': 'no-repeat',
		'background-size': '100% 100%',
	});
});

ipcRenderer.on('server.send-game-error', (event, error) => {
	$('#game-title').html(error);
	throw new Error(error);
});
