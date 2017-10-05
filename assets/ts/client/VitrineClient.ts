import { ipcRenderer, shell } from 'electron';
import * as moment from 'moment';

import { GamesCollection } from '../models/GamesCollection';
import { GameSource, PotentialGame } from '../models/PotentialGame';
import { PlayableGame } from '../models/PlayableGame';
import { languageInstance } from './Language';
import { displayRemoveGameModal, formatTimePlayed, urlify } from './helpers';

export class VitrineClient {
	private potentialGames: GamesCollection<PotentialGame>;
	private playableGames: GamesCollection<PlayableGame>;
	private clickedGame: PlayableGame;
	private releaseUrl: string;

	public constructor() {
		this.potentialGames = new GamesCollection();
		this.playableGames = new GamesCollection();
		this.releaseUrl = 'https://github.com/paul-roman/vitrine/releases/tag/v';

		window.onerror = function(message: string, filename?: string, line?: number, col?: number, error?: Error) {
			let errorHtml: string = '<h4>' + languageInstance.replaceJs('error') + '</h4><hr>'
				+ '<pre>' + filename + ':' + line + ':' + col + '</pre><p>' + message.replace('Uncaught Error: ', '') + '</p>';
			$('#error-message').clear().html(errorHtml);
			$('#error-modal').modal('show');
		}
	}

	public run() {
		this.clickedGame = null;
		ipcRenderer.send('client.ready');
		this.registerKeyboardEvents();
		$('#refresh-btn').find('i').addClass('fa-spin');
	}

	public registerEvents() {
		ipcRenderer.on('server.update-progress', this.updateProgress.bind(this));
		ipcRenderer.on('server.update-downloaded', this.updateDownloaded.bind(this));
		ipcRenderer.on('server.server-error', this.serverError.bind(this));
		ipcRenderer.on('server.send-igdb-game', this.getIgdbGame.bind(this));
		ipcRenderer.on('server.send-igdb-searches', this.getIgdbSearches.bind(this));
		ipcRenderer.on('server.add-potential-games', this.addPotentialGames.bind(this));
		ipcRenderer.on('server.add-playable-games', this.addPlayableGames.bind(this));
		ipcRenderer.on('server.remove-potential-game', this.removePotentialGame.bind(this));
		ipcRenderer.on('server.add-playable-game', this.addPlayableGame.bind(this));
		ipcRenderer.on('server.edit-playable-game', this.editPlayableGame.bind(this));
		ipcRenderer.on('server.remove-playable-game', this.removePlayableGame.bind(this));
		ipcRenderer.on('server.stop-game', this.stopGame.bind(this));
	}

	public getPlayableGame(gameId: string, callback: Function) {
		this.playableGames.getGame(gameId).then(([game]) => {
			callback(null, game);
		}).catch((error) => {
			callback(error, null);
		});
	}

	private updateProgress(event: Electron.Event, progress: any) {
		if (!$('#update-bar').is(':visible'))
			$('#update-bar').show();
		let percentage: number = Math.round(progress.percent);
		$('#update-bar .progress-bar').css({
			width: percentage + '%'
		});
	}

	private updateDownloaded(event: Electron.Event, version: string) {
		let changeLogsHtml: string = '<a href="#">' + languageInstance.replaceJs('changeLogs') + '</a>';
		$('#update-app-disclaimer').html(languageInstance.replaceJs('updateText', version));
		$('#app-change-logs').html(changeLogsHtml).click((event) => {
			event.preventDefault();
			shell.openExternal(this.releaseUrl + version);
		});
		$('#update-app-btn').click(function() {
			$(this).loading();
			ipcRenderer.send('client.update-app');
		});
		$('#update-modal').modal('show');
	}

	private serverError(event: Electron.Event, error: string) {
		throw new Error(error);
	}

