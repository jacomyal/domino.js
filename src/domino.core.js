'use strict';

var ajax = require('djax'),
    types = require('typology'),
    emitter = require('emmett'),
    logger = require('./domino.logger.js'),
    helpers = require('./domino.helpers.js'),
    mixinForge = require('./domino.react.js');

/**
 * Custom types related to domino:
 */
types.add('domino.events', function(val) {
  return typeof val === 'string' || types.check(val, ['string']);
});
types.add('domino.name', function(val) {
  return typeof val === 'string' && !!val.match(/^[a-zA-Z_$-][a-zA-Z_$0-9-]*$/);
});

types.add('domino.property', function(obj) {
  return types.check(obj, {
    id: 'domino.name',
    type: '?type',
    description: '?string',
    namespace: '?domino.name',
    emit: '?domino.events',
    value: '?*'
  }) && (!obj.type || types.check(obj.value, obj.type));
});
types.add('domino.facet', {
  id: 'domino.name',
  description: '?string',
  namespace: '?domino.name',
  get: 'function'
});
types.add('domino.service', function(obj) {
  return (
    types.check(obj, 'object') &&
    types.check(obj.id, 'domino.name') &&
    types.check(obj.url, 'string')
  );
});

// Orders
var orderTypes = {
  update: {
    type: 'string',
    property: 'string',
    value: '*'
  },
  emit: {
    type: 'string',
    events: 'string|array',
    data: '?*'
  }
};

types.add('domino.order', function(obj) {
  return (
    types.check(obj, 'object') &&
    types.check(obj.type, 'string') &&
    types.check(obj, orderTypes[obj.type])
  );
});




/**
 * Default domino's settings:
 */
var defaultSettings = {
  solveFromSpecs: true,
  paramSolver: /:([^\/]*)/g,
  mixinControllerName: 'control',
  errorMessage: 'error from domino',
  verbose: true
};




/**
 * Running domino instances:
 */
var _instances = {},
    _getNewId = (function() {
      var i = 0;
      return function() {
        return '' + (++i);
      };
    })();




/**
 * *********************
 * DOMINO'S CONSTRUCTOR:
 * *********************
 */
