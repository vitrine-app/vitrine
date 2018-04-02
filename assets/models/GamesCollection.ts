export class GamesCollection<T extends object> {
	private readonly evaluatedKey: string;
	private readonly idKey: string;
	private games: T[];

	public constructor(games?: T[]) {
		this.games = games || [];
		this.evaluatedKey = 'name';
		this.idKey = 'uuid';
	}

	public getGames(): T[] {
		return this.games;
	}

	public setGames(games: T[]) {
		this.games = games;
		this.sort();
	}

	public size(): number {
		return this.games.length;
	}

	public clean() {
		this.games = [];
	}

	public getIndex(game: T): number {
		return this.games.indexOf(game);
	}

	public getGame(gameUuid: string | number): T {
		if (typeof gameUuid === 'string')
			return this.games.filter((game: T) => game[this.idKey] === gameUuid)[0];
		return this.games[gameUuid];
	}

	public addGame(game: T): this {
		this.games.push(game);
		this.sort();
		return this;
	}

	public addGames(games: T[]): this {
		this.games = this.removeDuplicates(this.games.concat(games));
		this.sort();
		return this;
	}

	public editGame(game: T): this {
		const index: number = this.getIndex(this.getGame(game[this.idKey]));
		this.games[index] = game;
		this.sort();
		return this;
	}

	public removeGame(gameUuid: string) {
		const index: number = this.getIndex(this.getGame(gameUuid));
		this.games.splice(index, 1);
		return this;
	}

	public map(loopCallBack: (value: T, index: number, array: T[]) => any): T[] {
		return this.games.map(loopCallBack);
	}

	private sort() {
		if (this.games.length)
			this.games.sort(this.alphabeticSort.bind(this));
	}

	private alphabeticSort(nodeA: T, nodeB: T): number {
		return (nodeA[this.evaluatedKey] > nodeB[this.evaluatedKey]) ? (1) : (-1);
	}

	private removeDuplicates(array: T[]) {
		return array.filter((value: T, index: number, array: T[]) => array.indexOf(value) === index);
	}
}
