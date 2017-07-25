const { ipcRenderer } = require('electron');
const toObject = require('form-to-object');

/* Debug */
ipcRenderer.send('client.get-game', 'The Witcher');

$(document.body).on('submit', '#game-name-form', function(event) {
	event.preventDefault();

	let form = toObject(this);
	if (form.name) {
		$('#game-title').html('Loading...');
		ipcRenderer.send('client.get-game', form.name);
	}
});

$(document.body).on({
	mouseenter() {
		$('#game-cover-image').addClass('cover-hovered');
	},
	mouseleave() {
		$('#game-cover-image').removeClass('cover-hovered');
	}
}, '#game-cover-image');

$(document.body).on({
	mouseenter() {
		$('#game-cover-image').addClass('cover-hovered');
	},
	mouseleave() {
		$('#game-cover-image').removeClass('cover-hovered');
	}
}, '#cover-play-btn');
