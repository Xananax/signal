# ./

## ./public/
contains the compiled files, as well as the 'index.html' used in the dev server

## ./src/
All the sources

## ./test/
All the tests

## ./typings/
Generated when running `typings install`. Contains definitions for imported modules, as well as some custom ones to enable typescript to not error on some legacy functions (`attachEvent` and similar).

## ./.vscode/
Configuration for Microsoft's vscode. Hides some files and directories.

## babelrc
Configuration for babel. Sets the preset to `es2015`, and adds `react-transform` as well as react hot reloading. React is not actually used in this project, but the configuration exists as a basis for other projects.

## directory.md
This file

## *.sublime-project, *.sublime-workspace
Configuration for sublime. Hides the same files and directories as VScode's config.

## .gitignore
Specifies files to be ignored by git

## index.js
Entry point for webpack building and dev server

## karma.conf.js
Configuration for Karma, the test runner. Uses "chrome" as a browser, and reuses the webpack configuration

## main.js
Entry point for loading the whole module through npm. Requires the compiled javascript file in `public/` and exposes it.

## .npmignore

## package.json

## readme.md

## tsconfig.json

## typings.json

## webpack.config.js