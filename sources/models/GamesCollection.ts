import { GameSource } from './PotentialGame';

export class GamesCollection<T extends object> {
  private readonly idKey: string;
  private readonly sourceKey: string;
  private games: T[];

  public constructor(games?: T[]) {
    this.games = games ? [ ...games ] : [];
    this.idKey = 'uuid';
    this.sourceKey = 'source';
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

  public clear() {
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
    return this;
  }

  public addGames(games: T[]): this {
    this.games = this.removeDuplicates([
      ...this.games,
      ...games
    ]);
    return this;
  }

  public editGame(game: T): this {
    const index: number = this.getIndex(this.getGame(game[this.idKey]));
    this.games[index] = game;
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

  public getGamesFromSource(source: GameSource): T[] {
    return this.games.filter((game: T) => game[this.sourceKey] === source);
  }

  public alphaSort() {
    this.games.sort((gameA: T, gameB: T): number => {
      return (gameA as any).name > (gameB as any).name ? 1 : -1;
    });
  }

  private removeDuplicates(array: T[]) {
    return array.filter((value: T, index: number, array: T[]) => array.indexOf(value) === index);
  }
}
