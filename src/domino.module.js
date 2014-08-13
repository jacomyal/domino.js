'use strict';

var emitter = require('./domino.emitter.js');

var moduleConstructor = function() {
  var k;

  // Extend the prototype if this class is used as a parent class:
  if (!(this instanceof module))
    for (k in module.prototype)
      this[k] = module.prototype[k];

  // Also extend emitter:
  if (!this._handlers) {
    emitter.call(this);

    for (k in emitter.prototype)
      this[k] = module.prototype[k];
  }
};

module.exports = moduleConstructor;
