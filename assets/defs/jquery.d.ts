/// <reference types="jquery" />

declare interface Window {
	jQuery?: JQueryStatic,
	$?: JQueryStatic
}

interface JQuery {
	modal(command: string): JQuery;
}
