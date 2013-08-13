## domino.js - changelog:

#### 1.3.2 (August 13, 2013)

 - Fixed [#47](https://github.com/jacomyal/domino.js/issues/47) (the bug was actually related to a [recent quick fix](https://github.com/jacomyal/domino.js/commit/30e779eb443c281985945b3bd305a9d39cb37c09))

#### 1.3.1 (July 10, 2013)

 - Fixed [#40](https://github.com/jacomyal/domino.js/issues/40): Hash instead of arrays for domino (works for `properties`, `services` and `shortcuts`)
 - Fixed [#44](https://github.com/jacomyal/domino.js/issues/44): Added `log`, `warn` and `die` in modules
 - Fixed [#25](https://github.com/jacomyal/domino.js/issues/25): Simultaneous calls `success` works
 - Added `update` to the methods to disable in fake scopes
 - Fixed [#43](https://github.com/jacomyal/domino.js/issues/43) (Inconsistent `dispatchEvent` polymorphism)
 - Fixed [#42](https://github.com/jacomyal/domino.js/issues/42): Improved `before` feature in services
 - Fixed [#36](https://github.com/jacomyal/domino.js/issues/36): DOM elements are no more cloned
 - Published to [NPM](https://npmjs.org/package/domino-js)

#### 1.3.0 (June 21, 2013)

 - Switched from the Makefile to [Grunt](http://gruntjs.com/installing-grunt)
 - Switched from Closure Compiler to [Uglify](https://github.com/mishoo/UglifyJS)
 - Lot of minor changes to make domino.js become usable on Node.js

#### 1.2.4 (June 12, 2013)

 - Fixed [#29](https://github.com/jacomyal/domino.js/issues/29): Version info in development file
 - Fixed [#26](https://github.com/jacomyal/domino.js/issues/26): Descriptions management and `help()` instance method
 - Fixed [#32](https://github.com/jacomyal/domino.js/issues/32) (`dispatchEvent` not dispatching data when called from a service)
 - Fixed [#23](https://github.com/jacomyal/domino.js/issues/23): Referencing modules with unique IDs
 - Fixed [#28](https://github.com/jacomyal/domino.js/issues/28) (Uncaught error when `expect` callback fails)
 - Fixed [#27](https://github.com/jacomyal/domino.js/issues/27): Fixed "force" property parameter
 - Fixed [#30](https://github.com/jacomyal/domino.js/issues/30): Enabled "includes" flag in custom structures

#### 1.2.3 (June 7, 2013)

 - Added the `killModule` method to cleanly remove every bindings between a module and its related `domino` instance.
 - Fixed [#22](https://github.com/jacomyal/domino.js/issues/22): Hacks `description` field added for logging. Set the parameter `"logDescriptions"` to `false` to quit logging hacks descriptions.

#### 1.2.2 (May 15, 2013)

 - Fixed [#10](https://github.com/jacomyal/domino.js/issues/10): Added log when `expect` callbacks fail
 - Fixed [#11](https://github.com/jacomyal/domino.js/issues/11): Added an access to the global configuration hash of any instance, through the method `configuration`
 - Fixed [#20](https://github.com/jacomyal/domino.js/issues/20): Added an `update` method in scopes
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

#### 1.2.0 (February 18, 2013)

 - Added `expect` feature to filter successful service calls.
 - Added unit tests for services.
 - Added a sample with two instances communicating through a server emulated with [jquery.mockjax.js](https://github.com/appendto/jquery-mockjax).

#### 1.1.1 (January 18, 2013)

 - Fixed[ #1](https://github.com/jacomyal/domino.js/issues/): 1`request` and `dispatchEvent` have the same behaviour from instance and from scopes.
 - Fixed[ #4](https://github.com/jacomyal/domino.js/issues/): 4`request` and `dispatchEvent` from scopes are disabled when the scopes are analyzed.
 - Improved a bit environment.

#### 1.1.0 (November 28, 2012)

 - Fixed shortcuts priority: custom objects > properties > shortcuts
 - `update(key, value)` now works
 - Added possibility to override any setting in each instance
 - Added possibility to override `clone` property for each property
 - Using `data` when calling a service now eventually overrides the function `data` in the service declaration
 - Adding a hack with only a `triggers` property allows transversal communication between modules
 - Custom structures (see [documentation](http://dominojs.org/#structures))

#### 1.0.0 (November 8, 2012)

 - *domino.js* first release
 - project web page also released at [http://dominojs.org](http://dominojs.org) (branch `gh-pages`)
