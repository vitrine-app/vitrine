class Localizer {
	private languages: any[];
	private selectedLanguage: string;

	public constructor(languages?: any) {
		this.languages = languages || {};
		this.selectedLanguage = 'en';
	}

	public getLanguages(): any[] {
		return this.languages
	}

	public getSelectedLanguage(): string {
		return this.selectedLanguage;
	}

	public addLanguage(key: string, dict: any) {
		this.languages[key] = dict;
	}

	public setLanguage(language: string) {
		this.selectedLanguage = language;
	}

	public f(key: string, arg?: any): string {
		if (!arg)
			return this.languages[this.selectedLanguage][key];
		return this.languages[this.selectedLanguage][key].replace('%1', arg);
	}

	public genre(key: string): string {
		let genre: string = (this.languages[this.selectedLanguage]).genresNames[key];
		return genre || key;
	}
}

export const localizer: Localizer = new Localizer();
