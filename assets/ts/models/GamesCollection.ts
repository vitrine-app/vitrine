export class GamesCollection<T> {
	private _games: T[];

	public constructor() {
		this._games = [];
	}

	get games(): T[] {
		return this._games;
	}

	set games(games: T[]) {
		this._games = games;
	}

	public getGame(gameId: string, callback: Function) {
		let counter: number = 0;
		let found: boolean = false;

		this._games.forEach((game: any) => {
			if (game.uuid === gameId) {
				found = true;
				callback(null, game);
			}
			counter++;
			if (counter === this._games.length && !found)
				callback('Game not found.', null);

		});
	}

	public addGame(game: T) {
		this._games.push(game);
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
			this._games.sort(this.alphabeticSort);
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
		return ((<any>nodeA).name > (<any>nodeB).name) ? (1) : (-1);
	}
}
