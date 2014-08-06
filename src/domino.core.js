'use strict';

var types = require('./domino.types.js'),
    logger = require('./domino.logger.js'),
    helpers = require('./domino.helpers.js');

/**
 * Custom types related to domino:
 */
types.add('domino.events', function(val) {
  return typeof val === 'string' || types.check(val, ['string']);
});
types.add('domino.name', function(val) {
  return typeof val === 'string' &&
    val.match(/^[a-zA-Z_$-][a-zA-Z_$0-9-]*$/);
});

types.add('domino.property', {
  id: 'domino.name',
  namespace: '?domino.name',
  events: '?domino.events',
  type: '?type'
});
types.add('domino.shortcut', {
  id: 'domino.name',
  namespace: '?domino.name',
  get: 'function'
});
types.add('domino.service', {
  id: 'domino.name',
  namespace: '?domino.name',
  property: '?string',
  dataPath: '?string',
  success: '?function',
  error: '?function'
});

var defaultSettings = {
  errorMessage: 'error from domino',
  verbose: true
};

var domino = function() {
  var _self = this,

      // Orders:
      _stackFuture = [],
      _stackCurrents = [],

      // Execution state:
      _timeout,
      _executionLock,

      // Properties:
      _properties = {};

  // Settings method:
  this.settings = function(a1, a2) {
    if (typeof a1 === 'string' && arguments.length === 1)
      return defaultSettings[a1];
    else {
      var o = (typeof a1 === 'object' && arguments.length === 1) ?
        a1 || {} :
        {};
      if (typeof a1 === 'string')
        o[a1] = a2;

      for (var k in o)
        if (o[k] !== undefined)
          defaultSettings[k] = o[k];
        else
          delete defaultSettings[k];

      return this;
    }
  };

  // Logging methods:
  this.debug = function() {
    if (_self.settings('verbose'))
      logger.debug.apply(logger, arguments);
  };
  this.info = function() {
    if (_self.settings('verbose'))
      logger.info.apply(logger, arguments);
  };
  this.warn = function() {
    if (_self.settings('verbose'))
      logger.warn.apply(logger, arguments);
  };
  this.die = function() {
    if (_self.settings('verbose'))
      logger.die.apply(logger, arguments);
    throw _self.settings('errorMessage') || new Error();
  };

  // Orders management functions:
  function _addOrder(order, now) {
    // TODO:
    // Validate order's structure.

    _stackFuture.push(order);

    if (!_timeout && !_executionLock) {
      if (now)
        _execute();
      else
        _timeout = setTimeout(_execute, 0);
    }
  }
  function _execute() {
    if (_executionLock)
      _self.die('The execution is not unlocked yet');

    // Set state:
    _timeout = null;
    _executionLock = true;
    _stackCurrents = _stackFuture;
    _stackFuture = [];

    // Unstack orders:
    var order;
    while ((order = _stackCurrents.pop()))
      _executeOrder(order);

    // Update lock flag:
    _executionLock = false;

    if (_stackFuture.length)
      _timeout = setTimeout(_execute, 0);
  }
  function _executeOrder(order) {
    if (!order || typeof order !== 'object')
      _self.die('Wrong parameter');

    if (typeof order.type !== 'number')
      _self.die('Order\'s type not specified');

    switch (order.type) {
      case 'update':
        _setProperty(
          order.property,
          order.value
        );
        break;
      case 'request':
        _requestService(
          order.service,
          order.options
        );
        break;
      case 'trigger':
        _triggerEvent(
          order.event,
          order.data
        );
        break;
      default:
        _self.die('Unknown order type "' + order.type + '"');
    }
  }

  // Data related functions:
  function _addProperty(specs) {
    if (types.check(specs, 'domino.property|domino.shortcut'))
      _self.die('Wrong type.');

    if (_properties[specs.id])
      _self.die('The property "' + specs.id + '" already exists.');

    _properties[specs.id] = helpers.clone(specs);
  }
  function _setProperty(propName, value) {
    if (!types.check(propName, 'domino.name'))
      _self.die('Wrong type.');

    // TODO
  }
  function _getProperty(propName) {
    // TODO
  }

  // Services related functions:
  function _addService(specs) {
    if (types.check(specs, 'domino.service'))
      _self.die('Wrong type.');

    if (_properties[specs.id])
      _self.die('The property "' + specs.id + '" already exists.');

    _properties[specs.id] = helpers.clone(specs);

    return this;
  }
  function _requestService(service, options) {
    // TODO
  }

  // Events related functions:
  function _triggerEvent(event, data) {
    // TODO
  }
};

domino.types = types;
domino.helpers = helpers;
domino.settings = defaultSettings;

module.exports = domino;
