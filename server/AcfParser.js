const fs = require('fs');

class AcfParser {
	constructor(filename) {
		this.acfFd = fs.readFileSync(filename).toString();
		this.c = 0;
	}

	createTree() {
		let tree = {};
		while (this.c < this.acfFd.length) {
			this.deleteSpaces();
			if (this.acfFd[this.c] === '}')
				return tree;
			let name = this.readField();
			this.deleteSpaces();

			if (this.acfFd[this.c] === '"') {
				tree[name] = this.readField();
			}
			else if (this.acfFd[this.c] === '{') {
				this.c++;
				this.deleteSpaces();
				tree[name] = this.createTree();
				this.c++;
			}
		}
		return tree;
	}

	readField() {
		if (this.acfFd[this.c] !== '"')
			return null;
		this.c++;
		let name = '';
		while (this.acfFd[this.c] !== '"') {
			name += this.acfFd[this.c];
			this.c++;
		}
		this.c++;
		return name;
	}

	deleteSpaces() {
		while (this.acfFd[this.c] === '\t' || this.acfFd[this.c] === ' '
		|| this.acfFd[this.c] === '\r' || this.acfFd[this.c] === '\n')
			this.c++;
	}
}

module.exports = AcfParser;