import { ipcRenderer, remote } from 'electron';
import * as formToObject from 'form-to-object';

import { languageInstance } from './Language';
import {displayRemoveGameModal, extendJQuery, openExecutableDialog, openImageDialog, urlify} from './helpers';

function registerModalOverlay() {
	$(document).on('show.bs.modal', '.modal', function() {
		let zIndex = 1040 + (10 * $('.modal:visible').length);
		$(this).css('z-index', zIndex);
		setTimeout(() => {
			$('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
		}, 0);
	});
}

function registerGameCover() {
	let gameCoverEvents: any = {
		mouseenter() {
			$('#game-cover-image').addClass('cover-hovered');
			$('#game-cover-component').addClass('cover-hovered');
			$('#cover-play-btn').animateCss('zoomIn', 75).addClass('play-btn-visible');
		},
		mouseleave() {
			$('#game-cover-image').removeClass('cover-hovered');
			$('#game-cover-component').removeClass('cover-hovered');
			(<any>$('#cover-play-btn')).removeClass('play-btn-visible');
		}
	};

	$(document.body).on(gameCoverEvents, '#game-cover-image');
	$(document.body).on(gameCoverEvents, '#cover-play-btn');
}

function registerAddGameForm() {
	let formSelector = $('#add-game-form');
	$('#add-game-cover').blurPicture(55, function() {
		let cover: string = openImageDialog();
		if (cover) {
			cover = 'file://' + cover;
			this.find('.image').css({
				'background-image': urlify(cover)
			});
			formSelector.find('input[name=cover]').val(cover);
		}
	});

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
		let dialogRet: string = openExecutableDialog();
		if (dialogRet)
			$('#add-game-form').find('input[name=executable]').val(dialogRet);
		if (formSelector.find('input[name=name]').val())
			$('#add-game-submit-btn').prop('disabled', false);
	});

	$('#add-game-submit-btn').click(() => {
		let gameForm: any = formToObject($('#add-game-form')[0]);
		ipcRenderer.send('client.add-game-manual', gameForm);
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

		$('#fill-with-igdb-btn').prop('disabled', true);
		$('#add-game-submit-btn').prop('disabled', true);
		$('#background-picker').clear();
	});

	$('#add-custom-background-btn').click((event) => {
		event.preventDefault();

		let screenshot: string = openImageDialog();
		if (screenshot) {
			screenshot = 'file://' + screenshot;
			let currentScreenshotHtml: string = '<img src="' + screenshot + '" class="selected-screenshot manual-screenshot">';
			let currentScreenshot: JQuery = $(currentScreenshotHtml).click(function () {
				$(this).parent().find('img.selected-screenshot').removeClass('selected-screenshot');
				$(this).addClass('selected-screenshot');
				formSelector.find('input[name=background]').val(screenshot);
			});
			$('#background-picker').find('img.selected-screenshot').removeClass('selected-screenshot');
			formSelector.find('input[name=background]').val(screenshot);
			if ($('#background-picker').find('.manual-screenshot').length) {
				$('#background-picker').find('.manual-screenshot').replaceWith(currentScreenshot)
			}
			else {
				$('#background-picker').prepend(currentScreenshot);
			}
		}
	});
}

function registerIgdbResearchForm() {
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

function registerContextMenu() {
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

export function launchDom() {
	extendJQuery();

	registerModalOverlay();
	registerGameCover();
	registerAddGameForm();
	registerIgdbResearchForm();
	registerContextMenu();

	$('input[type=number]').each(function() {
		$(this).numberPicker();
	});

	$('#selected-game-cover').blurPicture(125, () => {}).hide();
}
