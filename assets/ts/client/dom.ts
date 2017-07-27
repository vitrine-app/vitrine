import { ipcRenderer } from 'electron';
import * as formToObject from 'form-to-object';
import './helpers';

/* TODO: Remove this */
// ipcRenderer.send('client.get-game', 'The Witcher');

$(document.body).on('submit', '#game-name-form', function(event) {
	event.preventDefault();

	let form = formToObject(this);
	if (form.name) {
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

function clickGameCover() {
	(<any>$('#game-cover-component')).animateCss('pulse', 120);
	// (<any>$('#cover-play-btn')).animateCss('pulse', 450);
	console.log('Let\'s play!');
}
