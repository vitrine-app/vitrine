const { ipcRenderer } = require('electron');
const toObject = require('form-to-object');

$('#game-name-form').submit(function(event) {
	event.preventDefault();

	let form = toObject(this);
	if (form.name) {
		$('#game-title').html('Loading...');
		ipcRenderer.send('client.get-game', form.name);
	}
});
