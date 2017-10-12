import { remote, ipcRenderer } from 'electron';
import { localizer } from './Localizer';

function openDialog(options: any): string {
	let dialogRet: string[] = remote.dialog.showOpenDialog(options);
	if (!dialogRet || !dialogRet.length)
		return null;
	return dialogRet[0];
}

export function formatTimePlayed(timePlayed: number): string {
	if (timePlayed < 60) {
		let secondsStr: string;
		if (timePlayed == 1)
			secondsStr = localizer.f('secondsSing');
		else
			secondsStr = localizer.f('secondsPlur');
		return timePlayed + ' ' + secondsStr;
	}
	let minutes: number = Math.floor(timePlayed / 60);
	if (minutes < 60) {
		let minutesStr: string;
		if (minutes == 1)
			minutesStr = localizer.f('minutesSing');
		else
			minutesStr = localizer.f('minutesPlur');
		return minutes + ' ' + minutesStr;
	}
	let hours: number = minutes / 60;
	let hoursStr: string;
	if (hours == 1)
		hoursStr = localizer.f('hoursSing');
	else
		hoursStr = localizer.f('hoursPlur');
	minutes = minutes % 60;
	let minutesStr: string;
	if (!minutes)
		minutesStr = null;
	if (minutes == 1)
		minutesStr = localizer.f('minutesSing');
	else
		minutesStr = localizer.f('minutesPlur');
	return hours + ' ' + hoursStr + (minutesStr) ? (minutes + ' ' + minutesStr) : ('');
}

export function openDirectory(): string {
	return openDialog({
		properties: ['openDirectory']
	});
}

export function openExecutableDialog(): string {
	return openDialog({
		properties: ['openFile'],
		filters: [
			{
				name: localizer.f('executables'),
				extensions: ['exe']
			},
			{
				name:localizer.f('allFiles'),
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
				name: localizer.f('images'),
				extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp']
			}
		]
	});
}

export function urlify(imgPath: string): string {
	return (imgPath) ? ('url(' + imgPath.replace(/\\/g, '\\\\') + ')') : ('');
}

export function beforeCss(selector: string, props: object) {
	$('head style#before-styling').remove();
	let rawStyling: string = '';
	Object.keys(props).forEach((key) => {
		rawStyling += key + ': ' + props[key] + ';';
	});
	$('head').append('<style id="before-styling">' + selector + ':before{' + rawStyling + '}</style>');
}

export function launchGame(gameId: string) {
	ipcRenderer.send('client.launch-game', gameId);
}
