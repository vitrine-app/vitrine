/// <reference types="jquery" />

interface JQuery {
	beforeCss(selector: string, props: object): JQuery;
	animateCss(animationName: string, animationDuration?: number): JQuery;
	numberPicker(): JQuery;
	blurPicture(fontSize: number, callback: Function, width?: number, height?: number): JQuery;
	updateBlurClickCallback(callback: Function): JQuery;
}