export abstract class PotentialGame {
	private commandLine: string;

	constructor(private _name: string, private _details?: any) {
	}

	get name(): string {
		return this._name;
	}

	get details(): any {
		return this._details;
	}

	set name(name: string) {
		this._name = name;
	}

	set details(details: any) {
		this._details = details;
		/*
		this._details.series = details.series;
		this._details.developer = details.developers;
		this._details.publisher = details.publishers;
		this._details.genres = details.genres;
		this._details.desc = details.summary;
		this._details.releaseDate = new Date(details.first_release_date);
		this._details.rating = details.rating;
		this._details.coverUrl = details.cover;
		this._details.screenshotsUrl = details.screenshots;
		*/
	}
}
