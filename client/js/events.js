const { ipcRenderer } = require('electron');
const { beforeCss } = require('./helpers');

ipcRenderer.on('server.send-game', (event, game) => {
	console.log(game);
	$('#game-title').html(game.name);
	$('#game-cover-image').css({
		'background-image': 'url(' + game.cover + ')',
		'background-repeat': 'no-repeat',
		'background-size': '100% 100%',
	});
	if (game.screenshots.length) {
		beforeCss('#game-background', {
			'background-image': 'url(' + game.screenshots[0] + ')'
		});
	}
});

ipcRenderer.on('server.send-game-error', (event, error) => {
	$('#game-title').html(error);
	throw new Error(error);
});
