import { ipcRenderer } from 'electron';
import { beforeCss, alphabeticSort } from './helpers';

function createGameClickEvents() {
	$('a[game-id]').each(function() {
		$(this).click(() => {
			let gameId: string = $(this).attr('game-id');
			ipcRenderer.send('client.launch-game', gameId);
		});
	})
}

export function launchEvents() {
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
		if (potentialGames.length)
			potentialGames.sort(alphabeticSort);
		let counter: number = 0;
		potentialGames.forEach((potentialGame) => {
			let html: string = '<li><a game-id="' + potentialGame.commandLine + '">' + potentialGame.name + '</a></li>';
			//$('#beta-games-list').append(html);
			console.log('bah alors:', $('#beta-games-list'));
			counter++;
			if (counter == potentialGames.length)
				createGameClickEvents();
		});
	});

	(<any>window).sendGameLaunch = function (commandLine: string) {
		ipcRenderer.send('client.launch-game', commandLine);
	};
}
