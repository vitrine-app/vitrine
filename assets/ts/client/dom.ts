import { ipcRenderer } from 'electron';
import * as formToObject from 'form-to-object';
import './helpers';

function clickGameCover() {
	(<any>$('#game-cover-component')).animateCss('pulse', 120);
}

export function launchDom() {
	/* TODO: Remove this */
	// ipcRenderer.send('client.get-game', 'The Witcher');

	$(document.body).on('submit', '#game-name-form', function(event) {
		event.preventDefault();

		let form = formToObject(this);
		if (form.name) {
			$(this).find('input[name="name"]').val('');
			$('#game-title').html('Loading...');
			ipcRenderer.send('client.get-game', form.name);
		}
	});

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
		},
		click() {
			clickGameCover();
		}
	};

	$(document.body).on(gameCoverEvents, '#game-cover-image');
	$(document.body).on(gameCoverEvents, '#cover-play-btn');
}
