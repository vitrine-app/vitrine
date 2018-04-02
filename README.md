<h1 align="center">Vitrine</h1>

<h3 align="center">Centralize all of your games within a simple interface.</h3>

<p align="center">

[![license](https://img.shields.io/github/license/paul-roman/vitrine.svg?style=flat-square)](https://github.com/paul-roman/vitrine/blob/master/LICENSE.md)
[![GitHub (pre-)release](https://img.shields.io/github/release/paul-roman/vitrine/all.svg?style=flat-square)](https://github.com/paul-roman/vitrine/releases)
[![CircleCI](https://img.shields.io/circleci/project/github/paul-roman/vitrine.svg?style=flat-square)](https://circleci.com/gh/paul-roman/vitrine)
[![dependencies](https://david-dm.org/paul-roman/vitrine/status.svg?style=flat-square)](https://david-dm.org/paul-roman/vitrine)
[![devDependencies](https://david-dm.org/paul-roman/vitrine/dev-status.svg?style=flat-square)](https://david-dm.org/paul-roman/vitrine?type=dev)
[![code style: TSLint](https://img.shields.io/badge/code%20style-tslint-ff69b4.svg?style=flat-square)](https://palantir.github.io/tslint)
[![StackShare](https://img.shields.io/badge/tech-stack-0690fa.svg?style=flat-square)](https://stackshare.io/paul-roman/vitrine)
</p>

## About Vitrine
Vitrine is a modern game library using the Electron framework and the IGDB database to display games installed on your computer. It scans your Steam and Origin games folder to retrieve your libraries, use the IGDB database to provide details about your games (developer, publisher, release date, screenshots, ...) and display them in a smooth and simple interface. It can also measure the time spend playing a game and can be synchronized to Steam playing times.

## Beta
As it is in beta, Vitrine only currently supports Steam, Origin and Battle.net but in the future it will also work with GOG Games. The module to find emulated games automatically is still in early beta, but will soon work with a defined list of emulators. The UI is also in an early stage of development and will change within future updates. Feel free to test the application yourself and seek for a bug! If you can find one, don't hesitate to [open an issue](https://github.com/paul-roman/vitrine/issues/new).

### Custom Build
If you want to make your own build of Vitrine, you need to : 
1) Clone this repository and run `yarn install` to download dependencies.
2) Download and install [node-gyp](https://github.com/nodejs/node-gyp) to compile the C++ Node native addons.
3) Run `yarn run build` to build Vitrine and start it. If you want to build a packed version, use `yarn run pack` or `yarn run dist` for a version with an installation binary ready for distribution.

## Technologies
Vitrine is made possible thanks to a lot of different technologies, including:
- [Node.js](https://nodejs.org)
- [Electron](https://electronjs.org)
- [React](https://reactjs.org)
- [Redux](https://redux.js.org)
- [Semantic UI](https://semantic-ui.com)
- [IGDB](https://www.igdb.com)
- [TypeScript](http://www.typescriptlang.org)
- [Less](http://lesscss.org)
- [Webpack](https://webpack.js.org)

## License
Vitrine is a open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).
