const glob = require('glob');
const path = require('path');
const pythonShell = require('python-shell');
const steamConfig = require('../config/steam.json');

steamConfig.gamesFolders.forEach(function(folder) {
	let gameFolder = '';

	if (folder.startsWith('~')) {
		gameFolder = path.join(steamConfig.installFolder, folder.substr(1), 'appmanifest_*.acf');
	}
	else
		gameFolder = path.join(folder, 'appmanifest_*.acf');
	glob(gameFolder, globCallback);
});

function globCallback(err, files) {
	files.forEach(function(appManifest) {
		console.log(appManifest);
	});
}

pythonShell.run('scripts/script.py', function(err) {
	console.log('finished');
});