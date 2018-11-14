const fs = require('fs-extra');
const openpgp = require('openpgp');

const secret = process.env.VITRINE_KEY;
if (!secret)
  throw new Error('VITRINE_KEY is missing.');

async function encrypt() {
  const file = await fs.readFile('./sources/modules/keysProvider/srcs/keys.hh');
  const { message: { packets } } = await openpgp.encrypt({
    message: await openpgp.message.fromBinary(file),
    passwords: [ secret ],
    armor: false
  });
  await fs.writeFile('./sources/modules/keysProvider/srcs/keys.hh.gpg', Buffer.from(packets.write()));
}

async function decrypt() {
  const file = await fs.readFile('./sources/modules/keysProvider/srcs/keys.hh.gpg');
  const { data } = await openpgp.decrypt({
    message: await openpgp.message.read(file),
    passwords: [ secret ],
    format: 'binary'
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
