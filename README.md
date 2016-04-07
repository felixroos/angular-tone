angular-tone
=============================

Make Music with AngularJS! This Module wraps ToneJS together with many music UI elements such as keyboards and pads.


## System Preparation

To use this starter project, you'll need the following things installed on your machine.

1. [NodeJS](http://nodejs.org)
2. [GulpJS](https://github.com/gulpjs/gulp) - `$ npm install -g gulp` 
3. [Bower](http://bower.io/) - `$ npm install -g bower` 

## Local Installation

1. Clone this repo, or download it into a directory of your choice.
2. Inside the directory, run `npm install`.

## Development

This will give you file watching, browser synchronisation, auto-rebuild, CSS injecting etc etc.

```shell
$ gulp serve
```

### adding a new js lib
To add a js library, use the provided bower package and run

```shell
$ bower install jquery -s
```

The `-s` attribute ensures, that the package is added to your bower.json file.


### adding sass files from external libs
After adding and installing the library with bower, you can import the files in your sass-files using the relative path to the library in the bower_modules folder.

## Deploy / build project

To build the project, run

```shell
$ gulp build
```

All files will be stored in the `dist` folder.