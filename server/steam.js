const glob = require('glob');
const path = require('path');
const steamConfig = require('../config/steam.json');
const AcfParser = require('./AcfParser');
const fs = require('fs');


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
		let acfParser = new AcfParser(appManifest);
		console.log(acfParser.createTree());
	});
}
