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
	console.log('Checking the load...');
	$('[component]').each(function() {
		if (!$(this).attr('loaded')) {
			let componentName: string = $(this).attr('component');
			componentName = pascalCase(componentName) + componentSuffix;
			$(this).attr('loaded', 'loaded');
			console.log('Something will load! Ready to refresh.');
			$(this).load(path.join(componentsFolder, componentName)).ready(loadComponents);
			counter++;
		}
		if (counter == componentsNb && !callbackProceeded) {
			console.log('Everything is loaded! (' + componentsNb + ')');
			callbackProceeded = true;
			currentCallback();
			return;
		}
	});
}

export class ClientBootstrapper {
	private counter: number;
	private callbackProceeded: boolean;

	constructor(public componentsNb: number, public currentCallback: Function) {}

	public loadComponents() {
	console.log('Checking the load...');
		// let self: any = this;

		let componentsFields: any = $('[component]');
		//console.log(componentsFields[0].attr);

		componentsFields.each((index, value) => {
			if (!$(value).attr('loaded')) {
				let componentName: string = $(value).attr('component');
				componentName = pascalCase(componentName) + componentSuffix;
				$(value).attr('loaded', 'loaded');
				console.log('Something will load! Ready to refresh.');
				$(value).load(path.join(componentsFolder, componentName)).ready(this.loadComponents.bind(this));
				this.counter++;
			}
			if (this.counter == this.componentsNb && !this.callbackProceeded) {
				console.log('Everything is loaded! (' + this.counter + ')');
				this.callbackProceeded = true;
				this.currentCallback();
				return;
			}
		});
	}
}

export function clientBootstrap(callback: Function) {
	console.log('Beginning bootstrap.');
	fs.readdir('./assets/components', (err, files) => {
		componentsNb = files.length;
		currentCallback = callback;
		loadComponents();
		/*let clientBootstrapper: ClientBootstrapper = new ClientBootstrapper(files.length, callback);
		clientBootstrapper.loadComponents();*/
	});
}
