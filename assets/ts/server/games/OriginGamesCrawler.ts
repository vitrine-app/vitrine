import * as path from 'path';
import * as fs from 'fs-extra';
import { parseString as parseXmlString } from 'xml2js';
import * as Registry from 'winreg';
import * as glob from 'glob';

import { PotentialGame } from '../../models/PotentialGame';
import { getEnvFolder } from '../helpers';
import { GamesCollection } from '../../models/GamesCollection';

class OriginGamesCrawler {
	private configFile: any;
	private potentialGames: PotentialGame[];
	private callback: Function;

	public constructor() {
		let configFilePath = path.resolve(getEnvFolder('config'), 'origin.json');
		this.configFile = JSON.parse(fs.readFileSync(configFilePath).toString());
		this.potentialGames = [];
	}

	public search(callback: Function) {
		this.callback = callback;

		let xmlPath: string = path.resolve(this.configFile.configFile.replace('%appdata%', process.env.APPDATA));
		parseXmlString(fs.readFileSync(xmlPath).toString(), (error, result: any) => {
			if (error)
				throw error;
			let gamesFolder: string = result.Settings.Setting[0].$.value;
			glob(gamesFolder + '*', (error: Error, folders: string[]) => {
				if (error)
					throw error;
				folders.forEach((gameFolder: string) => {
					let gameName: string = gameFolder.split('/').pop();

				});
			});
			/*let regKey = new Registry({
				hive: Registry.HKLM,
				key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\GameUX\\Games'
			});
			regKey.keys(this.parseRegKeys.bind(this));*/
		});
	}

	private parseRegKeys(error: Error, items: Winreg.Registry[]) {
		if (error)
			throw error;
		items.forEach((key: Winreg.Registry) => {
			console.log('KEY:', key.key);
			key.values((error: Error, items: Winreg.RegistryItem[]) => {
				if (error)
					throw error;
				console.log(items[1].name, items[1].value);
			});
		});
		this.callback(null, null);
	}
}

export function getOriginCrawler(): Promise<any> {
	return new Promise((resolve, reject) => {
		new OriginGamesCrawler().search((error, potentialGames: GamesCollection<PotentialGame>) => {
			if (error)
				reject(error);
			else
				resolve(potentialGames);
		});
	});
}
