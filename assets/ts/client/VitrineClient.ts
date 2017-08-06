import { ipcRenderer } from 'electron';

import { GamesCollection } from '../models/GamesCollection';
import { PotentialGame } from '../models/PotentialGame';
import { PlayableGame } from '../models/PlayableGame';
import { beforeCss } from './helpers';
import { languageInstance } from './Language';

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
	}

	public registerEvents() {
		// TODO: Remove this events pipeline
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
			if (counter == this.playableGames.games.length)
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
