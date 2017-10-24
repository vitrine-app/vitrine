/// <reference types="jquery" />

declare interface Window {
	jQuery?: JQueryStatic,
	$?: JQueryStatic
}

interface JQuery {
	modal(command: string): JQuery;
	clear(): JQuery;
	animateCss(animationName: string, animationDuration?: number): JQuery;
	numberPicker(): JQuery;
	blurPicture(fontSize: number, callback: Function, width?: number, height?: number): JQuery;
	updateBlurClickCallback(callback: Function): JQuery;
	loading(): JQuery;
}
