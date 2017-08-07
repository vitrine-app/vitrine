import { ipcRenderer, remote } from 'electron';
import * as formToObject from 'form-to-object';

import { languageInstance } from './Language';
import { extendJQuery } from './helpers';

/* function clickGameCover() {
	(<any>$('#game-cover-component')).animateCss('pulse', 120);
}*/

function registerGameCover() {
	let gameCoverEvents: any = {
		mouseenter() {
			$('#game-cover-image').addClass('cover-hovered');
			$('#game-cover-component').addClass('cover-hovered');
			(<any>$('#cover-play-btn')).animateCss('zoomIn', 75).addClass('play-btn-visible');
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
	$('#add-game-form').find('input[name=name]').on('input', function() {
		if ($(this).val())
			$('#fill-with-igdb-btn').removeClass('disabled');
		else
			$('#fill-with-igdb-btn').addClass('disabled');
	});
	$('#add-game-form').find('input[name=date]').datepicker({
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

	$('#add-game-program-btn').click(() => {
		let dialogRet: string[] = remote.dialog.showOpenDialog({
			properties: ['openFile'],
			filters: [
				{name: languageInstance.replaceJs('executables'), extensions: ['exe']},
				{name: languageInstance.replaceJs('allFiles'), extensions: ['*']}
			]
		});
		if (!dialogRet.length)
			return;
		$('#add-game-form').find('input[name=program]').val(dialogRet[0]);
	});

	$('#add-game-modal').on('hidden.bs.modal', () => {
		$('#add-game-cover').html('');
		let formSelector = $('#add-game-form');
		formSelector.find('input[name=name]').val('');
		formSelector.find('input[name=series]').val('');
		formSelector.find('input[name=developer]').val('');
		formSelector.find('input[name=publisher]').val('');
		formSelector.find('input[name=date]').datepicker('update', '');
		formSelector.find('input[name=genres]').val('');
		formSelector.find('input[name=rating]').val('');
		formSelector.find('textarea[name=summary]').val('');
		formSelector.find('input[name=program]').val('');
	});
}

export function launchDom() {
	extendJQuery();
	$(document.body).on('submit', '#game-name-form', function(event) {
		event.preventDefault();

		let form = formToObject(this);
		if (form.name) {
			$(this).find('input[name="name"]').val('');
			$('#game-title').html(languageInstance.replaceJs('loading'));
			ipcRenderer.send('client.get-game', form.name);
		}
	});

	registerGameCover();
	registerAddGameForm();
}
