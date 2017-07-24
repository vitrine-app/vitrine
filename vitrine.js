const fs = require('fs');
const path = require('path');
const Igdb = require('./IgdbWrapper');

let wrapper = new Igdb();

/*wrapper._getGame('Super Mario Sunshine', function(doc) {
	console.log(doc);
});*/

// let game = JSON.parse(fs.readFileSync(path.join(__dirname, 'super_mario_sunshine.json')));
// console.log(game);

wrapper.getGame('The Legend of Zelda: Breath of the Wild', function(doc) {
	console.log(doc);
});