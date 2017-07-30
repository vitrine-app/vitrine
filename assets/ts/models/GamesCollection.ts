function alphabeticSort(nodeA: any, nodeB: any) {
	return nodeA.name > nodeB.name;
}

export class GamesCollection<T> {
	private _games: T[];

	constructor() {
		this._games = [];
	}

	get games(): T[] {
		return this._games;
	}

	set games(games: T[]) {
		this._games = games;
	}

	public getGame(gameId: string, callback) {
		let counter: number = 0;
		let found: boolean = false;

		this._games.forEach((game: any) => {
			if (game.uuid == gameId) {
				found = true;
				callback(null, game);
			}
			counter++;
			if (counter == this._games.length && !found)
				callback('Game not found.', null);

		});
	}

	public addGame(game: T) {
		this._games.push(game);
	}

	public removeGame(gameId: string, callback) {
		let counter: number = 0;
		let found: boolean = false;

		this._games.forEach((game: any) => {
			if (game.uuid == gameId) {
				found = true;
				let index: number = this._games.indexOf(game);
				this._games.splice(index, 1);
				callback(null, game);
			}
			counter++;
			if (counter == this._games.length && !found)
				callback('Game not found.', null);

		});
	}

	public sort() {
		if (this._games.length)
			(<any>this._games).sort(alphabeticSort);
	}

	public forEach(callback) {
		this._games.forEach(function(game: any) {
			callback(game);
		})
	}
}