	private getIgdbGame(event: Electron.Event, error: string, game: any) {
		if (error)
			throw new Error(error);
		$('#fill-with-igdb-btn').html(languageInstance.replaceJs('fillWithIgdb'));
		$('#submit-igdb-research-btn').html(languageInstance.replaceJs('submitNewGame'));
		$('#igdb-research-modal').modal('hide');

		let formSelector: JQuery = $('#add-game-form');

		formSelector.find('input[name=name]').val(game.name);
		formSelector.find('input[name=series]').val(game.series);
		formSelector.find('input[name=developer]').val(game.developer);
		formSelector.find('input[name=publisher]').val(game.publisher);
		formSelector.find('input[name=date]').datepicker('update', moment.unix(game.releaseDate / 1000).format('DD/MM/YYYY'));
		formSelector.find('input[name=genres]').val(game.genres.join(', '));
		formSelector.find('input[name=rating]').val(game.rating);
		formSelector.find('textarea[name=summary]').val(game.summary);

		$('#add-background-picker *:not(".manual-screenshot")').remove();
		game.screenshots.forEach((screenshot: string, index: number) => {
			let isFirst: boolean = (!index && !$('#add-background-picker').find('.manual-screenshot').length) ? (true) : (false);
			let currentScreenshotHtml: string = '<img src="' + screenshot + '" ' + ((isFirst) ? ('class="selected-screenshot"') : ('')) + '>';
			let currentScreenshot: JQuery = $(currentScreenshotHtml).click(function() {
				$(this).parent().find('img.selected-screenshot').removeClass('selected-screenshot');
				$(this).addClass('selected-screenshot');
				formSelector.find('input[name=background]').val(screenshot);
			});
			formSelector.find('#add-background-picker').append(currentScreenshot);
			if (isFirst)
				formSelector.find('input[name=background]').val(screenshot);
		});

		$('#add-game-cover').find('.image').css({
			backgroundImage: urlify(game.cover)
		});
		formSelector.find('input[name=cover]').val(game.cover);
		if (!formSelector.find('input[name=source]').val())
			formSelector.find('input[name=source]').val(GameSource.LOCAL);
		if ($('#add-games-modal').is(':visible'))
			$('#add-games-modal').modal('hide');
		if (!$('#add-game-modal').is(':visible'))
			$('#add-game-modal').modal('show');
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
		$('#refresh-btn').find('i').removeClass('fa-spin');
		this.potentialGames.games = games;
		this.renderPotentialGames(event);
	}

	private removePotentialGame(event: Electron.Event, gameId: string)  {
		this.potentialGames.removeGame(gameId, (error, game: PotentialGame) => {
			if (error)
				throw new Error(error);
			else if (game) {
				this.renderPotentialGames(event);
			}
		});
	}

	private addPlayableGames(event: Electron.Event, games: PlayableGame[]) {
		this.playableGames.games = games;
		this.renderPlayableGames(() => {
			if (this.playableGames.games.length)
				this.updateGameUi(this.playableGames.games[0]);
			else
				this.updateGameUi(null);
		});
	}

	private addPlayableGame(event: Electron.Event, playableGame: PlayableGame) {
		$('#add-game-modal').modal('hide');
		$('#add-game-submit-btn').html(languageInstance.replaceJs('submitNewGame'));
		this.potentialGames.removeGame(playableGame.uuid, () => {
			this.renderPotentialGames(event);
		});
		this.playableGames.addGame(playableGame);
		this.renderPlayableGames(() => {
			this.updateGameUi(playableGame);
		});
	}

	private editPlayableGame(event: Electron.Event, playableGame: PlayableGame) {
		$('#edit-game-modal').modal('hide');
		$('#edit-game-submit-btn').html(languageInstance.replaceJs('editGame'));
		this.playableGames.editGame(playableGame);
		this.renderPlayableGames(() => {
			this.updateGameUi(playableGame);
		});
	};

	private removePlayableGame(event: Electron.Event, error: string, gameId: string) {
		if (error)
			throw new Error(error);
		this.playableGames.removeGame(gameId, (error, game: PlayableGame, index: number) => {
			if (error)
				throw new Error(error);
			this.renderPlayableGames(() => {
				if (this.playableGames.games.length) {
					if (index)
						this.updateGameUi(this.playableGames.games[index - 1]);
					else
						this.updateGameUi(this.playableGames.games[index]);
				}
				else
					this.updateGameUi(null);
			});
		});
	}

	private stopGame(event: Electron.Event, gameId: string, totalTimePlayed: number)  {
		this.playableGames.getGame(gameId).then(([game]) => {
			game.timePlayed = totalTimePlayed;
			this.updateGameUi(game);
		}).catch((error) => {
			throw error;
		});
	}

