import * as fs from 'fs-extra';

class AcfParser {
  private c: number;

  public constructor(private readonly fileContent: string) {
    this.c = 0;
  }

  public toObject(): any {
    const tree: any = {};

    while (this.c < this.fileContent.length) {
      this.deleteSpaces();
      if (this.fileContent[this.c] === '}')
        return tree;
      const name: string = this.readField(true );
      this.deleteSpaces();

      if (this.fileContent[this.c] === '"')
        tree[name] = this.readField();
      else if (this.fileContent[this.c] === '{') {
        this.c++;
        this.deleteSpaces();
        tree[name] = this.toObject();
        this.c++;
      }
    }
    return tree;
  }

  private readField(fieldName: boolean = false): string {
    if (this.fileContent[this.c] !== '"')
      return null;
    this.c++;
    let name: string = '';
    while (this.fileContent[this.c] !== '"') {
      name += this.fileContent[this.c];
      this.c++;
    }
    this.c++;
    if (fieldName)
      return name.charAt(0).toLowerCase() + name.slice(1);
    return name;
  }

  private deleteSpaces(): void {
    while (this.fileContent[this.c] === '\t' || this.fileContent[this.c] === ' '
    || this.fileContent[this.c] === '\r' || this.fileContent[this.c] === '\n')
      this.c++;
  }
}

export async function parseAcf(filename: string) {
  const fileContent: any = await fs.readFile(filename);
  return new AcfParser(fileContent.toString()).toObject();
}
