import { ipcRenderer } from 'electron';

import { PotentialGame } from '../server/games/PotentialGame';
import { PlayableGame } from '../server/games/PlayableGame';
import { beforeCss, alphabeticSort } from './helpers';

let potentialGames: PotentialGame[];
let playableGames: PlayableGame[];

function createGameClickEvents() {
	$('a[game-id]').each(function() {
		$(this).click(() => {
			let gameId: string = $(this).attr('game-id');
			ipcRenderer.send('client.launch-game', gameId);
		});
	});
	$('button.add-game-btn[game-id]').each(function() {
		$(this).click(() => {
			let gameId: string = $(this).attr('game-id');
			ipcRenderer.send('client.add-game', gameId);
		});
	});
}

function renderPotentialGames() {
	$('#potential-games-list').html('');

	if (potentialGames.length)
		(<any>potentialGames).sort(alphabeticSort);

	let counter: number = 0;
	potentialGames.forEach((potentialGame) => {
		let html: string = '<li>' +
			//'<a game-id="' + potentialGame.uuid + '">' + potentialGame.name + '</a>' +
			'<button game-id="' + potentialGame.uuid + '" class="btn btn-success btn-sm add-game-btn">Add ' + potentialGame.name + '</button>' +
			'</li>';
		$('#potential-games-list').append(html);
		counter++;
		if (counter == potentialGames.length)
			createGameClickEvents();
	});
}

export function setClientReady() {
	ipcRenderer.send('client.ready');
}

export function launchEvents() {
	ipcRenderer.on('server.send-game', (event, game) => {
		console.log(game);
		$('#game-cover-container').css({
			'display': 'block'
		});
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

	ipcRenderer.on('server.add-potential-games', (event, games) => {
		console.log('Potential games:', games);
		potentialGames = games;
		renderPotentialGames();
	});

	ipcRenderer.on('server.add-playable-games', (event, games) => {
		console.log('Playable games:', games);
		playableGames = games;
	});

	ipcRenderer.on('server.remove-potential-game', (event, gameId) => {
		potentialGames.forEach((potentialGame) => {
			if (potentialGame.uuid == gameId) {
				let index: number = potentialGames.indexOf(potentialGame);
				potentialGames.splice(index, 1);
				renderPotentialGames();
			}
		});
	});
}
