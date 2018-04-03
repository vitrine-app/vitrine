/**
 * Allows the Bash script to be executed, regardless of the platform used.
 */

if (!process.argv[2])
	throw new Error('Script name missing.');

if (process.platform === 'win32') {
	const { cd, exec } = require('shelljs');
	cd('scripts').exec(process.argv[2]);
}
else {
	const { exec } = require('child_process');
	exec(`sh scripts/${process.argv[2]}`);
}
