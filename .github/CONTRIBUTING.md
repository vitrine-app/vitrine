# Contributing to Vitrine

Hi there! If you're reading this, you probably want to contribute to Vitrine, I first want to thank you for that!
My name is Paul, I'm the creator and the main developper of Vitrine.
This guide is here to help you understaning the philosophy of the project, getting you started and giving you guidelines for further contributions.
Note that this guide is likely to change in the future, so feel free to check again this file at some point.

As you probably already know it, Vitrine is using web technologies to run, the fundation of the project is the Electron framework, using both Chromium and Node.js APIs.
We're also using TypeScript instead of pure JavaScript in order to have a more stable and safe code.

## Getting Vitrine compiling and running

The first step to get Vitrine running is to install its dependencies. We're using Yarn as a packages manager, so you just need to clone the repository and run `yarn install`.

Vitrine is using custom Node.js native addons, written in C++, which need to be compiled. For the moment, Vitrine is only running on Windows, which means that the C++ addons can only be compiled with Visual C++ Build Tools. 
You need to download and install [Windows-Build-Tools](https://github.com/felixrieseberg/windows-build-tools).

## Writing code

Few things on how we code here:
* We are using TSLint to format the code, so when you are writting make sure to run `yarn run lint-app` to see if your code is compliant to the styleguide.
* If you don't manually format your code, TSLint will automatically fix it at `precommit`.
* We use Mocha along with Chai to write tests. For the moment, tests are not fully provided, so feel free to write some for existing pieces of code.
