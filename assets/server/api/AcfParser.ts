import * as fs from 'fs-extra';

export class AcfParser {
	private readonly acfFd: string;
	private c: number;

	public constructor(filename: string) {
		this.acfFd = fs.readFileSync(filename).toString();
		this.c = 0;
	}

	public toObject(): any {
		const tree: any = {};

		while (this.c < this.acfFd.length) {
			this.deleteSpaces();
			if (this.acfFd[this.c] === '}')
				return tree;
			const name: string = this.readField();
			this.deleteSpaces();

			if (this.acfFd[this.c] === '"')
				tree[name] = this.readField();
			else if (this.acfFd[this.c] === '{') {
				this.c++;
				this.deleteSpaces();
				tree[name] = this.toObject();
				this.c++;
			}
		}
		return tree;
	}

	private readField(): string {
		if (this.acfFd[this.c] !== '"')
			return null;
		this.c++;
		let name: string = '';
		while (this.acfFd[this.c] !== '"') {
			name += this.acfFd[this.c];
			this.c++;
		}
		this.c++;
		return name;
	}

	private deleteSpaces(): void {
		while (this.acfFd[this.c] === '\t' || this.acfFd[this.c] === ' '
		|| this.acfFd[this.c] === '\r' || this.acfFd[this.c] === '\n')
			this.c++;
	}
}
