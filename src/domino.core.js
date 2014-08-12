'use strict';

var types = require('./domino.types.js'),
    logger = require('./domino.logger.js'),
    helpers = require('./domino.helpers.js'),
    triggerer = require('./domino.event.js');

/**
 * Custom types related to domino:
 */
types.add('domino.events', function(val) {
  return typeof val === 'string' || types.check(val, ['string']);
});
types.add('domino.name', function(val) {
  return typeof val === 'string' && !!val.match(/^[a-zA-Z_$-][a-zA-Z_$0-9-]*$/);
});

types.add('domino.property', {
  id: 'domino.name',
  namespace: '?domino.name',
  events: '?domino.events',
  type: '?type',
  value: '?*'
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
      _properties = {},
      _shortcuts = {},

      // Events:
      _triggerer = new triggerer();

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

    return this;
  }
  function _execute() {
    if (_executionLock)
      _self.die('The execution is not unlocked yet');

    // Set state:
    _timeout = null;
    _executionLock = true;
    _stackCurrents = _stackFuture;
    _stackFuture = [];

    // Merge orders:
    var k,
        i,
        j,
        l,
        l2,
        arr,
        arr2,
        order,

        updates = {},
        requests = {},
        triggers = {};

    while ((order = _stackCurrents.shift()))
      switch (order.type) {
        // Domino throws an error if the same property must be updated several
        // times at the same time with different values.
        case 'update':
          if (updates[order.property]) {
            if (updates[order.property].value !== order.value)
              _self.die(
                'You are trying to update the property "' + order.property +
                '" with the values', updates[order.property].value, 'and',
                order.value, 'at the same time.'
              );
          } else
            updates[order.property] = order;
          break;

        // It is allowed to call several times the same service at the same
        // time.
        case 'request':
          if (requests[order.service])
            requests[order.service].push(order);
          else
            requests[order.service] = [order];
          break;

        // If an event is triggered several times with no data and at the same
        // time, then it will be triggered ony once instead.
        case 'trigger':
          arr = Array.isArray(order.events) ?
            order.events :
            [order.events];
          for (i = 0, l = arr.length; i < l; i++) {
            if (triggers[arr[i]]) {
              if (!('data' in order)) {
                arr2 = triggers[arr[i]];
                for (j = 0, l2 = arr2.length; j < l2; j++)
                  if (!('data' in arr2[j]))
                    break;
                arr2.push(order);
              }
              else
                triggers[arr[i]].push(order);
            } else
              triggers[arr[i]] = [order];
          }
          break;

        default:
          _self.die('Unknown order type "' + order.type + '"');
      }

    // Unstack orders:
    for (k in updates)
      _setProperty(k, updates[k].value);
    for (k in requests)
      _requestService(k, requests[k]);
    for (k in triggers)
      _triggerer.trigger(k, triggers[k].data);

    // Update lock flag:
    _executionLock = false;

    if (_stackFuture.length)
      _timeout = setTimeout(_execute, 0);
  }

  // Data related functions:
  function _addProperty(specs) {
    var isShortcut;

    if (types.check(specs, 'domino.property'))
      isShortcut = false;
    else if (types.check(specs, 'domino.property'))
      isShortcut = true;
    else
      _self.die('Wrong type.');

    if (isShortcut) {
      if (_shortcuts[specs.id])
        _self.die('The property "' + specs.id + '" already exists.');
      _shortcuts[specs.id] = helpers.clone(specs);

    } else {
      if (_properties[specs.id])
        _self.die('The property "' + specs.id + '" already exists.');
      _properties[specs.id] = helpers.clone(specs);
    }

    return this;
  }

  function _setProperty(propName, value) {
    if (!types.check(propName, 'domino.name'))
      _self.die('Invalid property name.');

    var property = _properties[propName];

    if (!property)
      _self.die('The property "' + propName + '" does not exist.');

    if (property.type && !types.check(value, property.type))
      _self.die('Wrong type for "' + propName + '".');

    // Update the property's value:
    property.value = value;

    // Dispatch related events:
    if (property.events)
      _addOrder({
        type: 'trigger',
        events: property.events
      });
  }
  function _getProperty(propName) {
    if (!types.check(propName, 'domino.name'))
      _self.die('Invalid property name.');

    if (_properties[propName])
      return _properties[propName].value;
    else if (_shortcuts[propName])
      return _shortcuts[propName].get.call(_self);
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

  // Public declarations:
  this.addService = _addService;

  this.addProperty = _addProperty;
  this.get = _getProperty;
  this.set = function(property, value) {
    _addOrder({
      type: 'update',
      property: property,
      value: value
    });
    return this;
  };

  this.on = function() {
    _triggerer.on.apply(_triggerer, arguments);
    return this;
  };
  this.off = function() {
    _triggerer.off.apply(_triggerer, arguments);
    return this;
  };
  this.trigger = function(events, data) {
    _addOrder({
      type: 'trigger',
      events: events,
      data: data
    });
    return this;
  };
};

// Global public declarations:
domino.types = types;
domino.helpers = helpers;
domino.triggerer = triggerer;
domino.settings = defaultSettings;

// Export:
module.exports = domino;
