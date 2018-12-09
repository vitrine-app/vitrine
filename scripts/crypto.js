const fs = require('fs-extra');
const openpgp = require('openpgp');

const secret = process.env.VITRINE_KEY;
if (!secret)
  throw new Error('VITRINE_KEY is missing.');

async function encrypt() {
  const file = await fs.readFile('./sources/modules/keysProvider/srcs/keys.hh');
  const { data } = await openpgp.encrypt({
    message: await openpgp.message.fromBinary(file),
    passwords: [ secret ],
    armor: true
  });
  await fs.writeFile('./sources/modules/keysProvider/srcs/keys.hh.asc', data);
}

async function decrypt() {
  const file = await fs.readFile('./sources/modules/keysProvider/srcs/keys.hh.asc');
  const { data } = await openpgp.decrypt({
    message: await openpgp.message.readArmored(file.toString()),
    passwords: [ secret ],
    format: 'ascii'
  });
  await fs.writeFile('./sources/modules/keysProvider/srcs/keys.hh', Buffer.from(data));
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
