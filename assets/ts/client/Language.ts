import * as path from 'path';
import * as fs from 'fs';

class Language {
	private dict: any;

	constructor(private lang: string) {
		let filePath: string = path.resolve(__dirname, '../config/lang', lang + '.json');
		this.dict = JSON.parse(fs.readFileSync(filePath).toString());
	}

	public replaceHtml(key: string) {
		return this.dict[key];
	}

	public replaceJs(key: string, arg?: any) {
		if (arg)
			return this.dict[key].replace('%1', arg);
		return this.dict[key];
	}
}

export let languageInstance: Language = new Language('fr');
