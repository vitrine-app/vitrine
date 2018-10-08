const { readdir, statSync } = require('fs-extra');
const { resolve } = require('path');
const { cd, exec, mkdir, mv, rm } = require('shelljs');

mkdir('-p', 'modules');
cd('sources/modules');

readdir(resolve()).then((modules) => {
  for (const module of modules.filter((module) => statSync(module).isDirectory())) {
    cd(module);
    exec(`${resolve('../../../node_modules/.bin/node-gyp')} rebuild --arch=x64`);
    mv(`build/Release/${module}.node`, '../../../modules');
    rm('-r', 'build');
    cd('-');
    console.log(`${module} build completed.`);
  }
});
