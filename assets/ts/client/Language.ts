import * as path from 'path';
import * as fs from 'fs';

import { getEnvFolder } from '../server/helpers';

class Language {
	private dict: any;

	public constructor(private lang: string) {
		let filePath: string = path.resolve(getEnvFolder('config'), 'lang', lang + '.json');
		this.dict = JSON.parse(fs.readFileSync(filePath).toString());
	}

	public replaceHtml(key: string, arg?: any) {
		let keyArray: string[] = key.split(',');
		if (keyArray.length === 1)
			return this.dict[key];
		let ret: string = this.dict[keyArray[0]];
		for (let i in keyArray) {
			if (i)
				ret = ret.replace('%' + i, keyArray[i]);
		}
		return ret;
	}

	public replaceJs(key: string, arg?: any) {
		if (!arg)
			return this.dict[key];
		return this.dict[key].replace('%1', arg);
	}
}

export let languageInstance: Language = new Language('fr');
