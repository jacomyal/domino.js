'use strict';

var types = require('typology'),
    logger = require('./domino.logger.js'),
    helpers = require('./domino.helpers.js'),
    emitter = require('./domino.emitter.js');

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
  description: '?string',
  namespace: '?domino.name',
  emit: '?domino.events',
  type: '?type',
  value: '?*'
});
types.add('domino.facet', {
  id: 'domino.name',
  description: '?string',
  namespace: '?domino.name',
  get: 'function'
});

var defaultSettings = {
  errorMessage: 'error from domino',
  verbose: true
};





/**
 * *********************
 * DOMINO'S CONSTRUCTOR:
 * *********************
 */
var domino = function() {
  var _self = this,

      // Orders:
      _stackFuture = [],
      _stackCurrents = [],

      // Execution state:
      _timeout,
      _executionLock,

      // Instance related attributes:
      _facets = {},
      _properties = {},
      _emitter = new emitter();

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


  /**
   * ***************
   * CORE FUNCTIONS:
   * ***************
   */
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
        emits = {};

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

        // If an event is emited several times with no data and at the same
        // time, then it will be emited ony once instead.
        case 'emit':
          arr = Array.isArray(order.events) ?
            order.events :
            [order.events];
          for (i = 0, l = arr.length; i < l; i++) {
            if (emits[arr[i]]) {
              if (!('data' in order)) {
                arr2 = emits[arr[i]];
                for (j = 0, l2 = arr2.length; j < l2; j++)
                  if (!('data' in arr2[j]))
                    break;
                arr2.push(order);
              }
              else
                emits[arr[i]].push(order);
            } else
              emits[arr[i]] = [order];
          }
          break;

        default:
          _self.die('Unknown order type "' + order.type + '"');
      }

    // Unstack orders:
    for (k in updates)
      _updateProperty(k, updates[k].value);
    for (k in emits)
      _emitter.emit(k, emits[k].data);

    // Update lock flag:
    _executionLock = false;

    if (_stackFuture.length)
      _timeout = setTimeout(_execute, 0);
  }


  /**
   * **************
   * API FUNCTIONS:
   * **************
   */
  function _registerProperty(specs) {
    // Actually try to register the property:
    if (arguments.length === 1) {
      if (!types.check(specs, 'domino.property'))
        _self.die('Wrong type.');

      if (_facets[specs.id])
        _self.die('A facet named "' + specs.id + '" already exists.');
      if (_properties[specs.id])
        _self.die('The property "' + specs.id + '" already exists.');
      _properties[specs.id] = helpers.clone(specs);

    // Refactor arguments, recall the function:
    } else if (arguments.length === 2) {
      var id = specs,
          fullSpecs = helpers.clone(arguments[1]);

      fullSpecs.id = id;

      return _registerFacet(fullSpecs);
    }

    return this;
  }

  function _registerProperties(specs) {
    var i,
        l,
        k,
        id;

    if (arguments.length === 1) {
      if (types.check(specs, 'domino.property'))
        _registerProperty.call(this, specs);
      else if (types.check(specs, 'array'))
        for (i = 0, l = specs.length; i < l; i++)
          _registerProperty.call(this, specs[i]);
      else if (types.check(specs, 'object'))
        for (k in specs)
          _registerProperty.call(this, k, specs[k]);

    } else
      _registerProperty.apply(this, arguments);

    return this;
  }

  function _registerFacet(specs) {
    // Actually try to register the facet:
    if (arguments.length === 1) {
      if (!types.check(specs, 'domino.facet'))
        _self.die('Wrong type.');

      if (_properties[specs.id])
        _self.die('A property named "' + specs.id + '" already exists.');
      if (_facets[specs.id])
        _self.die('The facet "' + specs.id + '" already exists.');
      _facets[specs.id] = helpers.clone(specs);

    // Refactor arguments, recall the function:
    } else if (arguments.length === 2) {
      var id = specs,
          fullSpecs;

      specs = arguments[1];

      if (typeof specs === 'function')
        fullSpecs = {
          id: id,
          get: specs
        };
      else if (typeof specs === 'object') {
        fullSpecs = helpers.clone(specs);
        fullSpecs.id = id;
      }

      return _registerFacet(fullSpecs);
    }

    return this;
  }

  function _registerFacets(specs) {
    var i,
        l,
        k,
        id;

    if (arguments.length === 1) {
      if (types.check(specs, 'domino.facet'))
        _registerFacet.call(this, specs);
      else if (types.check(specs, 'array'))
        for (i = 0, l = specs.length; i < l; i++)
          _registerFacet.call(this, specs[i]);
      else if (types.check(specs, 'object'))
        for (k in specs)
          _registerFacet.call(this, specs[k]);

    } else
      _registerFacet.apply(this, arguments);

    return this;
  }

  function _updateProperty(propName, value) {
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
    if (property.emit)
      _addOrder({
        type: 'emit',
        events: property.emit
      });
  }

  function _getValue(propName) {
    if (!types.check(propName, 'domino.name'))
      _self.die('Invalid property name.');

    if (_properties[propName])
      return _properties[propName].value;
    else if (_facets[propName])
      return _facets[propName].get.call(_self);
  }

  function _eventToOrder(event) {
    _addOrder({
      type: 'emit',
      events: event.type,
      data: event.data
    });
  }


  /**
   * ********************
   * PUBLIC DECLARATIONS:
   * ********************
   */
  this.registerProperties = _registerProperties;
  this.registerFacets = _registerFacets;
  this.get = _getValue;
  this.update = function(property, value) {
    _addOrder({
      type: 'update',
      property: property,
      value: value
    });
    return this;
  };

  this.on = function() {
    _emitter.on.apply(_emitter, arguments);
    return this;
  };
  this.off = function() {
    _emitter.off.apply(_emitter, arguments);
    return this;
  };
  this.emit = function(events, data) {
    _addOrder({
      type: 'emit',
      events: events,
      data: data
    });
    return this;
  };
};





/**
 * ***************************
 * GLOBAL PUBLIC DECLARATIONS:
 * ***************************
 */
domino.types = types;
domino.helpers = helpers;
domino.emitter = emitter;
domino.settings = defaultSettings;





/**
 * *******
 * EXPORT:
 * *******
 */
module.exports = domino;
