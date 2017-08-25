import { languageInstance } from './Language';

import * as css from '../../sass/main.scss';

export function adaptComponent(): string | void {
	let htmlBody: string = $('body').html().replace(/{{(.*?)}}/g, (match, p1) => {
		return languageInstance.replaceHtml(p1.trim());
	});
	$('body').html(htmlBody);
}

export function launchStyling() {
	$('<style/>', {
		id: 'static-styling',
		type: 'text/css',
		text: css.toString()
	}).appendTo('head');
}
