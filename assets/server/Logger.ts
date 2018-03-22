import * as fs from 'fs-extra';
import * as path from 'path';
import * as moment from 'moment';

import { getEnvData } from '../models/env';

class Logger {
	private filePath: string;

	public constructor() {
		if (getEnvData().env)
			this.filePath = path.resolve(process.env.APPDATA, 'vitrine', 'vitrine.log.html');
		else
			this.filePath = path.resolve('vitrine.log.html');
	}

	public createLogger() {
		let dateTime: string = moment().format('DD/MM hh:mm:ss');
		let initialLog: string = `<style>p { margin: 0 }</style><h3>Vitrine log</h3><p><strong>[ ${dateTime} ]</strong> Starting logging.</p>`;
		fs.writeFileSync(this.filePath, initialLog);
	}

	public info(channelName: string, message: any, displayed?: boolean) {
		let dateTime: string = moment().format('DD/MM hh:mm:ss');
		let log: string = `<p><strong>[ ${dateTime} ][ ${channelName} ]</strong> ${message}</p>`;
		if (displayed)
			console.log(`[ ${dateTime} ][ ${channelName} ] ${message}`);
		fs.appendFileSync(this.filePath, log);
	}
}

export const logger: Logger = new Logger();
