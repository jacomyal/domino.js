/**
 * domino.js is a JavaScript cascading controller for quick interaction
 * prototyping.
 *
 * Version: 1.3.8
 * Sources: http://github.com/jacomyal/domino.js
 * Doc:     http://dominojs.org
 *
 * License:
 * --------
 * Copyright © 2012 Alexis Jacomy, Linkfluence - http://dominojs.org
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * The Software is provided "as is", without warranty of any kind, express or
 * implied, including but not limited to the warranties of merchantability,
 * fitness for a particular purpose and noninfringement. In no event shall the
 * authors or copyright holders be liable for any claim, damages or other
 * liability, whether in an action of contract, tort or otherwise, arising
 * from, out of or in connection with the software or the use or other dealings
 * in the Software.
 */
;(function(undefined) {
  'use strict';

  // This RegExp determines which property names are valid or not:
  var _validPropertyName = /^[a-zA-Z_$-][a-zA-Z_$0-9-]*$/;

  // This Date is used when displayTime is true, to compute the difference:
  var _startTime = new Date();

  // Here is an object containing a reference to any named unkilled instance:
  var _instances = {};

  // Establish the _root object, `window` in the browser, or `global` on the
  // server.
  var _root = this;

  // Check domino.js existance:
  if (_root.domino)
    throw new Error('domino already exists');

  /**
   * The constructor of any domino.js instance.
   *
   * @constructor
   * @extends {domino.EventDispatcher}
   * @this {domino}
   */
  var domino = function() {
    // Inheritance:
    (function() {
      dispatcher.call(this);
      for (var k in dispatcher.prototype)
        this[k] = dispatcher.prototype[k];
    }).call(this);

    // Misc:
    var _self = this,
        _utils = domino.utils,
        _struct = domino.struct,
        _localSettings = {},
        _reference;

    // Properties management:
    var _config,
        _types = {},
        _labels = {},
        _events = {},
        _getters = {},
        _setters = {},
        _statics = {},
        _properties = {},
        _propertyParameters = {},
        _overriddenGetters = {},
        _overriddenSetters = {};

    // Modules:
    var _modules = [],
        _referencedModules = {};

    // Descriptions (for the "help()" method):
    //   (hacks descriptions are managed through ascending events, in
    //    _hackAscDescription and _hackDescDescription)
    var _descriptions = {
      properties: {},
      shortcuts: {},
      services: {}
    };

    // Incremental loops id:
    var _loopId = 0;

    // Communication management:
    var _ascending = {},
        _descending = {},
        _eventListeners = {},
        _propertyListeners = {};

    // Hacks management:
    var _hackMethods = {},
        _hackDispatch = {},
        _hackDescription = [],
        _hackAscDescription = {},
        _hackDescDescription = {};

    // AJAX management:
    var _services = {},
        _currentCalls = {},
        _shortcuts = {};

    // Set protected property names:
    var _protectedNames = {
      events: 1,
      services: 1,
      hacks: 1
    };

    (function() {
      var k;
      for (k in Object.prototype)
        _protectedNames[k] = 1;
      for (k in _getScope({full: true}))
        _protectedNames[k] = 1;
    })();

    // Initialization:
    _reference = _getScope({ full: true });

    var _o = {},
        _name;

    if (_struct.get(arguments[0]) === 'string') {
      _o = arguments[1];
      _o['name'] = arguments[0];
    } else if (
      arguments[0] !== undefined &&
      _struct.get(arguments[0]) === 'object'
    )
      _o = arguments[0];
    else if (
      arguments[1] !== undefined &&
      _struct.get(arguments[1]) === 'object'
    )
      _o = arguments[1];

    _o['name'] = _name || _o['name'];
    _name = _o['name'];

    if (_name) {
      // Check if there is already an instance with the same name running:
      if (_instances[_name])
        _die('An instance named "' + _name + '" is already running.');
      else
        _instances[_name] = _reference;
    }

    (function() {
      var i;

      if (_struct.get(_o.properties) === 'array')
        for (i in _o.properties)
          _addProperty(_o.properties[i].id, _o.properties[i]);
      else if (_struct.get(_o.properties) === 'object')
        for (i in _o.properties)
          _addProperty(i, _o.properties[i]);

      for (i in _o.hacks || [])
        _addHack(_o.hacks[i]);

      if (_struct.get(_o.services) === 'array')
        for (i in _o.services)
          _addService(_o.services[i].id, _o.services[i]);
      else if (_struct.get(_o.services) === 'object')
        for (i in _o.services)
          _addService(i, _o.services[i]);

      if (_struct.get(_o.shortcuts) === 'array')
        for (i in _o.shortcuts)
          _addShortcut(_o.shortcuts[i].id, _o.shortcuts[i]);
      else if (_struct.get(_o.shortcuts) === 'object')
        for (i in _o.shortcuts)
          _addShortcut(i, _o.shortcuts[i]);
    })();

    _config = _utils.clone(_o);

    /**
     * Generates a "view" of the instance of domino, ie a new object containing
     * references to some methods of the instance. This makes the data and
     * methods manipulation way safer.
     *
     * @param  {?object} options The options that determine which scope to
     *                           return.
     *
     * @return {object} Returns the scope.
     *
     * Here is the list of options that are interpreted:
     *
     *   {?boolean} full          If true, then the full scope will be returned
     *   {?boolean} request       If true, then the scope will be able to use
     *                            the "request" method
     *   {?boolean} dispatchEvent If true, then the scope will be able to use
     *                            the "dispatchEvent" method
     */
    function _getScope(options) {
      var o = options || {},
          scope = {
            // Methods
            getEvents: _getEvents,
            getLabel: _getLabel,
            expand: _expand,
            warn: _warn,
            log: _log,
            die: _die,
            get: _get,
            abortCall: _abortCall
          };

      // Here, we give to the scope direct possibility to activate domino
      // features. This scope is basically the "public view" of the domino
      // instance:
      if (o.full) {
        scope.help = _help;
        scope.kill = _kill;
        scope.update = _update;
        scope.request = _request;
        scope.settings = _settings;
        scope.modules = _getModule;
        scope.addModule = _addModule;
        scope.killModule = _killModule;
        scope.getEvent = function() {
          _self.getEvent.apply(_self, arguments);
        };
        scope.addEventListener = function() {
          _self.addEventListener.apply(_self, arguments);
        };
        scope.removeEventListener = function() {
          _self.removeEventListener.apply(_self, arguments);
        };
        scope.configuration = _configuration;
        scope.dispatchEvent = function(type, data) {
          var a = _utils.array(type),
              i,
              l,
              events = [];

          for (i = 0, l = a.length; i < l; i++)
            events.push(_self.getEvent(a[i], data));

          _mainLoop({
            events: events
          });

          return this;
        };

      // But here, request() and dispatchEvent() will be "fake" functions: They
      // will store instruction that will be evaluated by domino after the
      // execution of the function that will use the scope:
      } else {
        if (o.request) {
          Object.defineProperty(scope, '_services', {
            value: []
          });

          scope.request = function(p1, p2) {
            var i,
                o;

            if (_struct.check('string', p1)) {
              o = {
                service: p1
              };

              for (i in p2 || {})
                o[i] = p2[i];

              this._services.push(o);
            } else if (_struct.check('object', p1)) {
              this._services.push(p1);
            } else if (_struct.check('array', p1)) {
              o = {
                services: p1
              };

              if (_struct.check('object', p2))
                for (i in p2)
                  o[i] = p2[i];

              this._services.push(o);
            }

            return this;
          };
        }

        if (o.dispatchEvent) {
          Object.defineProperty(scope, '_events', {
            value: []
          });

          scope.dispatchEvent = function(type, data) {
            var a = _utils.array(type),
                i,
                l,
                events = [];

            for (i = 0, l = a.length; i < l; i++)
              this._events.push(_self.getEvent(a[i], data));

            return this;
          };
        }

        if (o.update) {
          Object.defineProperty(scope, '_properties', {
            value: []
          });

          scope.update = function(v1, v2) {
            if (typeof v1 === 'object')
              for (var k in v1)
                this._properties.push({
                  property: k,
                  value: v1[k]
                });
            else if (typeof v1 === 'string' && arguments.length > 1)
              this._properties.push({
                property: v1,
                value: v2
              });

            return this;
          };
        }
      }

      return scope;
    }

    /**
     * Replaces the pseudo-methods in the scope by errors, since they are no
     * longer useful.
     * @param  {Object} scope The scope the disable.
     */
    function _disableScope(scope) {
      if (scope.request !== undefined)
        scope.request = function() {
          _die('This method is no longer available.');
          return this;
        };

      if (scope.dispatchEvent !== undefined)
        scope.dispatchEvent = function() {
          _die('This method is no longer available.');
          return this;
        };

      if (scope.update !== undefined)
        scope.update = function() {
          _die('This method is no longer available.');
          return this;
        };
    }

    /**
     * References a new property, generated the setter and getter if not
     * specified, and binds the events.
     *
     * @param   {string}  id     The id of the property.
     * @param   {?Object} options An object containing some more precise
     *                            indications about the hack.
     *
     * @return {domino} Returns the domino instance itself.
     *
     * Here is the list of options that are recognized:
     *
     *   {?string}          label    The label of the property (the ID by
     *                               default)
     *   {?(string|object)} type     Indicated the type of the property. It has
     *                               to be a valid "structure".
     *   {?function}        setter   Overrides the default property setter.
     *   {?function}        getter   Overrides the default property getter.
     *   {?*}               value    The initial value of the property. Will be
     *                               set with the new setter if specified.
     *   {?(string|array)}  triggers The list of events that can modify the
     *                               property. Can be an array or the list of
     *                               events separated by spaces.
     *   {?(string|array)}  dispatch The list of events that must be triggered
     *                               after modification of the property. Can be
     *                               an array or the list of events separated
     *                               by spaces.
     */
    function _addProperty(id, options) {
      var i, k,
          o = options || {};

      // Check errors:
      if (id === undefined)
        _die('Property name not specified');

      if (_struct.get(id) !== 'string')
        _die('The property name must be a string');

      if (_properties[id] !== undefined)
        _die('Property "' + id + '" already exists');

      if (_protectedNames[id] !== undefined)
        _die('"' + id + '" can not be used to name a property');

      if (!id.match(_validPropertyName))
        _die('Property name not valid (' + _validPropertyName + ')');

      // Every parameters are stored here:
      _propertyParameters[id] = {};

      for (k in o)
        _propertyParameters[id][k] = o[k];

      // Label:
      _labels[id] = o['label'] || id;

      // Description:
      if (o['description'])
        _descriptions.properties[id] = o['description'];

      // Type:
      if (o['type'] !== undefined)
        if (!_struct.isValid(o['type']))
          _warn(
            'Property "' + id + '": Type not valid'
          );
        else
          _types[id] = o['type'];

      // Setter:
      if (o['setter'] !== undefined)
        if (_struct.get(o['setter']) !== 'function')
          _warn(
            'Property "' + id + '": Setter is not a function'
          );
        else {
          _setters[id] = o['setter'];
          _overriddenSetters[id] = true;
        }

      _setters[id] = _setters[id] || function(v) {
        if (
          _struct.deepScalar(_types[id]) &&
          _struct.compare(v, _properties[id], _types[id])
        )
          return false;

        if (_types[id] && !_struct.check(_types[id], v)) {
          _warn(
            'Property "' + id + '": Wrong type error'
          );
        } else
          _properties[id] = v;

        return true;
      };

      // Getter:
      if (o['getter'] !== undefined)
        if (_struct.get(o['getter']) !== 'function')
          _warn(
            'Property "' + id + '": Getter is not a function'
          );
        else {
          _getters[id] = o['getter'];
          _overriddenGetters[id] = true;
        }

      _getters[id] = _getters[id] || function() {
        return _properties[id];
      };

      // Initial value:
      if (o['value'] !== undefined || _types[id])
        o['value'] !== undefined ?
          _set(id, o['value']) :
          _log(
            'Property "' + id + '": ' +
              'Initial value is missing'
          );

      // Triggers (modules-to-domino events):
      if (o['triggers'] !== undefined) {
        !_struct.check('array|string', o['triggers']) &&
          _warn(
            'Property "' + id + '": ' +
              'Events ("triggers") must be specified in an array or ' +
              'separated by spaces in a string'
          );

        _events[id] = _utils.array(o['triggers']);
        for (i in _events[id] || []) {
          _ascending[_events[id][i]] = _ascending[_events[id][i]] || [];
          _ascending[_events[id][i]].push(id);
        }
      }

      // Dispatched events (domino-to-modules event):
      if (o['dispatch'] !== undefined)
        !_struct.check('array|string', o['dispatch']) ?
          _warn(
            'Property "' + id + '": ' +
              'Events ("dispatch") must be specified in an array or ' +
              'separated by spaces in a string'
          ) :
          (_descending[id] = _utils.array(o['dispatch']));

      return _self;
    }

    /**
     * Binds a new hack. Basically, hacks make possible to explicitely
     * trigger actions and events on specified events.
     *
     * @param   {?Object} options An object containing some more precise
     *                            indications about the hack.
     *
     * @return {domino} Returns the domino instance itself.
     *
     * Here is the list of options that are interpreted:
     *
     *   {(array|string)}  triggers    The list of events that can trigger the
     *                                 hack. Can be an array or the list of
     *                                 events separated by spaces.
     *   {?(array|string)} dispatch    The list of events that will be
     *                                 triggered after actionning the hack. Can
     *                                 be an array or the list of events
     *                                 separated by spaces.
     *   {?function}       method      A method to execute after receiving a
     *                                 trigger and before dispatching the
     *                                 specified events.
     *   {?string}         description A string describing what the hack does.
     *                                 It will be logged everytime the hack is
     *                                 triggered.
     */
    function _addHack(options) {
      var a, i,
          o = options || {};

      // Errors:
      if (o['triggers'] === undefined)
        _die(
          'A hack requires at least one trigger to be bound'
        );

      if (o['description'])
        _hackDescription.push(o['description']);

      a = _utils.array(o['triggers']);
      for (i in a) {
        _hackAscDescription[a[i]] = _hackAscDescription[a[i]] || [];
        _hackDispatch[a[i]] = _hackDispatch[a[i]] || [];
        _hackMethods[a[i]] = _hackMethods[a[i]] || [];

        // Descriptions to log:
        if (o['description'])
          _hackAscDescription[a[i]] = _hackAscDescription[a[i]].concat(
            o['description']
          );

        // Method to execute:
        if (o['method'])
          _hackMethods[a[i]].push(o['method']);

        // Events to dispatch:
        if (o['dispatch'])
          _hackDispatch[a[i]] = _hackDispatch[a[i]].concat(
            _utils.array(o['dispatch'])
          );
      }

      a = _utils.array(o['dispatch']);
      for (i in a) {
        _hackDescDescription[a[i]] = _hackDescDescription[a[i]] || [];

        if (o['description'])
          _hackDescDescription[a[i]] = _hackDescDescription[a[i]].concat(
            o['description']
          );
      }

      return _self;
    }

    /**
     * References a new service, ie an helper to easily interact between your
     * server and your properties. This service will take itself as parameter
     * an object, whose most keys can override the default described bellow.
     *
     * @param {string}  id      The unique id of the service, used to specify
     *                          which service to call.
     * @param {?Object} options An object containing some more precise
     *                          indications about the service.
     *
     * @return {domino} Returns the domino instance itself.
     *
     * Here is the list of options that are interpreted:
     *
     *   {string|function} url          The URL of the service. If a string,
     *                                  then any shortcut in it will be
     *                                  resolved. If a function, will be
     *                                  executed with the second argument given
     *                                  to request, and the returned string
     *                                  will also be resolved before the call.
     *   {?string}         contentType+ The AJAX query content-type
     *   {?string}         dataType+    The AJAX query data-type
     *   {?string}         type+        The AJAX call type (GET|POST|DELETE)
     *   {?(*|function)}   data+*       The data sent in the AJAX call. Can be
     *                                  either an object or a function (in
     *                                  which case it will be evaluated with
     *                                  the "light" scope). Then, the object
     *                                  will be parsed, and shortcuts can be
     *                                  used in the first depth of the object.
     *   {?function}       error+       A function to execute if AJAX failed.
     *   {?function}       before+      A function to execute before calling
     *                                  AJAX.
     *   {?function}       success+     A function to execute if AJAX
     *                                  successed.
     *   {?function}       expect+      A function to execute before the
     *                                  success. If returns true, the "success"
     *                                  callback will be triggered. Else, the
     *                                  "error" callback will be triggered.
     *                                  This value can be set as well from the
     *                                  instance settings or the global
     *                                  settings.
     *                                  This function takes as arguments the
     *                                  data returned by the service, the input
     *                                  object and the service configuration.
     *   {?string}         setter+*     The name of a property. If the setter
     *                                  exists, then it will be called with the
     *                                  received data as parameter, or the
     *                                  value corresponding to the path, if
     *                                  specified.
     *   {?(string|array)} path+*       Indicates the path of the data to give
     *                                  to the setter, if specified.
     *                                  (Example: "a.b.c")
     *   {?(string|array)} events++     The events to dispatch in case of
     *                                  success
     *
     * The properties followed by + are overridable when the service is called.
     * The properties followed by ++ are cumulative when the service is called.
     * The properties followed by "*" accept shortcut values.
     */
    function _addService(id, options) {
      var o = options || {};

      // Errors:
      if (_struct.get(id) !== 'string')
        _die(
          'The service id is not specified.'
        );

      if (!_struct.check('function|string', o['url']))
        _die(
          'The service URL is not valid.'
        );

      if (_services[id] !== undefined)
        _die(
          'The service "' + id + '" already exists.'
        );

      // Description:
      if (o['description'])
        _descriptions.services[id] = o['description'];

      _services[id] = function(params) {
        _log('Calling service "' + id + '".');

        var p = params || {},
            shortcuts = p['shortcuts'] || {},
            ajaxObj = {
              contentType: p['contentType'] || o['contentType'],
              dataType: p['dataType'] || o['dataType'],
              type: (p['type'] || o['type'] || 'GET').toString().toUpperCase(),
              data: p['data'] !== undefined ?
                      p['data'] :
                      _struct.get(o['data']) === 'function' ?
                        o['data'].call(_getScope(), p) :
                        o['data'],
              url: _struct.get(o['url']) === 'function' ?
                     o['url'].call(_getScope(), p) :
                     o['url'],
              error: function(mes, xhr) {
                _self.dispatchEvent('domino.ajaxFailed');
                var error = p['error'] || o['error'],
                    a, k, property;

                _log(
                  'Loading service "' + id + '" ' +
                  'failed with message "' + mes + '" ' +
                  'and status ' + xhr.status + '.'
                );
                if (_struct.get(error) === 'function') {
                  _execute(error, {
                    parameters: [mes, xhr, p],
                    loop: p['loop'] || _mainLoop,
                    scope: {
                      request: true,
                      dispatchEvent: true,
                      update: true
                    }
                  });
                }
              }
            };

        var i, exp, k, doTest, val,
            pref = _settings('shortcutPrefix'),
            regexContains = new RegExp(pref + '(\\w+)', 'g'),
            regexFull = new RegExp('^' + pref + '(\\w+)$'),
            oldURL = null,
            matches;

        // Add keys that have not been happened yet:
        for (k in p)
          if (!(k in ajaxObj))
            ajaxObj[k] = p[k];

        for (k in o)
          if (!(k in ajaxObj))
            ajaxObj[k] = o[k];

        // Check that URL is still a string:
        if (_struct.get(ajaxObj['url']) !== 'string')
          _die(
            'The URL is no more a string (typed "' +
            _struct.get(ajaxObj['url']) +
            '")'
          );

        // Manage shortcuts in URL:
        while (
          (matches = ajaxObj['url'].match(regexContains)) &&
          ajaxObj['url'] !== oldURL
        ) {
          oldURL = ajaxObj['url'];
          for (i in matches) {
            exp = _expand(matches[i].match(regexFull)[1], shortcuts);
            ajaxObj['url'] =
              ajaxObj['url'].replace(new RegExp(matches[i], 'g'), exp);
          }
        }

        // Manage shortcuts in params:
        // (NOT DEEP - only first level)
        doTest = true;
        if (_struct.get(ajaxObj['data']) === 'string')
          if (ajaxObj['data'].match(regexFull))
            ajaxObj['data'] =
              _expand(ajaxObj['data'].match(regexFull)[1], shortcuts);

        if (_struct.get(ajaxObj['data']) === 'object')
          while (doTest) {
            doTest = false;
            for (k in ajaxObj['data'])
              if (
                _struct.get(ajaxObj['data'][k]) === 'string' &&
                ajaxObj['data'][k].match(regexFull)
              ) {
                ajaxObj['data'][k] =
                  _expand(ajaxObj['data'][k].match(regexFull)[1], shortcuts);
                doTest = true;
              }
          }

        // Success management:
        ajaxObj.success = function(data, xhr) {
          var i, a, pushEvents, event, property,
              pathArray, d,
              dispatch = {},
              services = [],
              events = [],
              update = {},
              reiterate = false,
              path = p['path'] || o['path'],
              setter = p['setter'] || o['setter'],
              success = p['success'] || o['success'],
              expect = p['expect'] || o['expect'] || _settings('expect');

          // Check "expect" test:
          if (
            _struct.get(expect) === 'function' &&
            // If expect returns "falsy", then the error callback is called
            // instead of the success:
            !expect.call(_getScope(), data, p, o)
          ) {
            _log('"expect" test failed for service "' + id + '".');
            ajaxObj.error.call(this, 'Unexpected data received.', xhr);
            return;
          }

          // Log:
          _log('Service "' + id + '" successfull.');

          // Expand different string params:
          if (
            _struct.get(setter) === 'string' &&
            setter.match(regexFull)
          )
            setter = _expand(setter.match(regexFull)[1], shortcuts);

          if (
            _struct.get(path) === 'string' &&
            path.match(regexFull)
          )
            path = _expand(path.match(regexFull)[1], shortcuts);

          // Check path:
          d = data;

          if ((path || '').match(/^(?:\w+\.)*\w+$/))
            pathArray = _struct.get(path, 'string') ?
              path.split('.') :
              undefined;
          else if (_struct.get(path) === 'string')
            _warn(
              'Path "' + path + '" does not match RegExp /^(?:\\w+\\.)*\\w+$/'
            );

          if (pathArray)
            for (i in pathArray) {
              d = d[pathArray[i]];
              if (d === undefined) {
                _warn(
                  'Wrong path "' + path + '" for service "' + id + '".'
                );
                continue;
              }
            }

          // Events to dispatch (service config):
          a = _utils.array(o['events']);
          for (i in a) {
            dispatch[a[i]] = 1;
            reiterate = true;
          }

          // Events to dispatch (call config):
          a = _utils.array(p['events']);
          for (i in a) {
            dispatch[a[i]] = 1;
            reiterate = true;
          }

          // Check setter:
          if (setter && _setters[setter]) {
            if (d !== undefined) {
              update[setter] = d;
              reiterate = true;
            }
          }

          // Check success:
          if (_struct.get(success) === 'function') {
            var obj = _execute(success, {
              parameters: [data, p],
              scope: {
                request: true,
                dispatchEvent: true,
                update: true
              }
            });

            a = _utils.array(obj['events']);
            for (k in a) {
              reiterate = true;
              dispatch[a[k].type] = a[k];
            }

            for (k in obj['update'])
              if (update[k] === undefined) {
                update[k] = obj['update'][k];
                reiterate = true;
              } else
                _warn(
                  'The key ' +
                  '"' + k + '"' +
                  ' is nor a method neither a property.'
                );

            if ((obj['services'] || []).length) {
              reiterate = true;
              services = services.concat(obj['services']);
            }

            _disableScope(obj);
          }

          // Check events to dispatch:
          events = [];
          for (event in dispatch) {
            events.push(
              dispatch[event] === 1 ?
                _self.getEvent(event) :
                dispatch[event]
            );
          }

          // Start looping:
          if (reiterate || p['loop'])
            (p['loop'] || _mainLoop)({
              events: events,
              update: update,
              services: services
            });
        };

        // Create:
        var before = p['before'] || o['before'];
        if (typeof before === 'function' && _struct.get(before) === 'function')
          ajaxObj.beforeSend = function(xhr) {
            return _execute(before, {
              parameters: [p, xhr],
              loop: true,
              scope: {
                dispatchEvent: true,
                update: true
              }
            }).returned;
          };

        // Abort:
        if ((('abort' in p) ? p['abort'] : o['abort']) && _currentCalls[id])
          _currentCalls[id].abort();

        // Launch AJAX call:
        _currentCalls[id] = _utils.ajax(ajaxObj);
      };

      return _self;
    }

    function _abortCall(id) {
      if (_currentCalls[id])
        _currentCalls[id].abort();
    }

    /**
     * Creates a shortcut, that can be called from different parameters in the
     * services. Basically, makes easier to insert changing values in URLs,
     * data, etc...
     *
     * Any property is already registered as shortcut (that returns then the
     * value when called), but can be overridden safely.
     *
     * @param   {string}  id      The string to use to call the shortcut.
     * @param   {?Object} options An object containing some more precise
     *                            indications about the service.
     *
     * Here is the list of options that are interpreted:
     *
     * @param   {function} method      The method to call.
     * @param   {?string}  description The description of the shortcut.
     *
     * @return {domino} Returns the domino instance itself.
     */
    function _addShortcut(id, options) {
      var o = options || {},
          fn = typeof o === 'function' ? o : o['method'],
          d = (typeof o === 'object') && ('description' in o) ?
            o['description'] :
            null;

      // Check errors:
      if (id === undefined)
        _die('Shortcut ID not specified.');

      if (_shortcuts[id])
        _die('Shortcut "' + id + '" already exists.');

      if (fn === undefined)
        _die('Shortcut method not specified.');

      // Description:
      if (d)
        _descriptions.shortcuts[id] = d;

      // Add shortcut:
      _shortcuts[id] = fn;

      return _self;
    }

    /**
     * This method will create and reference a module, and return it.
     *
     * @param   {function} klass   The module class constructor.
     * @param   {?array}   params  The array of the parameters to give to the
     *                             module constructor. The "light" scope will
     *                             always be given as the last parameter, to
     *                             make it easier to find labels or events
     *                             related to any property.
     * @param   {?object}  options An object containing some more precise
     *                             indications about the service.
     *
     * @return {*} Returns the module just created.
     */
    function _addModule(klass, params, options) {
      var i,
          module = new domino.module(),
          o = options || {},
          bind = {},
          triggers,
          property,
          events,
          event;

      // Check errors:
      if (klass === undefined)
        _die('Module class not specified.');

      if (_struct.get(klass) !== 'function')
        _die('First parameter must be a function.');

      if (('id' in o) && (o.id in _referencedModules))
        _die('The module with id "' + o.id + '" already exists.');

      // Instanciate the module:
      klass.apply(module, (params || []).concat(_getScope()));
      triggers = module.triggers || {};

      // Ascending communication:
      for (event in triggers.events || {}) {
        _eventListeners[event] = _eventListeners[event] || [];
        _eventListeners[event].push(triggers.events[event]);
      }

      for (property in triggers.properties || {}) {
        for (i in _descending[property] || []) {
          _propertyListeners[property] =
            _propertyListeners[property] || [];

          _propertyListeners[property].push(
            triggers.properties[property]
          );
        }

        if (_getters[property] !== undefined) {
          var data = {};
          data[property] = _get(property);
          _execute(triggers.properties[property], {
            parameters: [_getScope()]
          });
        }
      }

      // Descending communication:
      for (event in _ascending || {})
        bind[event] = 1;

      for (event in _hackMethods || {})
        bind[event] = 1;

      for (event in _hackDispatch || {})
        bind[event] = 1;

      for (event in _hackAscDescription || {})
        bind[event] = 1;

      for (event in bind)
        module.addEventListener(event, _triggerMainLoop);

      // Add log, warn and die in the module, if possible:
      module.log = ('id' in o) ?
        _utils.partial(_log, '[module "' + o.id + '"]') :
        _utils.partial(_log, '[module]');

      module.warn = ('id' in o) ?
        _utils.partial(_warn, '[module "' + o.id + '"]') :
        _utils.partial(_warn, '[module]');

      module.die = ('id' in o) ?
        _utils.partial(_die, '[module "' + o.id + '"]') :
        _utils.partial(_die, '[module]');

      // Finalize:
      if ('id' in o)
        _referencedModules[o.id] = module;

      _modules.push(module);
      return module;
    }

    /**
     * This method returns the module referenced by the specified id.
     * @param  {string} id The id of the requested module.
     * @return {*} Returns the module, if it exists.
     */
    function _getModule(id) {
      return _referencedModules[id];
    }

    /**
     * This method will unreference a module: It will remove ascending and
     * descending bindings, and remove the reference of the module. Although,
     * it will not remove other eventual bindings.
     *
     * @param   {*|string} module The module instance or its id.
     *
     * @return {*} Returns the module just unreferenced.
     */
    function _killModule(module) {
      var i,
          l,
          k,
          a,
          f,
          event,
          property,
          triggers,
          unbind = {};

      if (_struct.check('string', module))
        module = _referencedModules[module];

      // First, let's check that the module is referenced:
      if (_modules.indexOf(module) < 0) {
        _self.warn('The module you try to kill is actually not referenced.');
        return module;
      }

      // Now let's check if the module has a "kill" method:
      if (typeof module.kill === 'function')
        module.kill();

      // If referenced, let's remove the triggers:
      triggers = module.triggers || {};

      // Remove events bindings:
      for (event in triggers.events) {
        a = _eventListeners[event];
        f = triggers.events[event];

        // Remove the function reference:
        if (a && a.length)
          for (i = 0, l = a.length; i < l; i++)
            if (a[i] === f)
              a.splice(i, 1);

        // Unreference the event if no more bindings:
        if (a && !a.length)
          delete _eventListeners[event];
      }

      // Remove properties bindings:
      for (property in triggers.properties) {
        a = _propertyListeners[property];
        f = triggers.properties[property];

        // Remove the function reference:
        if (a && a.length)
          for (i = 0, l = a.length; i < l; i++)
            if (a[i] === f)
              a.splice(i, 1);

        // Unreference the property if no more bindings:
        if (a && !a.length)
          delete _propertyListeners[property];
      }

      // Remove ascending bindings:
      for (event in _ascending || {})
        unbind[event] = 1;

      for (event in _hackMethods || {})
        unbind[event] = 1;

      for (event in _hackDispatch || {})
        unbind[event] = 1;

      for (event in _hackAscDescription || {})
        unbind[event] = 1;

      for (event in unbind)
        module.removeEventListener(event, _triggerMainLoop);

      // Remove the module reference:
      _modules.splice(_modules.indexOf(module), 1);

      for (k in _referencedModules)
        if (_referencedModules[k] === module) {
          delete _referencedModules[k];
          break;
        }

      return module;
    }

    /**
     * A method that can update any of the properties - designed to be used
     * especially from the hacks, eventually from the services success methods.
     * For each property actually updated, the related events will be
     * dispatched through the _mainLoop method.
     *
     * Can be called with two parameters (then the first one must be the name
     * of a property), or with one (then it must be an object, and each key
     * must be the name of a property).
     */
    function _update(a1, a2) {
      var o = (typeof a1 === 'object' && arguments.length === 1) ?
        a1 || {} :
        {};
      if (typeof a1 === 'string')
        o[a1] = a2;

      _mainLoop({
        update: o
      });

      return this;
    }

    /**
     * Starts the main loop with a single event as input.
     * @param  {object} event The event.
     */
    function _triggerMainLoop(event) {
      _mainLoop({
        events: [event],
        emitter: event.target
      });
    }

    /**
     * The main loop, that is triggered either by modules, hacks or event by
     * itself, and that will update properties and dispatch events to the
     * modules, trigger hacks (and so eventually load services, for example).
     *
     * @param   {?object} options The options.
     *
     * Here is the list of options that are interpreted:
     *
     *   {?object}  update   The properties to update.
     *   {?array}   events   The events to trigger.
     *   {?array}   services The services to call.
     *   {?number}  loop     The depth of the loop.
     *   {?object}  emitter  The emitter of the original event.
     *   {?boolean} force    If true, all updated properties will dispatch the
     *                       outgoing events, even if the property has
     *                       actually not been updated.
     */
    function _mainLoop(options) {
      var a, i, j, k, e, event, data, push, property, log,
          reiterate = false,
          hacks = [],
          events = [],
          services = [],
          o = options || {},
          dispatch = {},
          update = {};

      o['loop'] = (+o['loop'] || 0) + 1;
      o['loopId'] = o['loopId'] || (++_loopId);

      // Check if maximum loop depth has been reached:
      if (_settings('maxDepth') && o['loop'] > _settings('maxDepth'))
        _die(
          'Loop ' + o['loopId'] +
          ' exceeds maximum depth (' + _settings('maxDepth') + ')'
        );

      var eventsArray = _utils.array(o['events']),
          servicesArray = _utils.array(o['services']),
          updateObject = o['update'] || {};

      // Log:
      if (_settings('verbose')) {
        _log('Iteration ' + o['loop'] + ' (loop ' + o['loopId'] + ')');

        if (eventsArray.length) {
          log = [];
          for (i in eventsArray)
            log.push(eventsArray[i].type);
          _log(' -> Events: ', log);
        }

        if (servicesArray.length) {
          log = [];
          for (i in servicesArray)
            log.push(
              typeof servicesArray[i] === 'string' ?
                servicesArray[i] :
                servicesArray[i]['service']
            );
          _log(' -> Services: ', log);
        }

        log = [];
        for (i in updateObject)
          log.push(i);

        if (log.length)
          _log(' -> Update: ', log);
      }

      // Check properties to update:
      for (property in updateObject) {
        if (_setters[property] === undefined)
            _warn('The property "' + property + '" is not referenced.');
        else {
          push =
            _set(property, updateObject[property]) ||
            o['force'] ||
            _checkPropertyParameter(property, 'force');

          if (push) {
            for (i in _propertyListeners[property])
              _execute(_propertyListeners[property][i], {
                parameters: [_getScope(), {
                  property: property,
                  emitter: o['emitter']
                }]
              });

            for (i in _descending[property] || []) {
              e = _descending[property][i];
              dispatch[e] = _self.getEvent(e);
            }
          }
        }
      }

      if (servicesArray.length) {
        // Check services to call:
        if (_settings('mergeRequests')) {
          a = [];
          for (j in servicesArray) {
            if (servicesArray[j]['services'])
              _request(servicesArray[j]['services'], servicesArray[j]);
            else
              a.push(servicesArray[j]);

            if (a.length)
              _request(a);
          }
        } else
          for (j in servicesArray) {
            if (servicesArray[j]['services'])
              _request(servicesArray[j]['services'], servicesArray[j]);
            else
              _request(servicesArray[j]);
          }
      }

      // Check events to trigger:
      for (i in eventsArray) {
        event = eventsArray[i];
        data = event.data || {};

        // Properties:
        if (data) {
          a = _ascending[event.type] || [];
          for (j in a) {
            if (data[a[j]] !== undefined) {
              reiterate = true;
              update[a[j]] = data[a[j]];
            }
          }
        }

        // Modules triggers:
        for (k in _eventListeners[event.type]) {
          _execute(_eventListeners[event.type][k], {
            parameters: [
              _getScope(),
              event,
              o['emitter']
            ]
          });
        }

        // Hacks:
        for (j in _hackMethods[event.type] || []) {
          if (hacks.indexOf(_hackMethods[event.type][j]) < 0) {
            hacks.push(_hackMethods[event.type][j]);

            var obj = _execute(_hackMethods[event.type][j], {
              parameters: [event],
              scope: {
                request: true,
                dispatchEvent: true,
                update: true
              }
            });

            a = _utils.array(obj['events']);
            for (k in a)
              dispatch[a[k].type] = a[k];

            for (k in obj['update']) {
              if (update[k] === undefined) {
                reiterate = true;
                update[k] = obj['update'][k];
              } else
                _warn(
                  'The property "' + k + '" ' +
                  'has already been updated in the current loop.'
                );
            }

            if ((obj['services'] || []).length) {
              reiterate = true;
              services = services.concat(obj['services']);
            }

            _disableScope(obj);
          }
        }

        for (j in _hackDispatch[event.type] || []) {
          e = _hackDispatch[event.type][j];
          dispatch[e] = _self.getEvent(e);
        }

        if (_settings('logDescriptions'))
          for (j in _hackAscDescription[event.type] || [])
            _log('[HACK]', _hackAscDescription[event.type][j]);
      }

      for (event in dispatch) {
        _self.dispatchEvent(event, dispatch[event].data);
        events.push(dispatch[event]);
        reiterate = true;
      }

      // Reloop:
      if (reiterate)
        _mainLoop({
          events: events,
          update: update,
          services: services,
          emitter: o['emitter'],
          loopId: o['loopId'],
          loop: o['loop']
        });
    }

    /**
     * Returns the value of a property.
     *
     * @param  {string} property The name of the property.
     *
     * @return {*} If clone mode is activated, returns a clone of the value.
     *             Else, returns a reference to the value. Also, if the getter
     *             is overridden, it will return a reference or a clone of what
     *             the setter returns.
     */
    function _get(property) {
      if (_getters[property]) {
        if (_overriddenGetters[property]) {
          var arg = [],
              inputs = {},
              res;

          for (var i = 1, l = arguments.length; i < l; i++)
            arg.push(arguments[i]);

          inputs[property] = _properties[property];

          res = _execute(_getters[property], {
            parameters: arg,
            inputValues: inputs
          });

          return _checkPropertyParameter(property, 'clone') ?
            _utils.clone(res['returned']) :
            res['returned'];
        } else
          return _checkPropertyParameter(property, 'clone') ?
            _utils.clone(_getters[property]()) :
            _getters[property]();
      } else
        _warn('Property "' + property + '" not referenced.');
    }

    /**
     * Updates a property.
     *
     * @param {string} property The name of the property.
     * @param {*}      value    The value of the property.
     *
     * @return {boolean} Returns false if domino.js knows that the new value is
     *                   not different than the old one, and true else (useful
     *                   to know if events have to be dispatched after).
     *
     */
    function _set(property, value) {
      if (_setters[property]) {
        if (_overriddenSetters[property]) {
          var updated, res,
              arg = [],
              inputs = {};

          if (_checkPropertyParameter(property, 'clone'))
            value = _utils.clone(value);

          inputs[property] = _get(property);

          for (var i = 1, l = arguments.length; i < l; i++)
            arg.push(arguments[i]);

          res = _execute(_setters[property], {
            parameters: arg,
            inputValues: inputs
          });

          updated =
            _struct.get(res['returned']) !== 'boolean' ||
            res['returned'];

          if (updated)
            _properties[property] = res['update'][property];

          return updated;
        } else
          return _setters[property].call(
            _getScope(),
            _checkPropertyParameter(property, 'clone') ?
              _utils.clone(value) :
              value
          );
      }

      _warn('Property "' + property + '" not referenced.');
      return false;
    }

    /**
     * Calls one or several services declared in the domino instance.
     *
     * This method has multiple signatures:
     *
     * Signature 1:
     * ************
     * @param  {string}  service The name of the service.
     * @param  {?object} options An object of options given to the declared
     *                           service.
     *
     * Signature 2:
     * ************
     * @param  {object}  options An object of options given to the declared
     *                           service.
     *
     * Signature 3:
     * ************
     * @param  {array}   array   An array containing objects that each describe
     *                           valid options describing a service to call. If
     *                           a string is used instead of an object, then
     *                           the related service will be called without any
     *                           option.
     * @param  {object}  options Options to deal with multiple services call.
     *
     * @return {*} Returns itself.
     *
     * Valid parameters:
     * *****************
     * Here is the list of options that are recognized to describe a service:
     *
     *   {?string}       service     The name of the service to call. Can not
     *                               be used with the first signature.
     *   {?boolean}      abort       Indicates if the last call of the
     *                               specified service has to be aborted.
     *   {?function}     before      Overrides the original service "before"
     *                               value.
     *   {?string}       contentType The contentType of the AJAX call.
     *   {?*}            data        If the original service "data" attribute
     *                               is not a function, then it will be
     *                               overridden by this "data" value.
     *   {?string}       dataType    The dataType of the AJAX call.
     *   {?function}     error       Overrides the original service "error"
     *                               value.
     *   {?array|string} events      Adds more events to dispatch when the
     *                               "success" is called.
     *   {?object}       params      The pairs (key/value) in this object will
     *                               override the shortcuts.
     *   {?string}       path        Overrides the original service "path"
     *                               value.
     *   {?string}       setter      Overrides the original service "setter"
     *                               value.
     *   {?function}     success     Overrides the original service "success"
     *                               value.
     *   {?string}       type        Overrides the AJAX call type
     *                               (GET|POST|DELETE).
     *
     * And here is the list of options for the signature 3:
     *
     *   {?boolean} merge If true, the success methods will be executed only
     *                    when all the calls are done, in the same order than
     *                    in the services options array. Also, all the success
     *                    methods will start only *one* main loop.
     *                    (true by default)
     */
    function _request(p1, p2) {
      if (_struct.check('string', p1)) {
        if (_services[p1])
          _services[p1](p2);
        else
          _warn('Service "' + p1 + '" not referenced.');
      } else if (_struct.check('object', p1)) {
        _request(p1['service'], p1);
      } else if (_struct.check('array', p1)) {
        p2 = p2 || {};

        var i,
            l = p1.length,
            merge = p2['merge'] !== undefined ?
              !!p2['merge'] :
              _settings('mergeRequests');

        // If merge is specified and falsy, then the services will just be
        // called independently:
        if (!merge) {
          for (i = 0, l = p1.length; i < l; i++) {
            _request(p1[i]);
          }

        // Else, it's more complicated: The services will be called but the
        // successes and errors will be handled when every call is endedn to
        // make possible to start only one main loop:
        } else {
          var o,
              k,
              ended = l,
              returned = [],
              conclude = function() {
                var o, i, k,
                    res = {
                      update: {},
                      events: [],
                      services: []
                    };

                for (i = 0; i < l; i++) {
                  o = returned[i] || {};

                  for (k in o.update || {})
                    res.update[k] = o.update[k];

                  res.events = res.events.concat(o.events || []);
                  res.services = res.services.concat(o.services || []);
                }

                if (p2['success'])
                  _execute(p2['success'], {
                    parameters: [returned],
                    loop: _mainLoop,
                    scope: {
                      request: true,
                      dispatchEvent: true,
                      update: true
                    }
                  });
              };

          for (i = 0; i < l; i++) {
            if (typeof p1[i] === 'string')
              o = {
                service: p1[i]
              };
            else {
              o = {};

              // The options object is "clone" to ensure adding the new loop to
              // it is safe:
              for (k in p1[i])
                o[k] = p1[i][k];
            }

            // Override the loop:
            (function(i) {
              o['loop'] = function(obj) {
                returned[i] = obj;

                // Start the basic loop
                _mainLoop(obj);

                // Check if it is time to trigger the main loop:
                if (!--ended)
                  conclude();
              };
            })(i);

            // Call the service:
            _request(o);
          }
        }
      }

      return this;
    }

    /**
     * Executes safely a function, deals with the "scope question"
     *
     * @param  {function} f       The function to execute.
     * @param  {?object}  options The options.
     *
     * @return {?object} Returns the formalized scopes alteration if loop is
     *                   not true in the options.
     *
     * Here is the list of options that are recognized:
     *
     *   {?string}  scope       Indicates which scope to give to the function.
     *   {?object}  inputValues Values to insert inside the scope before
     *                          execution.
     *   {?array}   parameters  The array of the parameters to give as input to
     *                          the function to execute.
     *   {?boolean} loop        If true, the _mainLoop() will directly be
     *                          triggered after execution. Else, the scope will
     *                          be formalized and returned.
     */
    function _execute(f, options) {
      var k,
          obj,
          returned,
          alters = {},
          o = options || {},
          scope = _getScope(o['scope']);

      if (_struct.get(f) !== 'function')
        _die('The first parameter must be a function');

      for (k in o['inputValues'] || {})
        scope[k] = o['inputValues'][k];

      // Execute the function on the related scope:
      returned = f.apply(scope, o['parameters'] || []);

      // Initialize result object:
      obj = {
        'returned': returned,
        'update': {},
        'events': [],
        'services': []
      };

      // Check events to dispatch:
      if (scope._events != null && !_struct.check('array', scope._events))
        _warn('Events must be stored in an array.');
      else
        obj['events'] = scope._events;

      // Merge properties to update from scope and scope._properties
      for (k in scope)
        alters[k] = scope[k];
      for (k in scope._properties)
        alters[scope._properties[k].property] = scope._properties[k].value;

      // Check properties to update:
      for (k in alters)
        if (_setters[k] !== undefined)
          obj['update'][k] = alters[k];
        else if (_protectedNames[k] === undefined)
          _warn('The key "' + k + '" is not a method nor a property.');

      for (k in o['inputValues'])
        obj['update'][k] = scope[k];

      for (k in scope._services)
        obj['services'][k] = scope._services[k];

      // Check if the main loop has to be started directly from here:
      if (o['loop']) {
        var iterate =
          (obj['services'] || []).length ||
          (obj['events'] || []).length;

        if (!iterate)
          for (k in obj['update']) {
            iterate = true;
            continue;
          }

        if (iterate)
          (
            _struct.check('function', o['loop']) ?
              o['loop'] :
              _mainLoop
          )(obj);
      }

      return obj;
    }

    /**
     * Returns the label of the specified property.
     *
     * @param  {string} id The property.
     *
     * @return {string}    The label.
     */
    function _getLabel(id) {
      return _labels[id];
    }

    /**
     * Returns the events that can alter the specified property (ie the input
     * events).
     *
     * @param  {string} id The property.
     *
     * @return {array}     The events types.
     */
    function _getEvents(id) {
      return _events[id];
    }

    /**
     * Checks the shortcuts and eventually arbitrary objects if they have
     * anything corresponding to the string, and returns the related value.
     *
     * @param  {string}    v        The string to expand.
     * @param  {...object} var_args The arbitrary objects to check before the
     *                              shortcuts.
     *
     * @return {*}         The expanded value.
     */
    function _expand(s) {
      var sc = s,
          prefix = _settings('shortcutPrefix'),
          a = (s || '').toString().match(
            new RegExp('^' + prefix + '(\\w+)$')
          );

      if (a && a.length) {
        _warn('Prefix in expand() calls is deprecated.');
        sc = a[1];
      }

      // Check other custom objects:
      for (var i = 1, l = arguments.length; i < l; i++)
        if ((arguments[i] || {})[sc] !== undefined)
          return arguments[i][sc];

      // Check properties:
      if (_struct.get(_getters[sc]) === 'function')
        return _get(sc);

      // Check declared shortcuts:
      if (_struct.get(_shortcuts[sc]) === 'function')
        return _shortcuts[sc].call(_getScope());

      // If the shortcut is not resolved:
      _warn('The shortcut "', sc, '" has not been recognized.');
      return prefix + sc;
    }

    /**
     * An helper to know if the property must be cloned or not:
     */
    function _checkPropertyParameter(property, parameter) {
      var c = (_propertyParameters[property] || {})[parameter];
      return c !== undefined ? !!c : _settings(parameter);
    }

    /**
     * Returns a clone of the configuration object.
     */
    function _configuration(key) {
      if (arguments.length)
        return _utils.clone(_config[key]);
      else
        return _utils.clone(_config);
    }

    /**
     * This method returns descriptions about some/every shortcuts, properties,
     * hacks and/or services. Here are some use examples:
     *
     *   > // The two following test cases work exactly samely for shortcuts
     *   > // and services:
     *   >
     *   > domInst.help('properties', 'myProperty1');
     *   > // Returns something like: 'Description of myProperty1'
     *   >
     *   > domInst.help('properties');
     *   > // Returns something like:
     *   > // {
     *   > //   myProperty1: 'Description of myProperty1',
     *   > //   myProperty2: 'Description of myProperty2',
     *   > //   myProperty3: '[no description is specified]'
     *   > // }
     *
     *   > // Here is how it works for hacks:
     *   > domInst.help('hacks', 'trigger', 'myEvent1');
     *   > // Returns something like:
     *   > // [
     *   > //   'Description of my hack n°1',
     *   > //   'Description of my hack n°2'
     *   > // ]
     *   > domInst.help('hacks', 'dispatch', 'myEvent2');
     *   > // Returns something like: 'Description of my hack n°1'
     *   > domInst.help('hacks');
     *   > // Returns something like:
     *   > // [
     *   > //   'Description of my hack n°1',
     *   > //   'Description of my hack n°2',
     *   > //   'Description of my hack n°3'
     *   > // ]
     *
     *   > // Finally, it is possible to display everything:
     *   > domInst.help('full');
     *   > // Returns something like:
     *   > // {
     *   > //   properties: {
     *   > //     myProperty1: 'Description of myProperty1',
     *   > //     myProperty2: 'Description of myProperty2',
     *   > //     myProperty3: '[no description is specified]'
     *   > //   },
     *   > //   services: {
     *   > //     myService1: 'Description of myService1',
     *   > //     myService2: 'Description of myService2',
     *   > //     myService3: '[no description is specified]'
     *   > //   },
     *   > //   shortcuts: {
     *   > //     myShortcut1: 'Description of myShortcut1',
     *   > //     myShortcut2: 'Description of myShortcut2',
     *   > //     myShortcut3: '[no description is specified]'
     *   > //   },
     *   > //   hacks: [
     *   > //     'Description of my hack n°1',
     *   > //     'Description of my hack n°2',
     *   > //     'Description of my hack n°3'
     *   > //   ]
     *   > // }
     *
     */
    function _help(v1, v2, v3) {
      var k,
          o = {},
          defaultMessage = '[no description is specified]';


      switch (v1) {
        case 'properties':
          if (arguments.length === 1) {
            for (k in _properties)
              o[k] = _descriptions.properties[k] || defaultMessage;
            return o;
          } else {
            return _descriptions.properties[v2] || defaultMessage;
          }
        case 'services':
          if (arguments.length === 1) {
            for (k in _services)
              o[k] = _descriptions.services[k] || defaultMessage;
            return o;
          } else {
            return _descriptions.services[v2] || defaultMessage;
          }
        case 'shortcuts':
          if (arguments.length === 1) {
            for (k in _shortcuts)
              o[k] = _descriptions.shortcuts[k] || defaultMessage;
            return o;
          } else {
            return _descriptions.shortcuts[v2] || defaultMessage;
          }
        case 'hacks':
          if (arguments.length === 1)
            return _hackDescription;
          else if (arguments.length === 3) {
            o = [];
            if (v2 === 'trigger')
              o = _hackAscDescription[v3];
            else if (v2 === 'dispatch')
              o = _hackDescDescription[v3];

            return o.length === 1 ? o[0] : o;
          }
        case 'full':
          return {
            properties: _help('properties'),
            shortcuts: _help('shortcuts'),
            services: _help('services'),
            hacks: _help('hacks')
          };
      }
    }

    /**
     * Kills the instance.
     */
    function _kill() {
      var i;

      _log('Killing instance "' + _name + '"');

      // Remove event listeners:
      for (i in _modules)
        _modules[i].removeEventListener();

      // Remove references:
      _modules = null;
      _types = null;
      _labels = null;
      _events = null;
      _getters = null;
      _setters = null;
      _statics = null;
      _properties = null;
      _overriddenGetters = null;
      _overriddenSetters = null;
      _modules = null;
      _ascending = null;
      _descending = null;
      _eventListeners = null;
      _propertyListeners = null;
      _hackMethods = null;
      _hackDispatch = null;
      _services = null;
      _currentCalls = null;
      _shortcuts = null;

      // Disable instance reference:
      for (i in _reference)
        delete _reference[i];

      // Kill the named reference:
      if (_instances[_name])
        delete _instances[_name];
    }

    /**
     * Instance settings manipulation method:
     */
    function _settings(a1, a2) {
      if (typeof a1 === 'string' && arguments.length === 1)
        return _localSettings[a1] !== undefined ?
          _localSettings[a1] :
          __settings__[a1];
      else {
        var o = (typeof a1 === 'object' && arguments.length === 1) ?
          a1 || {} :
          {};
        if (typeof a1 === 'string')
          o[a1] = a2;

        for (var k in o)
          if (o[k] !== undefined)
            _localSettings[k] = o[k];
          else
            delete _localSettings[k];

        return this;
      }
    };

    /**
     * Log methods (in the instance)
     */
    function _warn() {
      var a = ['[' + (_name || 'domino') + ']'];

      if (!_settings('strict'))
        a.push('WARNING');

      for (var i = 0, l = arguments.length; i < l; i++)
        a.push(arguments[i]);

      if (_settings('strict'))
        __die__.apply(this, a);
      else if (_settings('verbose'))
        __say__.apply(this, a);
    };

    function _die() {
      var a = ['[' + (_name || 'domino') + ']'];

      for (var i = 0, l = arguments.length; i < l; i++)
        a.push(arguments[i]);

      __die__.apply(this, a);
    };

    function _log() {
      var a = ['[' + (_name || 'domino') + ']'];

      if (!_settings('verbose'))
        return;

      for (var i = 0, l = arguments.length; i < l; i++)
        a.push(arguments[i]);

      __say__.apply(this, a);
    };

    // Return the full scope:
    return _reference;
  };

  // Current version.
  domino.version = '1.3.8';

  // Export domino (for both browser and Node.js):
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
      exports = module.exports = domino;
    exports.domino = domino;
  } else
    _root.domino = domino;


  /**
   * Utils classes:
   */

  // Check if XMLHttpRequest is present or not:
  function __hasXhr__() {
    return !!__settings__.xhr;
  }

  // Logs:
  function __warn__() {
    if (__settings__['strict'])
      __die__.apply(this, arguments);
    else
      __log__.apply(this, arguments);
  }

  function __die__() {
    throw (new Error(Array.prototype.join.call(arguments, ' ')));
  }

  function __log__() {
    if (!__settings__['verbose'])
      return;

    __say__.apply(this, arguments);
  }

  function __say__() {
    var a = [];
    for (var i = 0, l = arguments.length; i < l; i++)
      a.push(arguments[i]);

    if (__settings__['displayTime'])
      a.unshift(('00000000' + (new Date().getTime() - _startTime)).substr(-8));

    if (console && console.log instanceof Function)
      console.log.apply(console, a);
  }

  // Utils:
  domino.utils = {
    array: function(v, sep) {
      var a = (
            domino.struct.get(v) === 'string' ?
              v.split(sep || ' ') :
              domino.struct.get(v) === 'array' ?
                v :
                [v]
          ),
          res = [];
      for (var i in a)
        if (!!a[i])
          res.push(a[i]);

      return res;
    },
    clone: function(item) {
      if (!item) {
        return item;
      }

      var result, i, k, l;

      if (struct.get(item) === 'array') {
        result = [];
        for (i = 0, l = item.length; i < l; i++)
          result.push(this.clone(item[i]));
      } else if (struct.get(item) === 'date') {
        result = new Date(item.getTime());
      } else if (struct.get(item) === 'object') {
        if (item.nodeType && typeof item.cloneNode === 'function')
          result = item;
        else if (!item.prototype) {
          result = {};
          for (i in item) {
            result[i] = this.clone(item[i]);
          }
        } else {
          result = item;
        }
      } else {
        result = item;
      }

      return result;
    },
    partial: function(fn) {
      var args = Array.prototype.slice.call(arguments, 1);
      return function() {
        return fn.apply(
          this,
          args.concat(Array.prototype.slice.call(arguments))
        );
      };
    },
    ajax: function(o, fn) {
      if (!__hasXhr__())
        __die__(
          '[domino.global] ' +
          'XMLHttpRequest not found. You can specify which XMLHttpRequest ' +
          'you want to use by using domino.settings("xhr", myXhr).'
        );

      if (typeof o === 'string')
        o = { url: o, ok: fn };
      else if (struct.get(o) !== 'object')
        __die__('[domino.global] Invalid parameter given to AJAX');

      var type = o.type || 'GET',
          url = o.url || '',
          ctyp = o.contentType || 'application/x-www-form-urlencoded',
          dtyp = o.dataType || 'json',
          xhr = new __settings__.xhr(),
          timer,
          d, n;

      if (o.data) {
        if (typeof o.data === 'string')
          d = o.data;
        else if (/json/.test(ctyp))
          d = JSON.stringify(o.data);
        else {
          d = [];
          for (n in o.data)
            d.push(encodeURIComponent(n) + '=' + encodeURIComponent(o.data[n]));
          d = d.join('&');
        }

        if (/GET|DEL/i.test(type)) {
          url += /\?/.test(url) ?
            '&' + d :
            '?' + d;
          d = '';
        }
      }

      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          if (timer)
            clearTimeout(timer);

          if (/^2/.test(xhr.status)) {
            d = xhr.responseText;
            if (/json/.test(dtyp)) {
              try {
                d = JSON.parse(xhr.responseText);
              } catch (e) {
                return (
                  o.error &&
                  o.error('JSON parse error: ' + e.message, xhr)
                );
              }
            }
            o.success && o.success(d, xhr);
          } else {

            var message = +xhr.status ?
              xhr.responseText :
              xhr.responseText.length ?
                'Aborted: ' + xhr.responseText :
                'Aborted';

            o.error && o.error(message, xhr);
          }
        }
      };

      xhr.open(type, url, true);
      xhr.setRequestHeader('Content-Type', ctyp);

      if (o.headers)
        for (n in o.headers)
          xhr.setRequestHeader(n, o.headers[n]);

      if (
        typeof o.beforeSend === 'function' &&
        o.beforeSend(xhr, o) === false
      )
        return xhr.abort();

      if (o.timeout)
        timer = setTimeout(function() {
          xhr.onreadystatechange = function() {};
          xhr.abort();
          if (o.error)
            o.error && o.error('timeout', xhr);
        }, o.timeout * 1000);

      xhr.send(d);
      return xhr;
    }
  };

  // Structures helpers:
  domino.struct = (function() {
    var atoms = ['number', 'string', 'boolean', 'null', 'undefined'],
        classes = (
          'Boolean Number String Function Array Date RegExp Object'
        ).split(' '),
        class2type = {},
        types = ['*'];

    var customs = {};

    // Fill types
    for (var k in classes) {
      var name = classes[k];
      types.push(name.toLowerCase());
      class2type['[object ' + name + ']'] = name.toLowerCase();
    }

    return {
      add: function(a1, a2) {
        var k, a, id, tmp, struct, o;

        // Check errors:
        if (arguments.length === 1) {
          if (this.get(a1) === 'object') {
            o = a1;
            id = o.id;
            struct = o.struct;
          } else
            __die__(
              '[domino.global] ' +
              'If struct.add is called with one arguments, ' +
              'it has to be an object'
            );
        } else if (arguments.length === 2) {
          if (this.get(a1) !== 'string' || !a1)
            __die__(
              '[domino.global] ' +
              'If struct.add is called with more than one arguments, ' +
              'the first one must be the string id'
            );
          else
            id = a1;

          struct = a2;
        } else
          __die__(
            '[domino.global] ' +
            'struct.add has to be called with one or three arguments'
          );

        if (this.get(id) !== 'string' || id.length === 0)
          __die__('[domino.global] A structure requires an string id');

        if (customs[id] !== undefined && customs[id] !== 'proto')
          __die__(
            '[domino.global] The structure "' + id + '" already exists'
          );

        customs[id] = 1;

        // Check given prototypes:
        a = domino.utils.array((o || {}).proto);
        tmp = {};
        for (k in a)
          if (customs[a[k]] === undefined) {
            customs[a[k]] = 1;
            tmp[a[k]] = 1;
          }

        if (
          (this.get(struct) !== 'function') && !this.isValid(struct)
        )
          __die__(
            '[domino.global] ' +
            'A structure requires a valid "structure" property ' +
            'describing the structure. It can be a valid structure or a ' +
            'function that test if an object matches the structure.'
          );

        if (~types.indexOf(id)) {
          delete customs[id];
          __die__(
            '[domino.global] "' + id + '" is a reserved structure name'
          );
        }

        // Effectively add the structure:
        customs[id] = (o === undefined) ?
          {
            id: id,
            struct: struct
          } :
          {};

        if (o !== undefined)
          for (k in o)
            customs[id][k] = o[k];

        // Delete prototypes:
        for (k in tmp)
          if (k !== id)
            delete customs[k];
      },
      get: function(obj) {
        return obj == null ?
          String(obj) :
          class2type[Object.prototype.toString.call(obj)] || 'object';
      },
      existing: function(key) {
        return typeof key === 'string' ?
          (customs[key] || {}).struct :
          domino.utils.clone(customs);
      },
      check: function(type, obj, params) {
        var a, i,
            typeOf = this.get(obj),
            p = params || {};

        if (this.get(type) === 'string') {
          a = type.replace(/^\?/, '').split(/\|/);
          for (i in a)
            if (types.indexOf(a[i]) < 0 && customs[a[i]] === undefined) {
              __warn__('[domino.global] Invalid type');
              return false;
            }

          if (obj == null)
            return !!type.match(/^\?/, '');
          else
            type = type.replace(/^\?/, '');

          for (i in a)
            if (customs[a[i]])
              if (
                (this.get(customs[a[i]].struct) === 'function') ?
                (customs[a[i]].struct(obj) === true) :
                this.check(customs[a[i]].struct, obj, customs[a[i]])
              )
                return true;

          return !!(~a.indexOf('*') || ~a.indexOf(typeOf));
        } else if (this.get(type) === 'object') {
          if (typeOf !== 'object')
            return false;
          var k;

          for (k in type)
            if (!this.check(type[k], obj[k]))
              return false;

          if (!p.includes)
            for (k in obj)
              if (type[k] === undefined)
                return false;

          return true;
        } else if (this.get(type) === 'array') {
          if (typeOf !== 'array')
            return false;

          if (type.length !== 1) {
            __warn__('[domino.global] Invalid type');
            return false;
          }

          for (k in obj)
            if (!this.check(type[0], obj[k]))
              return false;

          return true;
        } else
          return false;
      },
      deepScalar: function(type) {
        var a, i;
        if (this.get(type) === 'string') {
          a = type.replace(/^\?/, '').split(/\|/);
          for (i in a)
            if (atoms.indexOf(a[i]) < 0)
              return false;
          return true;
        } else if (this.check('object|array', type)) {
          for (i in type)
            if (!this.deepScalar(type[i]))
              return false;
          return true;
        }

        return false;
      },
      compare: function(v1, v2, type) {
        var t1 = this.get(v1),
            t2 = this.get(v2),
            a, i;

        if (
          !this.deepScalar(type) ||
          !this.check(type, v1) ||
          !this.check(type, v2)
        )
          return false;

        if (this.get(type) === 'string') {
          return v1 === v2;
        } else if (this.get(type) === 'object') {
          for (i in type)
            if (!this.compare(v1[i], v2[i], type[i]))
              return false;
          return true;
        } else if (this.get(type) === 'array') {
          if (v1.length !== v2.length)
            return false;
          var l = v1.length;
          for (i = 0; i < l; i++)
            if (!this.compare(v1[i], v2[i], type[0]))
              return false;
          return true;
        }

        return false;
      },
      isValid: function(type) {
        var a, k, i;
        if (this.get(type) === 'string') {
          a = type.replace(/^\?/, '').split(/\|/);
          for (i in a)
            if (types.indexOf(a[i]) < 0 && customs[a[i]] === undefined)
              return false;
          return true;
        } else if (this.get(type) === 'object') {
          for (k in type)
            if (!this.isValid(type[k]))
              return false;

          return true;
        } else if (this.get(type) === 'array')
          return type.length === 1 ?
            this.isValid(type[0]) :
            false;
        else
          return false;
      }
    };
  })();
  var utils = domino.utils;
  var struct = domino.struct;

  // Global settings:
  var __settings__ = {
    maxDepth: 0,
    strict: false,
    verbose: false,
    displayTime: false,
    shortcutPrefix: ':',
    mergeRequests: true,
    logDescriptions: true,
    xhr: _root.XMLHttpRequest,
    clone: false
  };

  domino.settings = function(a1, a2) {
    if (typeof a1 === 'string' && arguments.length === 1)
      return __settings__[a1];
    else {
      var o = (typeof a1 === 'object' && arguments.length === 1) ?
        a1 || {} :
        {};
      if (typeof a1 === 'string')
        o[a1] = a2;

      for (var k in o)
        if (o[k] !== undefined)
          __settings__[k] = o[k];
        else
          delete __settings__[k];

      return this;
    }
  };

  // Access to all named instances:
  domino.instances = function(name) {
    if (!arguments.length)
      __die__(
        '[domino.global] You need to indicate a name to get the instance.'
      );
    else
      return _instances[name];
  };

  // Event dispatcher:
  domino.EventDispatcher = function() {
    Object.defineProperty(this, '_handlers', {
      value: {}
    });
  };

  var dispatcher = domino.EventDispatcher;

  /**
   * Will execute the handler everytime that the indicated event (or the
   * indicated events) will be triggered.
   * @param  {string}           events  The name of the event (or the events
   *                                    separated by spaces).
   * @param  {function(Object)} handler The handler to addEventListener.
   * @return {EventDispatcher} Returns itself.
   */
  dispatcher.prototype.addEventListener = function(events, handler) {
    var i,
        l,
        event,
        eArray;

    if (
      arguments.length === 1 &&
      typeof arguments[0] === 'object'
    )
      for (events in arguments[0])
        this.addEventListener(events, arguments[0][events]);
    else if (
      arguments.length === 2 &&
      typeof arguments[1] === 'function'
    ) {
      eArray = typeof events === 'string' ? events.split(' ') : events;

      for (i = 0, l = eArray.length; i !== l; i += 1) {
        event = eArray[i];

        // Check that event is not '':
        if (!event)
          continue;

        if (!this._handlers[event])
          this._handlers[event] = [];

        // Using an object instead of directly the handler will make possible
        // later to add flags
        this._handlers[event].push({
          handler: handler
        });
      }
    } else
      throw 'domino.EventDispatcher.addEventListener: Wrong arguments.';

    return this;
  };

  /**
   * Removes the handler from a specified event (or specified events).
   * @param  {?string}           events  The name of the event (or the events
   *                                     separated by spaces). If undefined,
   *                                     then all handlers are removed.
   * @param  {?function(Object)} handler The handler to removeEventListener.
   *                                     If undefined, each handler bound to
   *                                     the event or the events will be
   *                                     removed.
   * @return {EventDispatcher} Returns itself.
   */
  dispatcher.prototype.removeEventListener = function(events, handler) {
    var i,
        n,
        j,
        m,
        k,
        a,
        event,
        eArray = typeof events === 'string' ? events.split(' ') : events;

    if (!arguments.length) {
      for (k in this._handlers)
        delete this._handlers[k];
      return this;
    }

    if (handler) {
      for (i = 0, n = eArray.length; i !== n; i += 1) {
        event = eArray[i];
        if (this._handlers[event]) {
          a = [];
          for (j = 0, m = this._handlers[event].length; j !== m; j += 1)
            if (this._handlers[event][j].handler !== handler)
              a.push(this._handlers[event][j]);

          this._handlers[event] = a;
        }

        if (this._handlers[event] && this._handlers[event].length === 0)
          delete this._handlers[event];
      }
    } else
      for (i = 0, n = eArray.length; i !== n; i += 1)
        delete this._handlers[eArray[i]];

    return this;
  };

  /**
   * Executes each handler bound to the event
   * @param  {string}  events The name of the event (or the events separated
   *                          by spaces).
   * @param  {?Object} data   The content of the event (optional).
   * @return {EventDispatcher} Returns itself.
   */
  dispatcher.prototype.dispatchEvent = function(events, data) {
    var i,
        n,
        j,
        m,
        a,
        event,
        handlers,
        eventName,
        self = this,
        eArray = typeof events === 'string' ? events.split(' ') : events;

    data = data === undefined ? {} : data;

    for (i = 0, n = eArray.length; i !== n; i += 1) {
      eventName = eArray[i];
      handlers = this._handlers[eventName];

      if (handlers && handlers.length) {
        event = self.getEvent(eventName, data);
        a = [];

        for (j = 0, m = handlers.length; j !== m; j += 1) {
          handlers[j].handler(event);
          if (!handlers[j].one)
            a.push(handlers[j]);
        }

        this._handlers[eventName] = a;
      }
    }

    return this;
  };

  /**
   * Return an event Object.
   * @param  {string}  events The name of the event.
   * @param  {?Object} data   The content of the event (optional).
   * @return {Object} Returns itself.
   */
  dispatcher.prototype.getEvent = function(event, data) {
    return {
      type: event,
      data: data || {},
      target: this
    };
  };

  // Default module template:
  domino.module = function() {
    // Check that the current object is not already a module - GH issue #51:
    // The easiest way is to check if the _handlers object from the dispatcher
    // class is not present yet.
    if (!this._handlers) {
      dispatcher.call(this);

      for (var k in dispatcher.prototype)
        this[k] = dispatcher.prototype[k];

      // In this object will be stored the module's triggers:
      this.triggers = {
        properties: {},
        events: {}
      };

      // We also prototype comunication methods:
      this.log = this.warn = this.die = function() {};
    }
  };
}).call(this);
