import { languageInstance } from './Language';

export function adaptComponent() {
	let htmlBody: string = $('body').html().replace(/{{(.*?)}}/g, (match, p1) => {
		return languageInstance.replaceHtml(p1.trim());
	});
	$('body').html(htmlBody);
}
