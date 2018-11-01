import * as fs from 'fs-extra';
import * as moment from 'moment';
import * as path from 'path';

import { getAppDataFolder, isFakeProd, isProduction } from '../models/env';

export class Logger {
  private readonly filePath: string;
  private testEnv: boolean;
  private linesNb: number;

  public constructor() {
    this.linesNb = 0;
    if (isProduction()) {
      this.filePath = path.resolve(getAppDataFolder(), 'data', 'vitrine.log.html');
      fs.ensureFileSync(this.filePath);
    }
    else
      this.filePath = path.resolve('vitrine.log.html');
  }

  public createLogger(testEnv?: boolean) {
    this.testEnv = testEnv || false;
    const dateTime: string = moment().format('DD/MM HH:mm:ss');
    const initialLog: string =
      `<style>p { margin: 0 } span { font-family: monospace; background-color: lightgrey; width: 40px; display: inline-block; }</style>
<h3>Vitrine log</h3><p><span>${++this.linesNb}</span><strong>[ ${dateTime} ]</strong> Starting logging.</p>`;
    fs.writeFileSync(this.filePath, initialLog);
  }

  public info(channelName: string, message: any, displayed?: boolean) {
    const dateTime: string = moment().format('DD/MM HH:mm:ss');
    const log: string = `<p><span>${++this.linesNb}</span><strong>[ ${dateTime} ][ ${channelName} ]</strong> ${message}</p>`;
    if (displayed || (isProduction() && !isFakeProd()))
      console.log(`[ ${dateTime} ][ ${channelName} ] ${message}`);
    fs.appendFileSync(this.filePath, `\n${log}`);
  }

  public async deleteLog() {
    await fs.remove(this.filePath);
  }
}

export const logger: Logger = new Logger();
