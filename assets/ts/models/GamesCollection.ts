export class GamesCollection<T> {
	private _games: T[];
	private evaluatedKey: string;

	public constructor() {
		this._games = [];
		this.evaluatedKey = 'name';
	}

	get games(): T[] {
		return this._games;
	}

	set games(games: T[]) {
		this._games = games;
	}

	public getGame(gameId: string): Promise<any> {
		return new Promise((resolve, reject) => {
			let counter: number = 0;
			let found: boolean = false;

			this._games.forEach((game: T) => {
				if (game['uuid'] === gameId) {
					found = true;
					resolve(game);
				}
				counter++;
				if (counter === this._games.length && !found)
					reject(new Error('Game not found.'));

			});
		});
	}

	public addGame(game: T) {
		this._games.push(game);
	}

	public editGame(game: T) {
		this.getGame(game['uuid']).then((currentGame: T) => {
			let index: number = this._games.indexOf(currentGame);
			this._games[index] = game;
		});
	}

	public removeGame(gameId: string, callback: Function) {
		let counter: number = 0;
		let found: boolean = false;

		this._games.forEach((game: any) => {
			if (game.uuid === gameId) {
				found = true;
				let index: number = this._games.indexOf(game);
				this._games.splice(index, 1);
				callback(null, game, index);
			}
			counter++;
			if (counter === this._games.length && !found)
				callback('Game not found.', null, null);

		});
	}

	public sort() {
		if (this._games.length)
			this._games.sort(this.alphabeticSort.bind(this));
	}

	public forEach(loopCallBack: Function, endCallBack?: Function) {
		let counter: number = 0;
		this._games.forEach((game: any) => {
			loopCallBack(game);
			counter++;
			if (counter === this._games.length && endCallBack)
				endCallBack();
		})
	}

	private alphabeticSort(nodeA: T, nodeB: T): number {
		return (nodeA[this.evaluatedKey] > nodeB[this.evaluatedKey]) ? (1) : (-1);
	}
}
