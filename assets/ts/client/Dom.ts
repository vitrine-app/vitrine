import { ipcRenderer, remote } from 'electron';
import * as formToObject from 'form-to-object';
import * as moment from 'moment';

import { VitrineClient } from './VitrineClient';
import { PlayableGame } from '../models/PlayableGame';
import { languageInstance } from './Language';
import { displayRemoveGameModal, extendJQuery, openExecutableDialog, openImageDialog, urlify } from './helpers';

export class Dom {
	public constructor(private vitrineClientInstance: VitrineClient) {
		extendJQuery();

		this.registerModalOverlay();
		this.registerGameCover();
		this.registerAddGameForm();
		this.registerIgdbResearchForm();
		this.registerContextMenu();

		$('input[type=number]').each(function() {
			$(this).numberPicker();
		});

		$('#selected-game-cover').blurPicture(125, () => {}).hide();
	}

	private registerModalOverlay() {
		$(document).on('show.bs.modal', '.modal', function() {
			let zIndex = 1040 + (10 * $('.modal:visible').length);
			$(this).css('z-index', zIndex);
			setTimeout(() => {
				$('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
			}, 0);
		});
	}

	private registerGameCover() {
		let gameCoverEvents: any = {
			mouseenter() {
				$('#game-cover-image').addClass('cover-hovered');
				$('#game-cover-component').addClass('cover-hovered');
				$('#cover-play-btn').animateCss('zoomIn', 75).addClass('play-btn-visible');
			},
			mouseleave() {
				$('#game-cover-image').removeClass('cover-hovered');
				$('#game-cover-component').removeClass('cover-hovered');
				$('#cover-play-btn').removeClass('play-btn-visible');
			}
		};

		$(document.body).on(gameCoverEvents, '#game-cover-image');
		$(document.body).on(gameCoverEvents, '#cover-play-btn');
	}

	private registerAddGameForm() {
		let formSelector = $('#add-game-form');
		this.registerCoverClickEvent($('#add-game-cover'), formSelector);

		formSelector.find('input[name=name]').on('input', function() {
			if ($(this).val())
				$('#fill-with-igdb-btn').prop('disabled', false);
			else
				$('#fill-with-igdb-btn').prop('disabled', true);

			if ($(this).val() && formSelector.find('input[name=executable]').val())
				$('#add-game-submit-btn').prop('disabled', false);
			else
				$('#add-game-submit-btn').prop('disabled', true);
		});

		formSelector.find('input[name=date]').datepicker({
			weekStart: 1,
			language: 'fr',
			format: 'dd/mm/yyyy'
		});

		$('#fill-with-igdb-btn').click((event) => {
			event.preventDefault();

			let gameName: any = $('#add-game-form').find('input[name=name]').val();
			$('#fill-with-igdb-btn').loading();
			$('#igdb-research-form').find('input[name=name]').val(gameName);
			ipcRenderer.send('client.search-igdb-games', gameName);
		});

		$('#add-game-executable-btn').click(() => {
			this.registerOpenExecutableDialog(formSelector, $('#add-game-submit-btn'));
		});

		$('#add-game-submit-btn').click(() => {
			let gameForm: any = formToObject($('#add-game-form')[0]);
			ipcRenderer.send('client.add-game', gameForm);
			$('#add-game-submit-btn').loading();
		});

		$('#add-game-modal').on('hidden.bs.modal', () => {
			$('#add-game-cover').clear();
			formSelector.find('input[name=name]').val('');
			formSelector.find('input[name=series]').val('');
			formSelector.find('input[name=developer]').val('');
			formSelector.find('input[name=publisher]').val('');
			formSelector.find('input[name=date]').datepicker('update', '');
			formSelector.find('input[name=genres]').val('');
			formSelector.find('input[name=rating]').val('');
			formSelector.find('textarea[name=summary]').val('');
			formSelector.find('input[name=executable]').val('');

			formSelector.find('input[name=cover]').val('');
			formSelector.find('input[name=background]').val('');
			formSelector.find('input[name=source]').val('');

			$('#fill-with-igdb-btn').prop('disabled', true);
			$('#add-game-submit-btn').prop('disabled', true);
			$('#add-background-picker').clear();
		});

		$('#add-custom-background-btn').click((event) => {
			event.preventDefault();
			this.registerCustomBackground($('#add-background-picker'), formSelector);
		});
	}

	private registerIgdbResearchForm() {
		$('#igdb-new-research-btn').click(function(event) {
			event.preventDefault();

			let formSelector: JQuery = $('#igdb-research-form');
			let research: any = formSelector.find('input[name=name]').val();
			let resultsNbStr: any = formSelector.find('input[name=results]').val();
			let resultsNb: number = parseInt(resultsNbStr);
			ipcRenderer.send('client.search-igdb-games', research, resultsNb);
			$(this).loading();
			$('#submit-igdb-research-btn').prop('disabled', true);
			formSelector.find('input[name=game-id]').val('');
		});

		$('#submit-igdb-research-btn').click(function(event) {
			event.preventDefault();

			let gameIdStr: any = $('#igdb-research-form').find('input[name=game-id]').val();
			let gameId: number = parseInt(gameIdStr);
			$(this).loading();
			ipcRenderer.send('client.fill-igdb-game', gameId);
		});
	}

	private registerContextMenu() {
		let self: Dom = this;
		$.contextMenu({
			selector: '.games-list li.play-game-link',
			items: [
				{
					name: languageInstance.replaceJs('playGame'),
					callback() {
						let gameId: string = $(this).attr('game-id');
						ipcRenderer.send('client.launch-game', gameId);
					}
				},
				{
					name: languageInstance.replaceJs('editGame'),
					callback() {
						let gameId: string = $(this).attr('game-id');
						self.vitrineClientInstance.getPlayableGame(gameId, (error, playableGame: PlayableGame) => {
							if (error)
								throw new Error(error);
							self.openEditGameModal(playableGame);
						});
					}
				},
				{
					name: languageInstance.replaceJs('removeGame'),
					callback() {
						let gameId: string = $(this).attr('game-id');
						let gameName: string = $(this)[0].innerHTML;
						displayRemoveGameModal(gameId, gameName);
					}
				}
			]
		});
	}

	private registerCoverClickEvent(coverSelector: JQuery, formSelector: JQuery): JQuery {
		return coverSelector.blurPicture(55, function() {
			let cover: string = openImageDialog();
			if (cover) {
				cover = 'file://' + cover;
				this.find('.image').css({
					backgroundImage: urlify(cover)
				});
				formSelector.find('input[name=cover]').val(cover);
			}
		});
	}

	private registerOpenExecutableDialog(formSelector: JQuery, submitBtn: JQuery) {
		let dialogRet: string = openExecutableDialog();
		if (dialogRet)
			formSelector.find('input[name=executable]').val(dialogRet);
		if (formSelector.find('input[name=name]').val())
			submitBtn.prop('disabled', false);
	}

	private registerCustomBackground(backgroundPickerSelector: JQuery, formSelector: JQuery) {
		let screenshot: string = openImageDialog();
		if (!screenshot)
			return;
		screenshot = 'file://' + screenshot;
		let currentScreenshotHtml: string = '<img src="' + screenshot + '" class="selected-screenshot manual-screenshot">';
		let currentScreenshot: JQuery = $(currentScreenshotHtml).click(function () {
			$(this).parent().find('img.selected-screenshot').removeClass('selected-screenshot');
			$(this).addClass('selected-screenshot');
			formSelector.find('input[name=background]').val(screenshot);
		});
		backgroundPickerSelector.find('img.selected-screenshot').removeClass('selected-screenshot');
		formSelector.find('input[name=background]').val(screenshot);
		if (backgroundPickerSelector.find('.manual-screenshot').length) {
			backgroundPickerSelector.find('.manual-screenshot').replaceWith(currentScreenshot)
		}
		else {
			backgroundPickerSelector.prepend(currentScreenshot);
		}
	}

	private openEditGameModal(game: PlayableGame) {
		let formSelector: JQuery = $('#edit-game-form');

		formSelector.find('input[name=name]').on('input', function() {
			if ($(this).val() && formSelector.find('input[name=executable]').val())
				$('#edit-game-submit-btn').prop('disabled', false);
			else
				$('#edit-game-submit-btn').prop('disabled', true);
		});

		formSelector.find('input[name=name]').val(game.name);
		formSelector.find('input[name=series]').val(game.details.series);
		formSelector.find('input[name=developer]').val(game.details.developer);
		formSelector.find('input[name=publisher]').val(game.details.publisher);
		formSelector.find('input[name=date]').datepicker('update', moment.unix(game.details.releaseDate).format('DD/MM/YYYY'));
		formSelector.find('input[name=genres]').val(game.details.genres.join(', '));
		formSelector.find('input[name=rating]').val(game.details.rating);
		formSelector.find('textarea[name=summary]').val(game.details.summary);

		let execDetails: string[] = game.commandLine;
		let execProgram = execDetails.shift();
		formSelector.find('input[name=executable]').val(execProgram);
		formSelector.find('input[name=arguments]').val(execDetails.join(' '));

		$('#edit-game-executable-btn').click(() => {
			this.registerOpenExecutableDialog(formSelector, $('#edit-game-submit-btn'));
		});

		formSelector.find('input[name=cover]').val(game.details.cover);
		this.registerCoverClickEvent($('#edit-game-cover'), formSelector).find('.image').css({
			backgroundImage: urlify(game.details.cover)
		});

		$('#edit-background-picker').clear();
		let currentScreenshotHtml: string = '<img src="' + game.details.backgroundScreen + '" class="selected-screenshot">';
		let currentScreenshot: JQuery = $(currentScreenshotHtml).click(function() {
			$(this).parent().find('img.selected-screenshot').removeClass('selected-screenshot');
			$(this).addClass('selected-screenshot');
			formSelector.find('input[name=background]').val(game.details.backgroundScreen);
		});
		formSelector.find('#edit-background-picker').append(currentScreenshot);
		formSelector.find('input[name=background]').val(game.details.backgroundScreen);

		$('#edit-custom-background-btn').click((event) => {
			event.preventDefault();
			this.registerCustomBackground($('#edit-background-picker'), formSelector);
		});

		$('#edit-game-submit-btn').click(() => {
			let gameForm: any = formToObject($('#edit-game-form')[0]);
			ipcRenderer.send('client.edit-game-manual', game.uuid, gameForm);
			$('#edit-game-submit-btn').loading();
		});

		$('#edit-game-modal').modal('show');
	}
}
