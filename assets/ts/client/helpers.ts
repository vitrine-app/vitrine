export function extendJQuery() {
	$.fn.extend({
		animateCss(animationName: string, animationDuration?: number) {
			if (animationDuration !== undefined)
				this.css('animation-duration', animationDuration + 'ms');

			let animationEnd: string = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
			this.addClass('animated ' + animationName).one(animationEnd, function() {
				$(this).removeClass('animated ' + animationName);
			});
			return this;
		}
	});
}

export function beforeCss(selector: any, styling: object) {
	let rawStyling: string = '';
	Object.keys(styling).forEach((key) => {
		rawStyling += key + ': ' + styling[key] + ';';
	});
	$('head').append('<style>' + selector + ':before{' + rawStyling + '}</style>');
}
