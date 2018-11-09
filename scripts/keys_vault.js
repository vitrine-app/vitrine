const fs = require('fs-extra');
const nacl = require('tweetnacl');
const { decodeBase64, decodeUTF8, encodeBase64, encodeUTF8 } = require('tweetnacl-util');

function encrypt(secretKey, data) {
  const nonce = nacl.randomBytes(24);
  const secretKeyBuffer = Buffer.from(secretKey, 'utf8');
  const encryptedMessage = nacl.secretbox(decodeUTF8(data), nonce, secretKeyBuffer);
  return `${encodeBase64(nonce)}:${encodeBase64(encryptedMessage)}`;
}

function decrypt(secretKey, cipherData) {
  const [ nonce, encryptedData ] = cipherData.split(':');
  const secretKeyBuffer = Buffer.from(secretKey, 'utf8');
  const originalMessage = nacl.secretbox.open(decodeBase64(encryptedData), decodeBase64(nonce), secretKeyBuffer);
  return encodeUTF8(originalMessage);
}

const privateKey = process.env.VITRINE_KEY;
if (!privateKey) {
  console.error('Error: VITRINE_KEY is missing.');
  return;
}

function generateCipheredKeys() {
  const keys = {
    /* KEYS: '...' */
  };

  const keysFile = Object.keys(keys).reduce((acc, key) => acc + `${key}=${encrypt(privateKey, keys[key])}\n`, '');
  fs.writeFileSync('keys/apis_private_enc.keys', keysFile);
  console.log('apis_private_enc.keys has been written.');
}

function decipherKeys() {
  const cipheredKeys = fs.readFileSync('keys/apis_private_enc.keys').toString();
  const keys = cipheredKeys.split('\n').filter((line) => line).map((line) => {
    const [ fullMatch, service, key ] = line.match(/([A-Z_]+)=(.*)/);
    return { service, key };
  });
  const plainKeyLines = keys.map((key) => `# define ${key.service}_KEY "${decrypt(privateKey, key.key)}"`);
  fs.writeFileSync('sources/modules/keysProvider/srcs/keys.hh', `#pragma once\n\n${plainKeyLines.join('\n')}\n`);
  console.log('keys.hh has been written.');
}

switch (process.argv[2]) {
  case 'generate':
    generateCipheredKeys();
    break;
  case 'decipher':
    decipherKeys();
    break;
  default:
    console.error('Provide an argument.');
}
