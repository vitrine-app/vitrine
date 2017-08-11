import { languageInstance } from './Language';

export function extendJQuery() {
	$.fn.extend({
		beforeCss(selector: string, props: object) {
			$('head style').remove();
			let rawStyling: string = '';
			Object.keys(props).forEach((key) => {
				rawStyling += key + ': ' + props[key] + ';';
			});
			$('head').append('<style>' + selector + ':before{' + rawStyling + '}</style>');
			return this;
		},
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
		},
		blurPicture(fontSize: number, callback: Function, width?: number, height?: number) {
			width = (width) ? (width) : (3.136);
			height = (height) ? (height) : (4.48);
			this.css({
				'font-size': fontSize + 'px',
				'width': width + 'em',
				'height': height + 'em',
			}).find('.icon').css({
				'left': (width / 2 - 0.3) + 'em',
				'top': (height / 2 - 0.5) + 'em'
			});
			this.find('.image').mouseenter(() => {
				this.find('.image').addClass('cover-hovered');
				this.find('.icon').animateCss('zoomIn', 75).addClass('cover-hovered');
			}).mouseleave(() => {
				this.find('.image').removeClass('cover-hovered');
				this.find('.icon').removeClass('cover-hovered');
			}).click(() => {
				this.animateCss('pulse', 120);
				callback();
			});

			this.find('.icon').mouseenter(() => {
				this.find('.image').addClass('cover-hovered');
				this.find('.icon').addClass('cover-hovered');
			}).mouseleave(() => {
				this.find('.image').removeClass('cover-hovered');
				this.find('.icon').removeClass('cover-hovered');
			}).click(() => {
				this.animateCss('pulse', 120);
				callback();
			});
			return this;
		},
		updateBlurClickCallback(callback: Function) {
			this.find('.image').off('click').click(() => {
				this.animateCss('pulse', 120);
				callback();
			});
			this.find('.icon').off('click').click(() => {
				this.animateCss('pulse', 120);
				callback();
			});
			return this;
		},
		loading() {
			let width: string = this.css('width');
			this.html('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
			this.css('width', width);
			return this;
		}
	});
}

export function formatTimePlayed(timePlayed: number) {
	if (timePlayed < 60) {
		let secondsStr: string;
		if (timePlayed == 1)
			secondsStr = languageInstance.replaceJs('secondSing');
		else
			secondsStr = languageInstance.replaceJs('secondPlur');
		return timePlayed + ' ' + secondsStr;
	}
	let minutes: number = Math.floor(timePlayed / 60);
	if (minutes < 60) {
		let minutesStr: string;
		if (minutes == 1)
			minutesStr = languageInstance.replaceJs('minutesSing');
		else
			minutesStr = languageInstance.replaceJs('minutesPlur');
		return minutes + ' ' + minutesStr;
	}
	let hours: number = minutes / 60;
	let hoursStr: string;
	if (hours == 1)
		hoursStr = languageInstance.replaceJs('hoursSing');
	else
		hoursStr = languageInstance.replaceJs('hoursPlur');
	minutes = minutes % 60;
	let minutesStr: string;
	if (!minutes)
		minutesStr = null;
	if (minutes == 1)
		minutesStr = languageInstance.replaceJs('minutesSing');
	else
		minutesStr = languageInstance.replaceJs('minutesPlur');
	return hours + ' ' + hoursStr + (minutesStr) ? (minutes + ' ' + minutesStr) : ('');
}
