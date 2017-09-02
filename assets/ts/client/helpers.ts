import { remote, ipcRenderer } from 'electron';

import { languageInstance } from './Language';

function openDialog(options: any): string {
	let dialogRet: string[] = remote.dialog.showOpenDialog(options);
	if (!dialogRet || !dialogRet.length)
		return null;
	return dialogRet[0];
}

export function extendJQuery() {
	$.fn.extend({
		clear() {
			return this.html('');
		},
		beforeCss(selector: string, props: object) {
			$('head style#before-styling').remove();
			let rawStyling: string = '';
			Object.keys(props).forEach((key) => {
				rawStyling += key + ': ' + props[key] + ';';
			});
			$('head').append('<style id="before-styling">' + selector + ':before{' + rawStyling + '}</style>');
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
			this.addClass('blur-picture-container');
			this.css({
				fontSize: fontSize + 'px',
				width: width + 'em',
				height: height + 'em',
			}).find('.icon').css({
				left: (width / 2 - 0.3) + 'em',
				top: (height / 2 - 0.5) + 'em'
			});
			this.find('.image').mouseenter(() => {
				this.find('.image').addClass('cover-hovered');
				this.find('.icon').animateCss('zoomIn', 75).addClass('cover-hovered');
			}).mouseleave(() => {
				this.find('.image').removeClass('cover-hovered');
				this.find('.icon').removeClass('cover-hovered');
			}).click(() => {
				this.animateCss('pulse', 120);
				callback.bind(this)();
			});

			this.find('.icon').mouseenter(() => {
				this.find('.image').addClass('cover-hovered');
				this.find('.icon').addClass('cover-hovered');
			}).mouseleave(() => {
				this.find('.image').removeClass('cover-hovered');
				this.find('.icon').removeClass('cover-hovered');
			}).click(() => {
				this.animateCss('pulse', 120);
				callback.bind(this)();
			});
			return this;
		},
		updateBlurClickCallback(callback: Function) {
			this.find('.image').off('click').click(() => {
				this.animateCss('pulse', 120);
				callback.bind(this)();
			});
			this.find('.icon').off('click').click(() => {
				this.animateCss('pulse', 120);
				callback.bind(this)();
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

export function formatTimePlayed(timePlayed: number): string {
	if (timePlayed < 60) {
		let secondsStr: string;
		if (timePlayed == 1)
			secondsStr = languageInstance.replaceJs('secondsSing');
		else
			secondsStr = languageInstance.replaceJs('secondsPlur');
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

export function openExecutableDialog(): string {
	return openDialog({
		properties: ['openFile'],
		filters: [
			{
				name: languageInstance.replaceJs('executables'),
				extensions: ['exe']
			},
			{
				name: languageInstance.replaceJs('allFiles'),
				extensions: ['*']
			}
		]
	});
}

export function openImageDialog(): string {
	return openDialog({
		properties: ['openFile'],
		filters: [
			{
				name: languageInstance.replaceJs('images'),
				extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp']
			}
		]
	});
}

export function urlify(imgPath: string): string {
	return 'url(' + imgPath.replace(/\\/g, '\\\\') + ')';
}

export function displayRemoveGameModal(gameId: string, gameName: string) {
	$('#remove-game-modal').find('#remove-game-disclaimer').html(languageInstance.replaceJs('removeGameText', gameName));
	$('#remove-game-modal').modal('show');
	$('#remove-game-btn').off().click((event) => {
		event.preventDefault();

		ipcRenderer.send('client.remove-game', gameId);
		$('#remove-game-modal').modal('hide');
	});
}
