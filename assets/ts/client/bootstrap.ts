import { pascalCase } from 'change-case';
import * as path from 'path';

const componentSuffix: string = 'Component.html';
const componentsFolder: string = '../assets/components';

function loadComponents() {
	$('[component]').each(function() {
		if (!$(this).attr('loaded')) {
			let componentName: string = $(this).attr('component');
			componentName = pascalCase(componentName) + componentSuffix;
			$(this).attr('loaded', 'loaded');
			$(this).load(path.join(componentsFolder, componentName)).ready(loadComponents);
		}
	});
}

$(document).ready(() => {
	loadComponents();
});
