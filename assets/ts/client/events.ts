import { ipcRenderer } from 'electron';

import { PotentialSteamGame } from '../server/games/PotentialSteamGame';
import { beforeCss, alphabeticSort } from './helpers';

let potentialSteamGames: PotentialSteamGame[];

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
	$('#beta-games-list').html('');

	if (potentialSteamGames.length)
		(<any>potentialSteamGames).sort(alphabeticSort);

	let counter: number = 0;
	potentialSteamGames.forEach((potentialGame) => {
		let html: string = '<li>' +
			//'<a game-id="' + potentialGame.uuid + '">' + potentialGame.name + '</a>' +
			'<button game-id="' + potentialGame.uuid + '" class="btn btn-success btn-sm add-game-btn">Add ' + potentialGame.name + '</button>' +
			'</li>';
		$('#beta-games-list').append(html);
		counter++;
		if (counter == potentialSteamGames.length)
			createGameClickEvents();
	});
}

export function setClientReady() {
	ipcRenderer.send('client.ready');
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
		console.log(potentialGames);
		potentialSteamGames = potentialGames;
		renderPotentialGames();
	});

	ipcRenderer.on('server.remove-potential-game', (event, gameId) => {
		potentialSteamGames.forEach(function(potentialGame) {
			if (potentialGame.uuid == gameId) {
				let index: number = potentialSteamGames.indexOf(potentialGame);
				potentialSteamGames.splice(index, 1);
				renderPotentialGames();
			}
		});
	});
}
