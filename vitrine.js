const fs = require('fs');
const path = require('path');
const Igdb = require('./IgdbWrapper');

let wrapper = new Igdb();

wrapper.getGame('The Legend of Zelda: Ocarina Of Time', function(doc) {
	console.log(doc);
});