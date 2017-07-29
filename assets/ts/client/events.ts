import { ipcRenderer } from 'electron';

import { GamesCollection } from '../models/GamesCollection';
import { PotentialGame } from '../models/PotentialGame';
import { PlayableGame } from '../models/PlayableGame';
import { beforeCss } from './helpers';

let potentialGames: GamesCollection<PotentialGame>;
let playableGames: GamesCollection<PlayableGame>;
let selectedGameId: string;

function createGameClickEvents(treatingPlayableGames: boolean) {
	if (treatingPlayableGames) {
		$('a.play-game-link[game-id]').each(function() {
			$(this).click(() => {
				let gameId: string = $(this).attr('game-id');
				playableGames.getGame(gameId, (error, game) => {
					if (error)
						throw new Error(error);
					if (selectedGameId === gameId)
						return;
					let gameCover: string = 'url(' + game.details.cover.split('\\').join('\\\\') + ')';
					let gameBgScreen: string = 'url(' + game.details.backgroundScreen.split('\\').join('\\\\') + ')';
					$('#game-cover-container').css({
						'display': 'block'
					});
					$('#game-title').html(game.name);
					$('#game-desc').addClass('game-desc').html(game.details.summary);
					$('#game-cover-image').css({
						'background-image': gameCover,
						'background-repeat': 'no-repeat',
						'background-size': '100% 100%',
					});
					beforeCss('#game-background', {
						'background-image': gameBgScreen
					});
					selectedGameId = gameId;
				});
				// ipcRenderer.send('client.launch-game', gameId);
			});
		});
	}
	else {
		$('button.add-game-btn[game-id]').each(function() {
			$(this).click(() => {
				let gameId: string = $(this).attr('game-id');
				ipcRenderer.send('client.add-game', gameId);
			});
		});
	}
}

function renderPotentialGames() {
	$('#potential-games-list').html('');

	potentialGames.sort();

	let counter: number = 0;
	potentialGames.forEach((potentialGame: PotentialGame) => {
		let html: string = '<li>' +
			//'<a game-id="' + potentialGame.uuid + '">' + potentialGame.name + '</a>' +
			'<button game-id="' + potentialGame.uuid + '" class="btn btn-success btn-sm add-game-btn">Add ' + potentialGame.name + '</button>' +
			'</li>';
		$('#potential-games-list').append(html);
		counter++;
		if (counter == potentialGames.games.length)
			createGameClickEvents(false);
	});
}

function renderPlayableGames() {
	$('#playable-games-list').html('');

	playableGames.sort();

	let counter: number = 0;
	playableGames.forEach((playableGame: PlayableGame) => {
		let html: string = '<li><a class="play-game-link" game-id="' + playableGame.uuid + '">' + playableGame.name + '</a></li>';
		$('#playable-games-list').append(html);
		counter++;
		if (counter == playableGames.games.length)
			createGameClickEvents(true);
	});
}

export function setClientReady() {
	potentialGames = new GamesCollection();
	playableGames = new GamesCollection();
	ipcRenderer.send('client.ready');
}

export function launchEvents() {
	ipcRenderer.on('server.send-game', (event, game) => {
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
		potentialGames.games = games;
		renderPotentialGames();
	});

	ipcRenderer.on('server.add-playable-games', (event, games) => {
		playableGames.games = games;
		renderPlayableGames();
	});

	ipcRenderer.on('server.remove-potential-game', (event, gameId) => {
		potentialGames.removeGame(gameId, (error, game: PotentialGame) => {
			if (error)
				throw new Error(error);
			else if (game) {
				playableGames.addGame(PlayableGame.toPlayableGame(game));
				renderPotentialGames();
				renderPlayableGames();
			}
		})
	});
}
