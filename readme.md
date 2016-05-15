# GameOver

An experiment with building games or user interfaces with minimal code and minimal dependencies. Actually, no external dependencies at all, unless you want to contribute.

This project aims to demonstrate the following:

- Easy configuration for webpack with hot reloading, typescript, and css file generation
- Karma + mocha + chai testing
- A real-life typescript project (resources are scarce) with complex types and curried everything
- A real-life reactive-driven project without frameworks 
- A real-life game project with easy to follow code
- A real-life build and test pipeline without grunt, gulp, and similar

*warning*: There is absolutely no guarantee:

- That this code is efficient
- That this code is bugless
- That this code will be maintained in any way
- That this code will run at all
- That this repository won't be removed in the next five minutes

## Another Game Engine?

Yeah, I wanted to dip into that. Popular wisdom advises against it, however, in the case of javascript, an "engine" is all relative. The engine is already there, for the most part. All you need to do is build a few facility functions to capture keypresses and move things around.
For a very intensive game, I would probably use something else, but I wanted to build this just to try. 

## How to run

Prepare first:
```sh
npm install -g typings
npm install && typings install
```

then:

Dev server:
```sh
npm start
```
Run tests:
```sh
npm test
```
Compile:
```sh
npm run build
```
or, if you don't want to run the tests prior:
```sh
npm run compile
```

Generate typings (not working very well at the moment):
```sh
npm run typings
```

Generate things to do:
```sh
npm run todo
```

## How does it work?
Each directory contains it's own 'readme.md' file that explains how everything in the directory works. In that sense, the repo works like a wiki. The exception is this directory, which you will find described in [directory.md](./directory.md).

## Todo

You'll find a list of things to do in [todo.md](./todo.md)

## License

[MIT](https://opensource.org/licenses/MIT)