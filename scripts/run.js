/**
 * Allows Bash scripts to be executed, regardless of the platform used.
 */

if (!process.argv[2])
	throw new Error('Script name missing.');

if (process.platform === 'win32') {
	const { exec } = require('shelljs');

	exec(`scripts/${process.argv[2]}`);
}
else {
	const { exec } = require('child_process');

	exec(`bash scripts/${process.argv[2]}`, (error, stdout, stderr) => {
		if (error) {
			console.err(error);
			return;
		}
		console.log(stdout);
		console.error(stderr);
	});
}
