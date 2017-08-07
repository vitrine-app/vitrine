const path = require('path');
const fs = require('fs');
const { pascalCase } = require('change-case');
const cheerio = require('cheerio');
const htmlMinifier = require('html-minifier');

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
			return callback();
		}
	});
}

function callback() {
	$('body').append('<script>require(\'./client\');</script>');
	return minify();
}

function minify() {
	let minifiedHtml = htmlMinifier.minify($.html(), {
		collapseWhitespace: true
	});
	fs.writeFileSync(destFile, minifiedHtml);
	console.log(destFile, 'built and minified!');
	return 0;
}

if (process.argv.length < 4) {
	console.error('Missing parameters: Needs src and destination file.');
	return 1;
}

const srcFile =  process.argv[2];
const destFile = process.argv[3];
let htmlString = fs.readFileSync(srcFile).toString();
const componentSuffix = 'Component.html';
const componentsFolder = '../assets/html/components';
let counter = 0;
let componentsNb;
let callbackProceeded = false;
const $ = cheerio.load(htmlString);

fs.readdir(path.join(__dirname, componentsFolder), (err, files) => {
	componentsNb = files.length;
	if ($('[component]').length)
		return loadComponents();
	else
		return minify();
});
