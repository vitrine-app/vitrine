class Localizer {
	private languages: any;
	private selectedLanguage: string;

	public constructor(languages?: any) {
		this.languages = (languages) ? (languages) : ({});
		this.selectedLanguage = 'en';
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
		return this.languages[this.selectedLanguage].replace('%1', arg);
	}
}

export let localizer: Localizer = new Localizer();
