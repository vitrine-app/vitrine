import { ipcRenderer, remote } from 'electron';
import * as formToObject from 'form-to-object';

import { languageInstance } from './Language';
import { extendJQuery } from './helpers';

function registerModalOverlay() {
	$(document).on('show.bs.modal', '.modal', function() {
		let zIndex = 1040 + (10 * $('.modal:visible').length);
		$(this).css('z-index', zIndex);
		setTimeout(function() {
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
		$('#fill-with-igdb-btn').html(languageInstance.replaceJs('loading'));
		ipcRenderer.send('client.fill-igdb-game', gameName);
	});

	$('#add-game-executable-btn').click(() => {
		let dialogRet: string[] = remote.dialog.showOpenDialog({
			properties: ['openFile'],
			filters: [
				{name: languageInstance.replaceJs('executables'), extensions: ['exe']},
				{name: languageInstance.replaceJs('allFiles'), extensions: ['*']}
			]
		});
		if (!dialogRet || !dialogRet.length)
			return;
		$('#add-game-form').find('input[name=executable]').val(dialogRet[0]);
		if (formSelector.find('input[name=name]').val())
			$('#add-game-submit-btn').prop('disabled', false);
	});

	$('#add-game-submit-btn').click(() => {
		let gameForm: any = formToObject($('#add-game-form')[0]);
		ipcRenderer.send('client.add-game-manual', gameForm);
		$('#add-game-submit-btn').html(languageInstance.replaceJs('loading'));
	});

	$('#add-game-modal').on('hidden.bs.modal', () => {
		$('#add-game-cover').html('');
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
	});
}

function registerContextMenu() {
	(<any>$).contextMenu({
		selector: '.games-list li.play-game-link',
		items: {
			foo: { name: 'Remove', callback() {
				let gameId: string = $(this).attr('game-id');
				ipcRenderer.send('client.remove-game', gameId);
				console.log('Removal sent');
			}}
		}
	});
}

export function launchDom() {
	extendJQuery();
	$(document.body).on('submit', '#game-name-form', function(event) {
		event.preventDefault();

		let form: any = formToObject(this);
		if (form.name) {
			$(this).find('input[name="name"]').val('');
			$('#game-title').html(languageInstance.replaceJs('loading'));
			ipcRenderer.send('client.get-game', form.name);
		}
	});

	registerModalOverlay();
	registerGameCover();
	registerAddGameForm();
	registerContextMenu();
	$('input[type=number]').each(function() {
		$(this).numberPicker();
	});
}
