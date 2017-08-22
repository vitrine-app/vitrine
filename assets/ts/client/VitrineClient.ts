import { ipcRenderer } from 'electron';
import * as dateFormat from 'dateformat';

import { GamesCollection } from '../models/GamesCollection';
import { PotentialGame } from '../models/PotentialGame';
import { PlayableGame } from '../models/PlayableGame';
import { languageInstance } from './Language';
import { formatTimePlayed, urlify } from './helpers';

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
			$('#error-message').clear().html(errorHtml);
			$('#error-modal').modal('show');
		}
	}

	public run() {
		this.clickedGame = null;
		ipcRenderer.send('client.ready');
	}

	public registerEvents() {
		ipcRenderer.on('server.server-error', this.serverError.bind(this));
		ipcRenderer.on('server.send-igdb-game', this.getIgdbGame.bind(this));
		ipcRenderer.on('server.send-igdb-searches', this.getIgdbSearches.bind(this));
		ipcRenderer.on('server.add-potential-games', this.addPotentialGames.bind(this));
		ipcRenderer.on('server.add-playable-games', this.addPlayableGames.bind(this));
		ipcRenderer.on('server.remove-potential-game', this.removePotentialGame.bind(this));
		ipcRenderer.on('server.add-playable-game', this.addPlayableGame.bind(this));
		ipcRenderer.on('server.remove-playable-game', this.removePlayableGame.bind(this));
		ipcRenderer.on('server.stop-game', this.stopGame.bind(this));
	}

	private serverError(event: Electron.Event, error: string) {
		if (error) {
			throw new Error(error);
		}
	}

	private getIgdbGame(event: Electron.Event, error: string, game: any) {
		if (error)
			throw new Error(error);
		$('#fill-with-igdb-btn').html(languageInstance.replaceJs('fillWithIgdb'));
		$('#submit-igdb-research-btn').html(languageInstance.replaceJs('submitNewGame'));
		$('#igdb-research-modal').modal('hide');

		let formSelector = $('#add-game-form');

		formSelector.find('input[name=name]').val(game.name);
		formSelector.find('input[name=series]').val(game.series);
		formSelector.find('input[name=developer]').val(game.developer);
		formSelector.find('input[name=publisher]').val(game.publisher);
		formSelector.find('input[name=date]').datepicker('update', dateFormat(game.release_date, 'dd/mm/yyyy'));
		formSelector.find('input[name=genres]').val(game.genres.join(', '));
		formSelector.find('input[name=rating]').val(game.rating);
		formSelector.find('textarea[name=summary]').val(game.summary);

		$('#background-picker *:not(".manual-screenshot")').remove();
		$('#background-picker-group').show();
		game.screenshots.forEach((screenshot: string, index: number) => {
			let isFirst: boolean = (!index && !$('#background-picker').find('.manual-screenshot').length) ? (true) : (false);
			let currentScreenshotHtml: string = '<img src="' + screenshot + '" ' + ((isFirst) ? ('class="selected-screenshot"') : ('')) + '>';
			let currentScreenshot: JQuery = $(currentScreenshotHtml).click(function() {
				$(this).parent().find('img.selected-screenshot').removeClass('selected-screenshot');
				$(this).addClass('selected-screenshot');
				formSelector.find('input[name=background]').val(screenshot);
			});
			formSelector.find('#background-picker').append(currentScreenshot);
			if (isFirst)
				formSelector.find('input[name=background]').val(screenshot);
		});

		$('#add-game-cover').find('.image').css({
			'background-image': urlify(game.cover)
		});
		formSelector.find('input[name=cover]').val(game.cover);
	}

	private getIgdbSearches(event: Electron.Event, error: string, games: any) {
		if (error)
			throw new Error(error);
		let listSelector: JQuery = $('#igdb-researches-list');

		listSelector.clear();

		let counter: number = 0;
		games.forEach((game: any) => {
			let researchRowHtml = '<div class="row"><div  class="col-md-3"><img src="' + game.cover + '"></div>' +
				'<span class="col-md-9">' + game.name + '</span></div>';
			let researchRow: JQuery = $(researchRowHtml).click(function() {
				listSelector.find('div.row').removeClass('selected-igdb-research');
				$(this).addClass('selected-igdb-research');
				$('#submit-igdb-research-btn').prop('disabled', false);
				$('#igdb-research-form').find('input[name=game-id]').val(game.id);
			});
			listSelector.append(researchRow);
			counter++;
			if (counter === games.length) {
				if (!$('#igdb-research-modal').is(':visible'))
					$('#igdb-research-modal').modal('show');
				$('#fill-with-igdb-btn').html(languageInstance.replaceJs('fillWithIgdb'));
				$('#igdb-new-research-btn').html('<i class="fa fa-search"></i>');
			}
		});
	}

	private addPotentialGames(event: Electron.Event, games: PotentialGame[]) {
		this.potentialGames.games = games;
		this.renderPotentialGames();
	}

	private removePotentialGame(event: Electron.Event, gameId: string)  {
		this.potentialGames.removeGame(gameId, (error, game: PotentialGame) => {
			if (error)
				throw new Error(error);
			else if (game) {
				this.renderPotentialGames();
			}
		});
	}

	private addPlayableGames(event: Electron.Event, games: PlayableGame[]) {
		this.playableGames.games = games;
		this.renderPlayableGames();
		if (this.playableGames.games.length)
			this.updateGameUi(this.playableGames.games[0]);
	}

	private addPlayableGame(event: Electron.Event, playableGame: PlayableGame) {
		if (!playableGame.details.steamId) {
			$('#add-game-modal').modal('hide');
			$('#add-game-submit-btn').html(languageInstance.replaceJs('submitNewGame'));
		}
		this.playableGames.addGame(playableGame);
		this.renderPlayableGames();
	}

	private removePlayableGame(event: Electron.Event, error: string, gameId: string) {
		if (error)
			throw new Error(error);
		this.playableGames.removeGame(gameId, (error, game: PlayableGame, index: number) => {
			if (error)
				throw new Error(error);
			this.renderPlayableGames();
			if (this.playableGames.games.length)
				this.updateGameUi(this.playableGames.games[index - 1]);
			else
				this.updateGameUi(null);
		});
	}

	private stopGame(event: Electron.Event, gameId: string, totalTimePlayed: number)  {
		this.playableGames.getGame(gameId, (error: string, game: PlayableGame) => {
			if (error)
				throw new Error(error);
			game.timePlayed = totalTimePlayed;
			this.updateGameUi(game);
		});
	}

	private renderPotentialGames() {
		if (!this.potentialGames.games.length) {
			$('#potential-games-area').clear();
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
					$('#add-games-modal').find('.modal-body').clear().html(gamesListHtml);
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
		$('#playable-games-list').clear();

		this.playableGames.sort();
		this.playableGames.forEach((playableGame: PlayableGame) => {
			let gameLiHtml: string = '<li game-id="' + playableGame.uuid + '" class="play-game-link">' + playableGame.name + '</li>';
			let self: VitrineClient = this;
			let gameLi: JQuery = $(gameLiHtml).click(function() {
				self.playableGames.getGame(playableGame.uuid, (error, game) => {
					if (error)
						throw new Error(error);
					if (self.clickedGame && self.clickedGame.uuid === playableGame.uuid)
						return;
					self.updateGameUi(game);
				});
			}).dblclick(() => {
				ipcRenderer.send('client.launch-game', playableGame.uuid);
			});
			$('#playable-games-list').append(gameLi);
		});
	}

	private updateGameUi(game: PlayableGame) {
		if (!game) {
			console.log('no more games');
			return;
		}
		$('li.play-game-link').removeClass('selected-game');
		$('li.play-game-link[game-id="' + game.uuid + '"]').addClass('selected-game');

		$('#game-title').html(game.name);
		$('#game-play').addClass('game-infos-visible').find('button').off('click').click(() => {
			ipcRenderer.send('client.launch-game', game.uuid);
		});
		if (game.timePlayed)
			$('#game-play').find('p').html(languageInstance.replaceJs('timePlayed') + ' ' + formatTimePlayed(game.timePlayed));
		$('#game-desc').addClass('game-infos-visible').html(game.details.summary);

		$('#game-background').beforeCss('#game-background', {
			'background-image': urlify(game.details.backgroundScreen)
		});
		$('#selected-game-cover').css({
			'display': 'block'
		}).find('.image').css({
			'background-image': urlify(game.details.cover)
		}).parent().updateBlurClickCallback(() => {
			ipcRenderer.send('client.launch-game', game.uuid);
		});
		this.clickedGame = game;
	}
}
