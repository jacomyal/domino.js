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

#### 1.2.2 (May 15, 2013)

 - Fixed #10: Added log when `expect` callbacks fail
 - Fixed #11: Added an access to the global configuration hash of any instance, through the method `configuration`
 - Fixed #20: Added an `update` method in scopes
 - Added `addEventListener`, `removeEventListener` and `getEvent` access in global instances
 - Cleaned up existing tests and examples
 - Added unit tests for `hacks`

#### 1.2.1 (April 12, 2013)

 - `src/domino.modules.js` has moved to `examples/modules.js`
 - Added emitter reference to the main loop.
 - Each loop now has an ID, which is logged at every iteration
 - Added possibility to add a maximum loop iterations depth in settings (`"maxDepth"`)
 - Fixed: Events `data` are no more lost from a `_mainLoop` iteration to the next one
 - `domino.EventDispatcher` is now prototyped
 - `request` now accept an array of objects as argument.
 - Unless the settings key `"mergeRequests"` is `false`, parallel requests are now "merged" to prevent parallel loops multiplication when:
   * the `request` method is called several time in the same callback (hack, success, etc...)
   * the `request` method is called with an array of services descriptions

#### 1.2 (February 18, 2013)

 - Added `expect` feature to filter successful service calls.
 - Added unit tests for services.
 - Added a sample with two instances communicating through a server emulated with [jquery.mockjax.js](https://github.com/appendto/jquery-mockjax).

#### 1.1.1 (January 18, 2013)

 - Fixed #1: `request` and `dispatchEvent` have the same behaviour from instance and from scopes.
 - Fixed #4: `request` and `dispatchEvent` from scopes are disabled when the scopes are analyzed.
 - Improved a bit environment.

#### 1.1 (November 28, 2012)

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
