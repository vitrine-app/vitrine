import { padding, rgba } from 'css-verbose';
import { remote } from 'electron';
import * as React from 'react';
import { toast } from 'react-toastify';

import { localizer } from './Localizer';

import { fontName } from 'less-vars-loader?camelCase&resolveVariables!../resources/less/theme/globals/site.variables';

function openDialog(options: any): string {
	const dialogRet: string[] = remote.dialog.showOpenDialog(options);
	if (!dialogRet || !dialogRet.length)
		return null;
	return dialogRet[0];
}

export function formatTimePlayed(timePlayed: number): string {
	const hours: number = Math.floor(timePlayed / 3600);
	const minutes: number = Math.floor((timePlayed - (hours * 3600)) / 60);
	const seconds: number = timePlayed - (hours * 3600) - (minutes * 60);

	if (hours && minutes) {
		const hoursStr: string = localizer.f((hours !== 1) ? ('hoursPlur') : ('hoursSing'));
		const minutesStr: string = localizer.f((minutes) ? ((minutes !== 1) ? ('minutesPlur') : ('minutesSing')) : (''));
		return `${hours}  ${hoursStr}${((minutesStr) ? (' ' + minutes + ' ' + minutesStr) : (''))}`;
	}
	else if (hours) {
		const hoursStr: string = localizer.f((hours !== 1) ? ('hoursPlur') : ('hoursSing'));
		return `${hours} ${hoursStr}`;
	}
	else if (minutes) {
		const minutesStr: string = localizer.f((minutes !== 1) ? ('minutesPlur') : ('minutesSing'));
		return `${minutes} ${minutesStr}`;
	}
	else if (seconds) {
		const secondsStr: string = localizer.f((seconds !== 1) ? ('secondsPlur') : ('secondsSing'));
		return `${timePlayed} ${secondsStr}`;
	}
	else
		return '';
}

export function openDirectory(): string {
	return openDialog({
		properties: [ 'openDirectory' ]
	});
}

export function openExecutableDialog(): string {
	return openDialog({
		properties: [ 'openFile' ],
		filters: [
			{
				name: localizer.f('executables'),
				extensions: [ 'exe' ]
			},
			{
				name: localizer.f('allFiles'),
				extensions: [ '*' ]
			}
		]
	});
}

export function openImageDialog(): string {
	return openDialog({
		properties: [ 'openFile' ],
		filters: [
			{
				name: localizer.f('images'),
				extensions: [ 'jpg', 'jpeg', 'png', 'gif', 'bmp' ]
			}
		]
	});
}

export function urlify(imgPath: string): string {
	return (imgPath) ? ('url(' + imgPath.replace(/\\/g, '\\\\') + ')') : ('');
}

const NotificationContent: React.StatelessComponent<any> = ({ content }: any) => <span dangerouslySetInnerHTML={{ __html: content }} />;

export function notify(content: string, minor?: boolean) {
	const toastStyle: React.CSSProperties = {
		color: rgba(255, 255, 255, 0.72),
		background: (!minor) ? rgba(216, 147, 98, 0.85) : (rgba(90, 85, 81, 0.60)),
		padding: padding(5, 9, 7, 16),
		borderRadius: 2,
		fontFamily: fontName.replace(/'/g, '')
	};

	toast(<NotificationContent content={content}/>, {
		type: 'default',
		position: 'bottom-right',
		className: toastStyle,
		hideProgressBar: true,
		autoClose: (!minor) ? (5000) : (3500)
	});
}
