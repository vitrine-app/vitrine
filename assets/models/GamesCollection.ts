export class GamesCollection<T extends Object> {
	private games: T[];
	private evaluatedKey: string;
	private idKey: string;

	public constructor(games?: T[]) {
		this.games = games || [];
		this.evaluatedKey = 'name';
		this.idKey = 'uuid'
	}

	public getGames(): T[] {
		return this.games;
	}

	public setGames(games: T[]) {
		this.games = games;
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
		let index: number = this.getIndex(this.getGame(game[this.idKey]));
		this.games[index] = game;
		this.sort();
		return this;
	}

	public removeGame(gameUuid: string) {
		let index: number = this.getIndex(this.getGame(gameUuid));
		this.games.splice(index, 1);
		return this;
	}

	public map(loopCallBack: (value: T, index: number, array: T[]) => any): T[] {
		return this.games.map(loopCallBack);
	}

	public forEach(loopCallBack: Function, endCallBack?: Function) {
		let counter: number = 0;
		this.games.forEach((game: any) => {
			loopCallBack(game);
			counter++;
			if (counter === this.games.length && endCallBack)
				endCallBack();
		})
	}

	private sort() {
		if (this.games.length)
			this.games.sort(this.alphabeticSort.bind(this));
	}

	private alphabeticSort(nodeA: T, nodeB: T): number {
		return (nodeA[this.evaluatedKey] > nodeB[this.evaluatedKey]) ? (1) : (-1);
	}

	private removeDuplicates(array: T[]) {
		return array.filter((value, index, array) => array.indexOf(value) == index);
	}
}
