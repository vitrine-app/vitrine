/**
 * Allows the Bash script to be executed, regardless of the platform used.
 */

if (process.platform === 'win32') {
	const { cd, exec } = require('shelljs');
	cd('scripts').exec('build_modules.sh');
}
else {
	const { exec } = require('child_process');
	exec('sh scripts/build_modules.sh');
}
