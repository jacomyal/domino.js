'use strict';

var types = require('./domino.types.js'),
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
      throw 'The execution is not unlocked yet';

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
      throw 'Wrong parameter';

    if (typeof order.type !== 'number')
      throw 'Order\'s type not specified';

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
        throw 'Unknown order type "' + order.type + '"';
    }
  }

  // Data related functions:
  function _addProperty(specs) {
    if (types.check(specs, 'domino.property|domino.shortcut'))
      throw 'Wrong type.';

    if (_properties[specs.id])
      throw 'The property "' + specs.id + '" already exists.';

    _properties[specs.id] = helpers.clone(specs);

    return this;
  }
  function _setProperty(propName, value) {
    if (!types.check(propName, 'domino.fullname'))
      throw 'Wrong type.';

    // TODO
  }
  function _getProperty(propName) {
    // TODO
  }

  // Services related functions:
  function _addService(specs) {
    if (types.check(specs, 'domino.service'))
      throw 'Wrong type.';

    if (_properties[specs.id])
      throw 'The property "' + specs.id + '" already exists.';

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

module.exports = domino;
