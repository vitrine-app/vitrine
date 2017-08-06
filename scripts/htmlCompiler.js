const path = require('path');
const fs = require('fs');
const { pascalCase } = require('change-case');
const cheerio = require('cheerio');
const htmlMinifier = require('html-minifier');

let htmlEntryPoint = path.resolve(__dirname, '../assets/html', 'main.html');
let htmlString = fs.readFileSync(htmlEntryPoint).toString();
const componentSuffix = 'Component.html';
const componentsFolder = '../assets/html/components';
let counter = 0;
let componentsNb;
let callbackProceeded = false;


function loadComponents() {
	$('[component]').each(function() {
		if (!$(this).attr('loaded')) {
			let componentName = $(this).attr('component');
			componentName = pascalCase(componentName) + componentSuffix;
			let fileString = fs.readFileSync(path.resolve(__dirname, componentsFolder, componentName)).toString();
			$(this).html(fileString);
			$(this).attr('loaded', 'loaded');
			loadComponents();
			counter++;
		}
		if (counter === componentsNb && !callbackProceeded) {
			callbackProceeded = true;
			callback();
		}
	});
}

function callback() {
	$('body').append('<script>require(\'./client\');</script>');
	let minifiedHtml = htmlMinifier.minify($.html(), {
		collapseWhitespace: true
	});
	fs.writeFileSync(path.resolve(__dirname, '../public', 'main.html'), minifiedHtml);
}

const $ = cheerio.load(htmlString);
fs.readdir(path.join(__dirname, componentsFolder), (err, files) => {
	componentsNb = files.length;
	loadComponents();
});
