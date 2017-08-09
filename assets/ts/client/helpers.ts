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
		},
		numberPicker() {
			let max: number = parseInt(this.attr('max'));
			let min: number = parseInt(this.attr('min'));

			let tempHtml: string = this[0].outerHTML;
			let wrapperHtml: string = '<div class="input-group spinner">' + tempHtml
				+ '<div class="input-group-btn-vertical">'
				+ '<button class="btn btn-default" type="button"><i class="fa fa-caret-up"></i></button>'
				+ '<button class="btn btn-default" type="button"><i class="fa fa-caret-down"></i></button>'
				+ '</div>'
				+ '</div>';
			let self: any = $(wrapperHtml);
			this.replaceWith(self);

			self.find('.btn:first-of-type').on('click', () => {
				let val: number = parseInt(self.find('input').val());
				if (isNaN(val))
					self.find('input').val((isNaN(min)) ? (0) : (min));
				else if (isNaN(max) || val < max)
					self.find('input').val(val + 1);
			});
			self.find('.btn:last-of-type').on('click', () => {
				let val: number = parseInt(self.find('input').val());
				if (isNaN(val))
					self.find('input').val((isNaN(min)) ? (0) : (min));
				else if (isNaN(min) || val > min)
					self.find('input').val(val - 1);
			});
			self.find('input').attr('type', 'text').removeAttr('max').removeAttr('min').keypress((event) => {
				if (event.which !== 8 && event.which !== 0 && (event.which < 48 || event.which > 57)) {
					event.preventDefault();
				}
			});
			return self;
		}
	});
}

export function beforeCss(selector: any, styling: object) {
	$('head style').remove();
	let rawStyling: string = '';
	Object.keys(styling).forEach((key) => {
		rawStyling += key + ': ' + styling[key] + ';';
	});
	$('head').append('<style>' + selector + ':before{' + rawStyling + '}</style>');
}
