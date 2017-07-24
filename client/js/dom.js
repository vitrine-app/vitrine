const { ipcRenderer } = require('electron');
const toObject = require('form-to-object');

$('#game-name-form').submit(function(event) {
	event.preventDefault();
	$('#game-title').html('Loading...');

	let form = toObject(this);
	if (form.name) {
		ipcRenderer.send('client.get-game', form.name);
	}
});