	private renderPotentialGames(event: Electron.Event) {
		if (!this.potentialGames.games.length) {
			$('#potential-games-area').clear();
			return;
		}
		this.potentialGames.sort();
		let counter: number = 0;
		let gamesList: JQuery = $('<div class="row potential-games-row"></div>');
		this.potentialGames.forEach((potentialGame: PotentialGame) => {
			let gameHtml: string = '<div class="col-md-3">'
				+ '<div class="potential-game-cover"><div class="image" style="background-image: url(' + potentialGame.details.cover + ')"></div>'
				+ '<i class="fa fa-plus-circle icon animated"></i></div>'
				+ '<span class="potential-game-name">' + potentialGame.name + '</span>'
				+ '</div>';
			let game: JQuery = $(gameHtml);
			game.find('div.potential-game-cover').blurPicture(55, function() {
				$(this).find('.image').off().addClass('cover-hovered');
				$(this).find('.icon').off().removeClass('fa-plus-circle').addClass('fa-spinner fa-spin cover-hovered');
				event.sender.send('client.fill-igdb-game', potentialGame.details.id);
				let formSelector: JQuery = $('#add-game-form');
				let exePath: string = potentialGame.commandLine.shift();
				formSelector.find('input[name=executable]').val(exePath);
				formSelector.find('input[name=arguments]').val(potentialGame.commandLine.join(' '));
				formSelector.find('input[name=source]').val(potentialGame.source);
				$('#fill-with-igdb-btn').prop('disabled', false);
				$('#add-game-submit-btn').prop('disabled', false);
			});
			gamesList.append(game);
			counter++;
			if (counter === this.potentialGames.games.length) {
				$('#add-games-modal').find('.modal-body').clear().append(gamesList);
				let buttonHtml: string = '<button id="add-potential-games-btn" class="btn btn-primary" data-toggle="modal" data-target="#add-games-modal">' +
					languageInstance.replaceJs('potentialGamesAdd', this.potentialGames.games.length) +
					'</button>';
				$('#potential-games-area').html(buttonHtml);
			}
		});
	}

	private renderPlayableGames(callback?: Function) {
		$('#playable-games-list').clear();

		if (!this.playableGames.games.length) {
			this.updateGameUi(null);
			return;
		}
		this.playableGames.sort();
		this.playableGames.forEach((playableGame: PlayableGame) => {
			let gameLiHtml: string = '<li game-id="' + playableGame.uuid + '" class="play-game-link">' + playableGame.name + '</li>';
			let self: VitrineClient = this;
			let gameLi: JQuery = $(gameLiHtml).click(function() {
				self.playableGames.getGame(playableGame.uuid).then(([game]) => {
					if (self.clickedGame && self.clickedGame.uuid === playableGame.uuid)
						return;
					self.updateGameUi(game);
				}).catch((error) => {
					throw new Error(error);
				});
			}).dblclick(() => {
				ipcRenderer.send('client.launch-game', playableGame.uuid);
			});
			$('#playable-games-list').append(gameLi);
		}, () => {
			if (callback)
				callback();
		});
	}

	private updateGameUi(game: PlayableGame) {
		if (!game) {
			$('#game-core').fadeOut(100);
			$('#game-background').beforeCss('#game-background', {
				'background-image': 'none'
			});
			$('#no-game-showcase').fadeIn(100);
			return;
		}
		$('li.play-game-link').removeClass('selected-game');
		$('li.play-game-link[game-id="' + game.uuid + '"]').addClass('selected-game');

		if (!$('#game-core').is(':visible'))
			$('#no-game-showcase').fadeOut(100);

		$('#game-core').fadeOut(100, () => {
			$('#game-title').html(game.name);
			$('#game-play').addClass('game-infos-visible').find('button').off('click').click(() => {
				ipcRenderer.send('client.launch-game', game.uuid);
			});
			$('#game-play').find('p').clear();
			if (game.timePlayed)
				$('#game-play').find('p').html(languageInstance.replaceJs('timePlayed') + ' ' + formatTimePlayed(game.timePlayed));
			$('#game-desc').addClass('game-infos-visible').html(game.details.summary);

			if (game.details.backgroundScreen) {
				$('#game-background').beforeCss('#game-background', {
					'background-image': urlify(game.details.backgroundScreen)
				});
			}
			else {
				$('#game-background').beforeCss('#game-background', {
					backgroundImage: 'none'
				});
			}
			$('#selected-game-cover').css({
				display: 'block'
			}).find('.image').css({
				backgroundImage: urlify(game.details.cover)
			}).parent().updateBlurClickCallback(() => {
				ipcRenderer.send('client.launch-game', game.uuid);
			});
			$('#game-core').fadeIn(100);
		});

		this.clickedGame = game;
	}

	private registerKeyboardEvents() {
		$(document).keydown((event) => {
			if (!this.playableGames.games.length || !this.clickedGame)
				return;
			switch (event.which) {
				case 13: {
					ipcRenderer.send('client.launch-game', this.clickedGame.uuid);
					break;
				}
				case 46: {
					displayRemoveGameModal(this.clickedGame.uuid, this.clickedGame.name);
					break;
				}
				case 38: {
					let index: number = this.playableGames.games.indexOf(this.clickedGame);
					if (index)
						this.updateGameUi(this.playableGames.games[index - 1]);
					break;
				}
				case 40: {
					let index: number = this.playableGames.games.indexOf(this.clickedGame);
					if (index !== this.playableGames.games.length - 1)
						this.updateGameUi(this.playableGames.games[index + 1]);
					break;
				}
			}
		});
		$('.modal').keydown((event) => {
			if (event.which === 27)
				$(this).modal('hide');
		});
	}
}
