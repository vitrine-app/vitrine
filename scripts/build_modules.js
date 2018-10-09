const { readdir, statSync } = require('fs-extra');
const { resolve } = require('path');
const { cd, exec, grep, mkdir, mv, rm } = require('shelljs');

let nodeGypCmd = `${resolve('node_modules/.bin/node-gyp')} rebuild --arch=x64`;
if (!process.env.NO_ELECTRON) {
  const electronUrl = 'https://atom.io/download/electron';
  const electronVersion = grep('"electron":', 'package.json')
    .sed(/[ ]+"electron": "[\^]?(.*)"[,]?/, '$1')
    .replace(/\n/, '');
  nodeGypCmd = `${nodeGypCmd} --dist-url=${electronUrl} --target=${electronVersion}`;
}

mkdir('-p', 'modules');
cd('sources/modules');

readdir(resolve()).then((modules) => {
  for (const module of modules.filter((module) => statSync(module).isDirectory())) {
    cd(module);
    exec(nodeGypCmd);
    mv(`build/Release/${module}.node`, '../../../modules');
    rm('-r', 'build');
    cd('-');
    console.log(`${module} build completed.`);
  }
});
