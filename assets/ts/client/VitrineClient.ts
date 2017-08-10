import { ipcRenderer } from 'electron';
import * as dateFormat from 'dateformat';

import { GamesCollection } from '../models/GamesCollection';
import { PotentialGame } from '../models/PotentialGame';
import { PlayableGame } from '../models/PlayableGame';
import { languageInstance } from './Language';
import { formatTimePlayed } from './helpers';

export class VitrineClient {
	private potentialGames: GamesCollection<PotentialGame>;
	private playableGames: GamesCollection<PlayableGame>;
	private clickedGame: PlayableGame;

	constructor() {
		this.potentialGames = new GamesCollection();
		this.playableGames = new GamesCollection();
		window.onerror = function(error, url, line) {
			let errorHtml: string = '<h4>' + languageInstance.replaceJs('error') + '</h4><hr>'
				+ '<pre>' + url + ':' + line + '</pre><p>' + error.replace('Uncaught Error: ', '') + '</p>';
			$('#error-message').html('').html(errorHtml);
			(<any>$('#error-modal')).modal('show');
		}
	}

	public run() {
		this.clickedGame = null;
		ipcRenderer.send('client.ready');
	}

	public registerEvents() {
		ipcRenderer.on('server.server-error', (event, error) => {
			if (error) {
				throw new Error(error);
			}
		});
		ipcRenderer.on('server.send-igdb-game', (event, error, game) => {
			if (error)
				throw new Error(error);
			$('#fill-with-igdb-btn').html(languageInstance.replaceJs('fillWithIGDB'));

			let formSelector = $('#add-game-form');

			formSelector.find('input[name=name]').val(game.name);
			formSelector.find('input[name=series]').val(game.series);
			formSelector.find('input[name=developer]').val(game.developer);
			formSelector.find('input[name=publisher]').val(game.publisher);
			formSelector.find('input[name=date]').datepicker('update', dateFormat(game.release_date, 'dd/mm/yyyy'));
			formSelector.find('input[name=genres]').val(game.genres.join(', '));
			formSelector.find('input[name=rating]').val(game.rating);
			formSelector.find('textarea[name=summary]').val(game.summary);
			formSelector.find('input[name=cover]').val(game.cover);
			// TODO: Change default screenshot
			formSelector.find('input[name=background]').val(game.screenshots[0]);

			$('#add-game-cover').html('').append('<img width="200" src="' + game.cover + '" alt="' + game.name + '">');
		});
		ipcRenderer.on('server.add-potential-games', (event, games: PotentialGame[]) => {
			this.potentialGames.games = games;
			this.renderPotentialGames();
		});
		ipcRenderer.on('server.add-playable-games', (event, games: PlayableGame[]) => {
			this.playableGames.games = games;
			this.renderPlayableGames();
		});
		ipcRenderer.on('server.remove-potential-game', (event, gameId) => {
			this.potentialGames.removeGame(gameId, (error, game: PotentialGame) => {
				if (error)
					throw new Error(error);
				else if (game) {
					this.renderPotentialGames();
				}
			})
		});
		ipcRenderer.on('server.add-playable-game', (event, playableGame) => {
			if (!playableGame.details.steamId) {
				(<any>$('#add-game-modal')).modal('hide');
				$('#add-game-submit-btn').html(languageInstance.replaceJs('submitNewGame'));
			}
			this.playableGames.addGame(playableGame);
			console.log(this.playableGames);
			this.renderPlayableGames();
		});
		ipcRenderer.on('server.game-removed', (event, error, gameId) => {
			if (error)
				throw new Error(error);
			this.playableGames.removeGame(gameId, (error) => {
				if (error)
					throw new Error(error);
				this.renderPlayableGames();
			});
		});
		ipcRenderer.on('server.stop-game', (event: any, gameId: string, totalTimePlayed: number) => {
			this.playableGames.getGame(gameId, (error: string, game: PlayableGame) => {
				if (error)
					throw new Error(error);
				game.timePlayed = totalTimePlayed;
				this.updateGameUi(game);
			});
		});
	}

	private renderPotentialGames() {
		if (!this.potentialGames.games.length) {
			$('#potential-games-area').html('');
			return;
		}
		this.potentialGames.sort();
		let counter: number = 0;
		let gamesListHtml: string = '<div class="row potential-games-row">';
		this.potentialGames.forEach((potentialGame: PotentialGame) => {
			gamesListHtml += '<div class="col-md-3 potential-game">'
				+ '<div class="potential-game-cover" style="background-image: url(' + potentialGame.details.cover + ')"></div>'
				+ potentialGame.name
				+ '</div>';
			counter++;
			if (counter % 4 === 0 || counter === this.potentialGames.games.length) {
				gamesListHtml += '</div>';
				if (counter === this.potentialGames.games.length) {
					$('#add-games-modal').find('.modal-body').html('').html(gamesListHtml);
					let buttonHtml: string = '<button id="add-potential-games-btn" class="btn btn-primary" data-toggle="modal" data-target="#add-games-modal">' +
						languageInstance.replaceJs('potentialGamesAdd', this.potentialGames.games.length) +
						'</button>';
					$('#potential-games-area').html(buttonHtml);
				}
				else
					gamesListHtml += '<div class="row potential-games-row">';
			}
		});
	}

	private renderPlayableGames() {
		$('#playable-games-list').html('');

		this.playableGames.sort();
		let counter: number = 0;
		this.playableGames.forEach((playableGame: PlayableGame) => {
			let gameLi: JQuery = $('<li game-id="' + playableGame.uuid + '" class="play-game-link">' + playableGame.name + '</li>');
			gameLi.dblclick(() => {
				ipcRenderer.send('client.launch-game', playableGame.uuid);
			});
			$('#playable-games-list').append(gameLi);
			counter++;
			if (counter === this.playableGames.games.length)
				this.eventPlayableGames();
		});
	}

	private eventPlayableGames() {
		$('li.play-game-link[game-id]').each((index, value) => {
			$(value).click(() => {
				let gameId: string = $(value).attr('game-id');
				this.playableGames.getGame(gameId, (error, game) => {
					if (error)
						throw new Error(error);
					if (this.clickedGame && this.clickedGame.uuid === gameId)
						return;
					if (this.clickedGame)
						$('li.play-game-link[game-id=' + this.clickedGame.uuid + ']').removeClass('selected-game');
					$(value).addClass('selected-game');
					this.updateGameUi(game);
					this.clickedGame = game;
				});
			});
		});
	}

	private updateGameUi(game: PlayableGame) {
		let gameCover: string = 'url(' + game.details.cover.split('\\').join('\\\\') + ')';
		let gameBgScreen: string = 'url(' + game.details.backgroundScreen.split('\\').join('\\\\') + ')';

		$('#game-title').html(game.name);
		$('#game-play').addClass('game-infos-visible').find('p').html('Time played: ' + formatTimePlayed(game.timePlayed)).parent()
			.find('button').click(() => {
			ipcRenderer.send('client.launch-game', game.uuid);
		});
		$('#game-desc').addClass('game-infos-visible').html(game.details.summary);

		$('#game-background').beforeCss('#game-background', {
			'background-image': gameBgScreen
		});
		$('#selected-game-cover').css({
			'display': 'block'
		}).find('.image').css({
			'background-image': gameCover
		}).parent().updateBlurClickCallback(() => {
			ipcRenderer.send('client.launch-game', game.uuid);
		});
	}
}