var domino = function(options) {
  var _self = this,

      // Settings:
      _settings = {},

      // Orders:
      _stackFuture = [],
      _stackCurrents = [],

      // Execution state:
      _timeout,
      _executionLock,

      // Instance related attributes:
      _facets = {},
      _services = {},
      _properties = {},
      _emitter = new emitter(),
      _mixin = mixinForge(this);




  /**
   * ********************
   * INITIALIZE INSTANCE:
   * ********************
   */
  if (options) {
    // Register instance:
    if (typeof options.name === 'string')
      this.name = options.name;
    else if ('name' in options)
      throw new Error('Wrong type for domino instance name');
    else
      this.name = _getNewId();

    // Check name:
    if (_instances[this.name])
      throw new Error(
        'Domino instance named "' + this.name + '" already exists'
      );
    else
      _instances[this.name] = this;

    // Register initial options:
    _register(options);
  }




  /**
   * ***************
   * CORE FUNCTIONS:
   * ***************
   */

  /**
   * This function is the core of domino. It is the place were is implemented
   * domino's most important and singular principle: The orders deduplication:
   *
   * So, it will first deduplicate orders, to avoid emitting twice an event at
   * the same time, order update a property with two different values in the
   * same frame, for instance.
   *
   * Then, it will execute the orders. And if new orders have been added to the
   * new stack, this function will be called again next frame.
   */
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
   * This function properly adds an order to the stack. If the stack was empty
   * before, then the _execute function will be planed for next frame if the
   * "now" flag is true, in which case the _execute function will be executed
   * right now (ie synchronously).
   *
   * @param  {domino.order}  order The order to add.
   * @param  {boolean}       now   A boolean specifying wether the loop has to
   *                               start synchronously or not if the stack was
   *                               empty before. The default value is "false".
   * @return {*}                   Returns this.
   */
  function _addOrder(order, now) {
    if (!types.check(order, 'domino.order'))
      _self.die('Wrong type for order', order);

    _stackFuture.push(order);

    if (!_timeout && !_executionLock) {
      if (now)
        _execute();
      else
        _timeout = setTimeout(_execute, 0);
    }

    return this;
  }


  /**
   * This function adds the order of emitting an event.
   *
   * @param  {object} event The event to emit, ie an object with at least a type
   *                        and data value.
   * @return {*}            Returns this.
   */
  function _orderEmitEvent(event) {
    _addOrder({
      type: 'emit',
      events: event.type,
      data: event.data
    });

    return this;
  }


  /**
   * This function adds the order of updating a property.
   *
   * @param  {string} propName The name of the property to update.
   * @param  {*}      value    The new value of the property.
   * @return {*}               Returns this.
   */
  function _orderUpdateProperty(propName, value) {
    if (arguments.length === 1) {
      if (!types.check(propName, 'object'))
        _self.die('Wrong arguments.');

      var k;
      for (k in propName)
        _self.update(k, propName[k]);

    } else if (arguments.length === 2) {
      if (!types.check(propName, 'domino.name'))
        _self.die('Invalid property name.');

      if (!_properties[propName])
        _self.die('The property "' + propName + '" does not exist.');

      if (
        _properties[propName].type &&
        !types.check(value, _properties[propName].type)
      )
        _self.die('Wrong type for "' + propName + '".');

      _addOrder({
        type: 'update',
        property: propName,
        value: value
      });
    }

    return this;
  }




  /**
   * *****************
   * REGISTER HELPERS:
   * *****************
   */

  /**
   * This function helps registering several properties, shortcuts, etc... at
   * the same time. The goal is to be able to add a bunch of related elements of
   * a controller as a single object, to explode the controller specifications
   * as several different files.
   *
   * The "specs" argument must be an object, containing arrays or objects
   * associated to the keys "facets" and "properties".
   *
   * @param  {Object} specs The elements to register in the controller.
   * @return {*}            Returns this.
   */
  function _register(specs) {
    if (!types.check(specs, 'object'))
      _self.die('Wrong type.');

    if (specs.settings)
      _self.settings(specs.settings);
    if (specs.facets)
      _registerFacets(specs.facets);
    if (specs.properties)
      _registerProperties(specs.properties);
    if (specs.services)
      _registerServices(specs.services);
    if (specs.bindings)
      _emitter.on(helpers.bind(specs.bindings, _self));

    return this;
  }


  /**
   * This function registers one property into the controller. Check the
   * "domino.property" custom type to know more about the optional parameters.
   *
   * Variant 1:
   * **********
   * > _registerProperty({ id: 'myProperty', type: 'string' });
   *
   * @param  {domino.property} specs The specifications of the property.
   * @return {*}                     Returns this.
   *
   * Variant 2:
   * **********
   * > _registerProperty('myProperty', { type: 'string' });
   *
   * @param  {string}             id    The id of the property.
   * @param  {domino.property(*)} specs The specs of the property (does not
   *                                    require an id).
   * @return {*}                        Returns this.
   *
   * Variant 3:
   * **********
   * > _registerProperty('myProperty');
   *
   * @param  {string} id The id of the property.
   * @return {*}         Returns this.
   */
  function _registerProperty(specs) {
    // Actually try to register the property:
    if (arguments.length === 1) {
      if (types.check(specs, 'string'))
        return _registerProperty.call(_self, { id: specs });

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
          fullSpecs;

      specs = arguments[1];

      if (typeof specs === 'string')
        fullSpecs = {
          id: id,
          type: specs
        };
      else if (types.check(specs, 'object')) {
        fullSpecs = helpers.clone(specs);
        fullSpecs.id = id;
      } else
        _self.die('Wrong type.');

      return _registerProperty.call(_self, fullSpecs);
    }

    return this;
  }


  /**
   * This function is an helper for registering one or several properties at the
   * same time.
   *
   * Variant 1:
   * **********
   * > _registerProperties({
   * >   myProp1: { type: 'string' },
   * >   myProp2: { type: 'string' }
   * > });
   *
   * @param  {Object} props An object with properties IDs as keys, and the
   *                        related specs as values.
   * @return {*}            Returns this.
   *
   * Variant 2:
   * **********
   * > _registerProperties([
   * >   { id: 'myProp1', type: 'string' },
   * >   { id: 'myProp2' },
   * >   'myProp3'
   * > ]);
   *
   * @param  {[domino.property|string]} props An array of the specs of the
   *                                          properties to register.
   * @return {*}                              Returns this.
   *
   * Other variants:
   * ***************
   * Any of the _registerProperty signatures work as well here:
   * > _registerProperties({ id: 'myProperty', type: 'string' });
   * > _registerProperties('myProperty', { type: 'string' });
   * > _registerProperties('myProperty');
   */
  function _registerProperties(specs) {
    var i,
        l,
        k,
        id;

    if (arguments.length === 1) {
      if (types.check(specs, 'domino.property|string'))
        _registerProperty.call(_self, specs);
      else if (types.check(specs, 'array'))
        for (i = 0, l = specs.length; i < l; i++)
          _registerProperty.call(_self, specs[i]);
      else if (types.check(specs, 'object'))
        for (k in specs)
          _registerProperty.call(_self, k, specs[k]);

    } else
      _registerProperty.apply(_self, arguments);

    return this;
  }


  /**
   * This function registers one facet into the controller. Check the
   * "domino.facet" custom type to know more about the optional parameters.
   *
   * Variant 1:
   * **********
   * > _registerFacet({ id: 'myFacet', get: function() { return 42; } });
   *
   * @param  {domino.facet} specs The specifications of the facet.
   * @return {*}                  Returns this.
   *
   * Variant 2:
   * **********
   * > _registerFacet('myFacet', { get: function() { return 42; } });
   *
   * @param  {string}          id    The id of the facet.
   * @param  {domino.facet(*)} specs The specs of the facet (does not require an
   *                                 id).
   * @return {*}                     Returns this.
   *
   * Variant 3:
   * **********
   * > _registerFacet('myFacet', function() { return 42; });
   *
   * @param  {string}   id  The id of the facet.
   * @param  {function} get The getter of the facet.
   * @return {*}            Returns this.
   */
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
      else if (types.check(specs, 'object')) {
        fullSpecs = helpers.clone(specs);
        fullSpecs.id = id;
      } else
        _self.die('Wrong type.');

      return _registerFacet.call(_self, fullSpecs);
    }

    return this;
  }


  /**
   * This function is an helper for registering one or several facets at the
   * same time.
   *
   * Variant 1:
   * **********
   * > _registerFacets({
   * >   myFacet1: { get: function() { return 42; } },
   * >   myFacet2: function() { return 123; }
   * > });
   *
   * @param  {Object} facets An object with facets IDs as keys, and the related
   *                         specs or getters as values.
   * @return {*}             Returns this.
   *
   * Variant 2:
   * **********
   * > _registerFacets([
   * >   { id: 'myFacet1', get: function() { return 42; } },
   * >   { id: 'myFacet2', get: function() { return 123; } }
   * > ]);
   *
   * @param  {[domino.facet]} facets An array of the specs of the facets to
   *                                 register.
   * @return {*}                     Returns this.
   *
   * Other variants:
   * ***************
   * Any of the _registerFacet signatures work as well here:
   * > _registerFacets({ id: 'myFacet', get: function() { return 42; } });
   * > _registerFacets('myFacet', { get: function() { return 42; } });
   * > _registerFacets('myFacet', function() { return 42; });
   */
  function _registerFacets(specs) {
    var i,
        l,
        k,
        id;

    if (arguments.length === 1) {
      if (types.check(specs, 'domino.facet'))
        _registerFacet.call(_self, specs);
      else if (types.check(specs, 'array'))
        for (i = 0, l = specs.length; i < l; i++)
          _registerFacet.call(_self, specs[i]);
      else if (types.check(specs, 'object'))
        for (k in specs)
          _registerFacet.call(_self, k, specs[k]);

    } else
      _registerFacet.apply(_self, arguments);

    return this;
  }


  /**
   * This function registers one service into the controller. Check the
   * "domino.service" custom type to know more about the optional parameters.
   *
   * Variant 1:
   * **********
   * > _registerService({
   * >   id: 'getUser',
   * >   url: '/api/user/:id',
   * >   error: function(xhr, m, error) { throw; } },
   * >   success: function(data) { return 42; } },
   * > });
   *
   * @param  {domino.service} specs The specifications of the service.
   * @return {*}                    Returns this.
   *
   * Variant 2:
   * **********
   * > _registerService('myService', myServiceSpecs);
   *
   * @param  {string}            id    The id of the service.
   * @param  {domino.service(*)} specs The specs of the service (does not
   *                                   require an id).
   * @return {*}                       Returns this.
   */
  function _registerService(specs) {
    // Actually try to register the service:
    if (arguments.length === 1) {
      if (!types.check(specs, 'domino.service'))
        _self.die('Wrong type.');

      if (_properties[specs.id])
        _self.die('A property named "' + specs.id + '" already exists.');
      if (_services[specs.id])
        _self.die('The service "' + specs.id + '" already exists.');
      _services[specs.id] = helpers.clone(specs);

    // Refactor arguments, recall the function:
    } else if (arguments.length === 2) {
      var id = specs,
          fullSpecs;

      specs = arguments[1];

      if (typeof specs === 'object') {
        fullSpecs = helpers.clone(specs);
        fullSpecs.id = id;
      } else
        _self.die('Wrong type.');

      return _registerService.call(_self, fullSpecs);
    }

    return this;
  }


  /**
   * This function is an helper for registering one or several services at the
   * same time.
   *
   * Variant 1:
   * **********
   * > _registerServices({
   * >   myService1: myServiceSpecs1,
   * >   myService2: myServiceSpecs2
   * > });
   *
   * @param  {Object} services An object with services IDs as keys, and the
   *                           related specs. IDs are not required in specs.
   * @return {*}               Returns this.
   *
   * Variant 2:
   * **********
   * > _registerServices([
   * >   myServiceSpecs1,
   * >   myServiceSpecs2
   * > ]);
   *
   * @param  {[domino.services]} services An array of the specs of the services
   *                                      to register.
   * @return {*}                          Returns this.
   *
   * Other variants:
   * ***************
   * Any of the _registerService signatures work as well here:
   * > _registerServices(myServiceSpec);
   * > _registerServices('myService', myServiceSpecWithoutID);
   */
  function _registerServices(specs) {
    var i,
        l,
        k,
        id;

    if (arguments.length === 1) {
      if (types.check(specs, 'domino.service'))
        _registerService.call(_self, specs);
      else if (types.check(specs, 'array'))
        for (i = 0, l = specs.length; i < l; i++)
          _registerService.call(_self, specs[i]);
      else if (types.check(specs, 'object'))
        for (k in specs)
          _registerService.call(_self, k, specs[k]);

    } else
      _registerService.apply(_self, arguments);

    return this;
  }




  /**
   * ******************
   * DATA MANIPULATION:
   * ******************
   */

  /**
   * This method updates the value associated to a property.
   *
   * If this method is called with a property name that do not exist or if the
   * value does not match the property's type (according to typology), an error
   * will be thrown.
   *
   * Example:
   * ********
   * > _updateProperty('myProp', myValue);
   *
   * @param  {string} propName The property name.
   * @param  {*}      value    The value.
   * @return {*}               Returns this.
   */
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

    return this;
  }


  /**
   * This method returns the values of one or more properties, shaped as a
   * single value, in an array or in an object.
   *
   * If this method is called with property names that do not exist, errors will
   * be thrown.
   *
   * Variant 1:
   * **********
   * > _getValue('myProp'); // returns the value of "myProp"
   *
   * @param  {string} propName The property name.
   * @return {*}               Returns the related value.
   *
   * Variant 2:
   * **********
   * > _getValue(['prop1', 'prop2']);
   * > // returns the values of "prop1" and "prop2" in an array in that order
   *
   * @param  {array} propNames The property names in an array.
   * @return {array}           Returns the related values in an array, sorted as
   *                           in the input.
   *
   * Variant 3:
   * **********
   * > _getValue('prop1', 'prop2');
   * > // returns the values of "prop1" and "prop2" in an object, associated to
   * > // the related names: { prop1: value1, prop2: value2 }
   *
   * @param  {*}      propNames The property names in an array.
   * @return {object}           Returns the related values in an object, with
   *                            the related property names as keys.
   */
  function _getValue(propName) {
    var i,
        l,
        a,
        result;

    if (arguments.length === 1) {
      // Most basic use case:
      if (typeof propName === 'string') {
        if (!types.check(propName, 'domino.name'))
          _self.die('Invalid property name.');

        if (_properties[propName])
          return _properties[propName].value;
        else if (_facets[propName])
          return _facets[propName].get.call(_self);
        else
          _self.die('The property "' + propName + '" does not exist.');

      // Return an array of results:
      } else if (types.check(propName, 'array')) {
        a = propName;
        result = [];

        for (i = 0, l = a.length; i < l; i++)
          result.push(_getValue(a[i]));

        return result;

      // Invalid use cases:
      } else
        _self.die('Wrong arguments.');

    // Return an object of results:
    } else {
      a = arguments;
      result = {};

      for (i = 0, l = a.length; i < l; i++)
        result[a[i]] = _getValue(a[i]);

      return result;
    }
  }




  /**
   * **************
   * AJAX SERVICES:
   * **************
   */

  /**
   * This method will make an Ajax call through a previously registered service.
   * It is possible to override any parameter given to the service definition
   * through a specs object, or to add any other option.
   *
   * Parameter solving:
   * ******************
   * Also, if the setting "paramSolver" is a regular expression, the references
   * to registered properties and facets in the URL or the data object will be
   * replaced by the related values.
   *
   * For instance, with the default value, if the property "projectId" is
   * registered and has the value 123456 the URL "/api/:projectId" will be
   * replaced by "/api/123456" before the Ajax call is sent.
   *
   * Variant 1:
   * **********
   * > _requestService('myService');
   * > _requestService('myService', { data: myData });
   *
   * @param  {string}  id    The service id.
   * @param  {?object} specs The specifications of the request (without ID).
   * @return {djxhr}         Returns the Djax modified XHR object.
   *
   * Variant 2:
   * **********
   * > _requestService({
   * >   id: 'myService',
   * >   success: function(data) { console.log(data); }
   * > });
   *
   * @param  {object} specs The specifications of the request (with ID).
   * @return {djxhr}        Returns the Djax modified XHR object.
   *
   * Variant 3:
   * **********
   * > _requestService('myService', function(data) { console.log(data); });
   *
   * @param  {string}   id      The service id.
   * @param  {function} success The success callback.
   * @return {djxhr}            Returns the Djax modified XHR object.
   */
  function _requestService(id, specs) {
    if (arguments.length === 1) {
      if (types.check(id, 'string'))
        specs = {};
      else if (types.check(id, 'object')) {
        specs = id;
        id = specs.id;
        specs.id = undefined;
      }
    } else if (arguments.length === 2) {
      if (!types.check(id, 'string'))
        _self.die('Wrong arguments');

      if (types.check(specs, 'function'))
        specs = { success: specs };
      else if (!types.check(specs, 'object'))
        _self.die('Wrong arguments');
    }

    if (!_services[id])
      _self.die('The service "' + id + '" does not exist.');

    // Merge service definition and request specs:
    var ajaxSpecs = helpers.extend(specs, _services[id]);
    ajaxSpecs.success = helpers.concat(_services[id].success, specs.success);
    ajaxSpecs.error = helpers.concat(_services[id].error, specs.error);

    // Resolve URL and data:
    var execRes,
        solveFromSpecs = _self.settings('solveFromSpecs'),
        solver = _self.settings('paramSolver');

    if (solver) {
      // Resolve URL:
      while ((execRes = solver.exec(ajaxSpecs.url)))
        if (_properties[execRes[1]] || _facets[execRes[1]])
          ajaxSpecs.url = ajaxSpecs.url.replace(
            execRes[0],
            _getValue(execRes[1]).toString()
          );
        else if (solveFromSpecs && ajaxSpecs[execRes[1]])
          ajaxSpecs.url = ajaxSpecs.url.replace(
            execRes[0],
            ajaxSpecs[execRes[1]]
          );

      // Resolve data:
      ajaxSpecs.data = helpers.browse(
        ajaxSpecs.data,
        function(scalar) {
          if (
            typeof scalar === 'string' &&
            (execRes = solver.exec(scalar)) &&
            execRes[0] === scalar // Check only strings that entirely matched
          ) {
            if (_properties[execRes[1]] || _facets[execRes[1]])
              return _getValue(execRes[1]);
            else if (solveFromSpecs && ajaxSpecs[execRes[1]])
              return ajaxSpecs[execRes[1]];
          }

          return scalar;
        }
      );
    }

    // Hijack successes and errors that have already been added, to make them
    // being executed in the scope of the controller:
    ajaxSpecs.success = helpers.bind(ajaxSpecs.success, _self);
    ajaxSpecs.error = helpers.bind(ajaxSpecs.error, _self);

    // Launch Ajax call:
    var xhr = domino.ajax(ajaxSpecs);

    // Hijack this object, to make the promise methods bind functions to the
    // controller before giving them to ajax:
    function _hijack(fnName, target) {
      // Copy original method:
      var originalName = '__' + fnName + '__';
      target[originalName] = target[fnName];
      target[fnName] = function() {
        var i,
            l = arguments.length,
            newArguments = [];

        for (i = 0; i < l; i++) {
          if (
            types.check(arguments[i], 'function') ||
            types.check(arguments[i], ['function'])
          )
            newArguments.push(helpers.bind(arguments[i], _self));
          else
            newArguments.push(arguments[i]);
        }

        this[originalName].apply(this, newArguments);
      };
    }
    _hijack('done', xhr);
    _hijack('fail', xhr);
    _hijack('then', xhr);

    return xhr;
  }




  /**
   * ********************
   * PUBLIC DECLARATIONS:
   * ********************
   */
  this.register = _register;
  this.registerFacet = _registerFacet;
  this.registerFacets = _registerFacets;
  this.registerService = _registerService;
  this.registerServices = _registerServices;
  this.registerProperty = _registerProperty;
  this.registerProperties = _registerProperties;
  this.update = _orderUpdateProperty;
  this.request = _requestService;
  this.get = _getValue;
  this.mixin = _mixin;

  // Open binders to public:
  this.binder = function() {
    return _emitter.binder.apply(_emitter, arguments);
  };

  // Adapt emitter's API:
  this.on = function(o) {
    if (arguments.length === 1 && types.check(o, 'object')) {
      for (var k in o)
        o[k] = helpers.bind(o[k], _self);
      _emitter.on.call(_emitter, o);
    } else
      _emitter.on.call(_emitter, helpers.bind(arguments, _self));

    return this;
  };
  this.off = function(o) {
    if (arguments.length === 1 && types.check(o, 'object')) {
      for (var k in o)
        o[k] = helpers.bind(o[k], _self);
      _emitter.off.call(_emitter, o);
    } else
      _emitter.off.call(_emitter, helpers.bind(arguments, _self));

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

  // Settings method:
  this.settings = function(a1, a2) {
    if (typeof a1 === 'string' && arguments.length === 1)
      return (_settings[a1] !== undefined && _settings[a1] !== null) ?
        _settings[a1] :
        defaultSettings[a1];
    else {
      var o = (typeof a1 === 'object' && arguments.length === 1) ?
        a1 || {} :
        {};

      if (typeof a1 === 'string')
        o[a1] = a2;

      for (var k in o)
        _settings[k] = o[k];

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
    throw new Error(_self.settings('errorMessage') || '');
  };

  // Kill method:
  this.kill = function() {
    var k;

    // Clear various variables and references:
    _self = null;
    _stackFuture = null;
    _stackCurrents = null;
    _timeout = null;
    _executionLock = null;
    _facets = null;
    _properties = null;
    _services = null;

    // Kill emitter:
    _emitter.off();
    _emitter = null;

    // Destroy methods references:
    for (k in this)
      if (this.hasOwnProperty(k))
        this.k = null;

    // Delete instance reference:
    _instances[this.name] = null;
  };
};




/**
 * ***************************
 * GLOBAL PUBLIC DECLARATIONS:
 * ***************************
 */
domino.ajax = ajax;
domino.types = types;
domino.helpers = helpers;
domino.emitter = emitter;
domino.settings = defaultSettings;
domino.instances = function(name) {
  if (arguments.length)
    return _instances[name];
  else
    return helpers.clone(_instances);
};




/**
 * *******
 * EXPORT:
 * *******
 */
module.exports = domino;
