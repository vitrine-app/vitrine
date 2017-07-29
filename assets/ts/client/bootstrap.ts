import * as path from 'path';
import * as fs from 'fs';
import { pascalCase } from 'change-case';

const componentSuffix: string = 'Component.html';
const componentsFolder: string = '../assets/components';

let counter: number = 0;
let componentsNb: number;
let currentCallback: Function;
let callbackProceeded: boolean = false;

function loadComponents() {
	$('[component]').each(function() {
		if (!$(this).attr('loaded')) {
			let componentName: string = $(this).attr('component');
			componentName = pascalCase(componentName) + componentSuffix;
			$(this).attr('loaded', 'loaded');
			$(this).load(path.join(componentsFolder, componentName)).ready(loadComponents);
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
