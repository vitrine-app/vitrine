$.fn.extend({
	animateCss(animationName: string, animationDuration?: number) {
		let animationEnd: string = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
		if (animationDuration !== undefined)
			this.css('animation-duration', animationDuration + 'ms');
		this.addClass('animated ' + animationName).one(animationEnd, function() {
			$(this).removeClass('animated ' + animationName);
		});
		return this;
	}
});

export function beforeCss(selector: any, styling: object) {
	let rawStyling: string = '';
	Object.keys(styling).forEach(function(key) {
		rawStyling += key + ': ' + styling[key] + ';';
	});

	$('head').append('<style>' + selector + ':before{' + rawStyling + '}</style>');
}

export function alphabeticSort(nodeA: any, nodeB: any) {
	return nodeA.name > nodeB.name;
}
