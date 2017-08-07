import { ipcRenderer } from 'electron';
import * as dateFormat from 'dateformat';

import { GamesCollection } from '../models/GamesCollection';
import { PotentialGame } from '../models/PotentialGame';
import { PlayableGame } from '../models/PlayableGame';
import { languageInstance } from './Language';
import { beforeCss } from './helpers';

export class VitrineClient {
	private potentialGames: GamesCollection<PotentialGame>;
	private playableGames: GamesCollection<PlayableGame>;
	private clickedGame: PlayableGame;
	private gameLaunched: boolean;

	constructor() {
		this.potentialGames = new GamesCollection();
		this.playableGames = new GamesCollection();
		this.gameLaunched = false;
	}

	public run() {
		this.clickedGame = null;
		ipcRenderer.send('client.ready');

		window.onerror = function(error, url, line) {
			let errorHtml: string = '<h3>' + languageInstance.replaceJs('error') + '</h3><hr><h4>' + error + '</h4>';
			$('#error-message').html('').html(errorHtml);
			(<any>$('#error-modal')).modal('show');
		}
	}

	public registerEvents() {
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
		ipcRenderer.on('server.add-potential-games', (event, games) => {
			this.potentialGames.games = games;
			this.renderPotentialGames();
		});
		ipcRenderer.on('server.add-playable-games', (event, games) => {
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
			this.renderPlayableGames();
		});
		ipcRenderer.on('server.stop-game', () => {
			console.log('Game stopped.');
			this.gameLaunched = false;
		});
	}

	private renderPotentialGames() {
		let html: string = '<button id="add-potential-games-btn" class="btn btn-primary" data-toggle="modal" data-target="#add-games-modal">' +
			languageInstance.replaceJs('potentialGamesAdd', this.potentialGames.games.length) +
			'</button>';
		$('#potential-games-area').html(html);
	}

	private renderPlayableGames() {
		$('#playable-games-list').html('');

		this.playableGames.sort();

		let counter: number = 0;
		this.playableGames.forEach((playableGame: PlayableGame) => {
			let html: string = '<li game-id="' + playableGame.uuid + '" class="play-game-link">' + playableGame.name + '</li>';
			$('#playable-games-list').append(html);
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
					this.clickedGame = game;
					let self: VitrineClient = this;
					let events: any = {
						click() {
							(<any>$('#game-cover-component')).animateCss('pulse', 120);
							if (!self.gameLaunched) {
								ipcRenderer.send('client.launch-game', self.clickedGame.uuid);
								self.gameLaunched = true;
							}
						}
					};
					$(document.body).on(events, '#game-cover-image');
					$(document.body).on(events, '#cover-play-btn');
				});
			});
		});
	}
}
