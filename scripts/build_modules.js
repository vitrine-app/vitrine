const { readdir } = require('fs-extra');
const { resolve } = require('path');
const { cd, exec, grep, mkdir, mv, rm } = require('shelljs');


const electronUrl = 'https://atom.io/download/electron';
const electronVersion = grep('"electron":', 'package.json')
	.sed(/[ ]+"electron": "[\^]?(.*)"[,]?/, '$1')
	.replace(/\n/, '');

mkdir('-p', 'modules');
cd('sources/modules');

readdir(resolve()).then((modules) => {
	for (const module of modules) {
		cd(module);
		exec(`../../../node_modules/.bin/node-gyp rebuild --target=${electronVersion} --arch=x64 --dist-url=${electronUrl}`);
		mv(`build/Release/${module}.node`, '../../../modules');
		rm('-r', 'build');
		cd('..');
		console.log(`${module} build completed.`);
	}
});
