import { ipcRenderer } from 'electron';
import { beforeCss, alphabeticSort } from './helpers';

ipcRenderer.on('server.send-game', (event, game) => {
	console.log(game);
	$('#game-title').html(game.name);
	$('#game-desc').addClass('game-desc').html(game.summary);
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

ipcRenderer.on('server.add-potential-games', (event, potentialGames) => {
	potentialGames.sort(alphabeticSort);
	potentialGames.forEach((potentialGame) => {
		let html: string = '<li><a onclick="sendGameLaunch(\'' + potentialGame.commandLine + '\')">' + potentialGame.name + '</a></li>';
		$(html).appendTo('#beta-games-list');
		console.log(potentialGame);
	});
});

(<any>window).sendGameLaunch = function(commandLine: string) {
	ipcRenderer.send('client.launch-game', commandLine);
};
