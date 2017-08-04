import * as path from 'path';
import * as fs from 'fs';
import { pascalCase } from 'change-case';

import { languageInstance } from './Language';

const componentSuffix: string = 'Component.html';
const componentsFolder: string = '../assets/components';

let counter: number = 0;
let componentsNb: number;
let currentCallback: Function;
let callbackProceeded: boolean = false;

function adaptComponent(componentName: string) {
	let fileString = fs.readFileSync(path.resolve(__dirname, componentsFolder, componentName)).toString();
	fileString = fileString.replace(/{{(.*?)}}/g, (match, p1) => {
		return languageInstance.replaceHtml(p1.trim());
	});
	return fileString;
}

function loadComponents() {
	$('[component]').each(function() {
		if (!$(this).attr('loaded')) {
			let componentName: string = $(this).attr('component');
			componentName = pascalCase(componentName) + componentSuffix;
			$(this).html(adaptComponent(componentName));
			$(this).attr('loaded', 'loaded');
			loadComponents();
			counter++;
		}
		if (counter == componentsNb && !callbackProceeded) {
			callbackProceeded = true;
			currentCallback();
			return;
		}
	});
}

export function clientBootstrap(callback: Function) {
	fs.readdir(path.join(__dirname, '../assets/components'), (err, files) => {
		componentsNb = files.length;
		currentCallback = callback;
		loadComponents();
	});
}

export function loadTitleBar() {
	require('electron-titlebar/index.js');
}
