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

You can also minify your own version:

 - First, download the [Google Closure Compiler](https://developers.google.com/closure/compiler/) and copy it to `build/compiler.jar`.
 - Then, use `make` and you will find the file `domino.min.js` in the `build` directory.

### Contributing

You can contribute by submitting [issues tickets](http://github.com/jacomyal/domino.js/issues) and proposing [pull requests](http://github.com/jacomyal/domino.js/pulls).

The whole source code is validated by the [Google Closure Linter](https://developers.google.com/closure/utilities/), and the comments are written in [JSDoc](http://en.wikipedia.org/wiki/JSDoc) (tags description is available [here](https://developers.google.com/closure/compiler/docs/js-for-compiler)).

---

### ChangeLog

#### 1.1 (November 22, 2012)

 - Fixed shortcuts priority: custom objects > properties > shortcuts
 - `update(key, value)` now works
 - Added possibility to override any setting in each instance
 - Added possibility to override `clone` property for each property
 - Using `data` when calling a service now eventually overrides the function `data` in the service declaration
 - Adding a hack with only a `triggers` property allows transversal communication between modules
 - Custom structures (see [documentation](http://dominojs.org/#structures))

#### 1.0 (November 8, 2012)

 - *domino.js* first release
 - project web page also released at [http://dominojs.org](http://dominojs.org) (branch `gh-pages`)