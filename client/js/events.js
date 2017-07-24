const { ipcRenderer } = require('electron');

ipcRenderer.on('server.send-game', (event, args) => {
	console.log(args);
	$('#game-title').html(args.name);
	$('body').css({
		'background': 'url(' + args.screenshots[0] + ') no-repeat',
		'background-size': '100%',
	});
});