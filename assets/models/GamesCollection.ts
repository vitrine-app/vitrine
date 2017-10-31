export class GamesCollection<T> {
	private _games: T[];
	private evaluatedKey: string;

	public constructor(games?: T[]) {
		this._games = (games) ? (games) : ([]);
		this.evaluatedKey = 'name';
	}

	get games(): T[] {
		return this._games;
	}

	set games(games: T[]) {
		this._games = games;
	}

	public getGame(gameUuid: string): Promise<any> {
		return new Promise((resolve, reject) => {
			let counter: number = 0;
			let found: boolean = false;

			this._games.forEach((game: T) => {
				if (game['uuid'] === gameUuid) {
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
		this.sort();
	}

	public addGames(games: GamesCollection<T>, callback: Function) {
		this.games = this.removeDuplicates(this.games.concat(games.games));
		this.sort();
		callback();
	}

	public editGame(game: T, callback?: Function) {
		this.getGame(game['uuid']).then((currentGame: T) => {
			Object.assign(currentGame, game);
			if (callback)
				callback();
		}).catch((error: Error) => {
			throw error;
		});
	}

	public removeGame(gameUuid: string, callback: Function) {
		let counter: number = 0;
		let found: boolean = false;

		this._games.forEach((game: any) => {
			if (game.uuid === gameUuid) {
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

	private removeDuplicates(array: T[]) {
		return array.filter((value, index, array) => {
			return array.indexOf(value) == index;
		});
	}
}
