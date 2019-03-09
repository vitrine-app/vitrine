const { exec } = require('shelljs');

const branch = process.env.APPVEYOR_REPO_BRANCH || process.env.TRAVIS_BRANCH;

if (!branch)
  throw new Error('Branch is not defined. Check your CI configuration.');

console.log(`====== Current branch: ${branch} ======`);
if (branch === 'stable' || branch.startsWith('release/') || branch.startsWith('hotfix/')) {
  console.log('Deployment path.');
  exec('yarn build:modules');
  exec('yarn dist:ci');
}
else {
  if (process.env.TRAVIS_BRANCH && branch === 'master')
    exec('yarn test:coverage');
  exec('yarn build:prod');
}
