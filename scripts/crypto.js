const fs = require('fs-extra');
const aes = require('aes-cross');

if (!process.env.VITRINE_KEY)
  throw new Error('VITRINE_KEY is missing.');
const secret = Buffer.from(process.env.VITRINE_KEY, 'utf8');

async function encrypt() {
  const file = await fs.readFile('./sources/modules/keysProvider/srcs/keys.hh');
  const encrypted = aes.encText(file.toString(), secret);
  await fs.writeFile('./sources/modules/keysProvider/srcs/keys.asc', encrypted);
}

async function decrypt() {
  const file = await fs.readFile('./sources/modules/keysProvider/srcs/keys.asc');
  const decrypted = aes.decText(file.toString(), secret);
  await fs.writeFile('./sources/modules/keysProvider/srcs/keys.hh', decrypted);
}

switch (process.argv[2]) {
  case 'encrypt':
    encrypt();
    break;
  case 'decrypt':
    decrypt();
    break;
  default:
    throw new Error('Provide an argument.');
}
