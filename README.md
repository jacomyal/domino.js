domino.js
=========

*domino.js* is a JavaScript cascading controller for fast interactive Web interfaces prototyping, developped by [Alexis Jacomy](http://github.com/jacomyal) at [Linkfluence](http://github.com/linkfluence). It is released under the [MIT License](https://raw.github.com/jacomyal/domino.js/master/LICENSE.txt).

Check the project webpage to see the documentation: [http://dominojs.org](http://dominojs.org).

### How to use it

To use it, clone the repository:

```
git clone git@github.com:jacomyal/domino.js.git
```

The latest minified version is available here:

[https://raw.github.com/jacomyal/domino.js/master/build/domino.min.js](https://raw.github.com/jacomyal/domino.js/master/build/domino.min.js)

You can also minify your own version with [Grunt](http://gruntjs.com/):

 - First, install [Node.js](http://nodejs.org/), [NPM](https://npmjs.org/) and [Grunt](http://gruntjs.com/installing-grunt).
 - Use `npm install` to install domino.js development dependencies.
 - Use `grunt` to successively lint sources, launch unit tests, and minify the code with [Uglify](https://github.com/mishoo/UglifyJS).

### Contributing

You can contribute by submitting [issues tickets](http://github.com/jacomyal/domino.js/issues) and proposing [pull requests](http://github.com/jacomyal/domino.js/pulls). Be sure to successfully run `grunt closureLint` and `grunt qunit` before submitting any pull request.

The whole source code is validated by the [Google Closure Linter](https://developers.google.com/closure/utilities/), and the comments are written in [JSDoc](http://en.wikipedia.org/wiki/JSDoc) (tags description is available [here](https://developers.google.com/closure/compiler/docs/js-for-compiler)).

Also, the change log is available [here](http://github.com/jacomyal/domino.js/CHANGELOG.md).
