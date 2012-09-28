(function(window) {
  'use strict';

  // Check domino.js existance:
  if (window.domino) {
    throw new Error('domino already exists');
  }

  /**
   * TThe constructor of any domino.js instance.
   *
   * @constructor
   * @extends domino.EventDispatcher
   * @this {domino}
   */
  window.domino = function() {
    dispatcher.call(this);

    // Misc:
    var _self = this,
        _utils = domino.utils,
        _type = _utils.type;

    // Properties management:
    var _types = {},
        _labels = {},
        _events = {},
        _getters = {},
        _setters = {},
        _statics = {},
        _properties = {};

    // Modules:
    var _modules = [];

    // Communication management:
    var _ascending = {},
        _descending = {};

    // Hacks management:
    var _hackMethods = {},
        _hackDispatch = {};

    // AJAX management:
    var _services = {},
        _shortcuts = {};

    // Scopes:
    var _lightScope = {
          get: _get,
          events: _getEvents,
          label: _getLabel,
          dump: _self.dump,
          expand: _expand
        },
        _fullScope = {
          get: _get,
          set: _set,
          events: _getEvents,
          label: _getLabel,
          dump: _self.dump,
          warn: _self.warn,
          die: _self.die,
          update: _update,
          expand: _expand,
          call: _call,
          addModule: addModule
        };

    // Set protected property names:
    var _protectedNames = {};
    (function() {
      var k;
      for (k in _lightScope)
        _protectedNames[k] = 1;
      for (k in _fullScope)
        _protectedNames[k] = 1;
    })();


    // Initialization:
    var _o = {};
    this.name = 'domino';

    if (_type.get(arguments[0]) === 'string')
      this.name = arguments[0];
    else if (
      arguments[0] !== undefined &&
      _type.get(arguments[0]) === 'object'
    )
      _o = arguments[0];
    else if (
      arguments[1] !== undefined &&
      _type.get(arguments[1]) === 'object'
    )
      _o = arguments[1];

    this.name = _o['name'] || this.name;

    (function() {
      var i;
      for (i in _o.properties || [])
        addProperty(_o.properties[i].id, _o.properties[i]);

      for (i in _o.hacks || [])
        addHack(_o.hacks[i]);

      for (i in _o.services || [])
        addService(_o.services[i]);

      for (i in _o.shortcuts || [])
        addShortcut(_o.shortcuts[i]['id'], _o.shortcuts[i]['method']);
    })();


    /**
     * References a new property, generated the setter and getter if not
     * specified, and binds the events.
     *
     * @param   {string}  id     The id of the property.
     * @param   {?Object} options An object containing some more precise
     *                            indications about the hack.
     *
     * @private
     * @return {domino} Returns the domino instance itself.
     *
     * Here is the list of options that are interpreted:
     *
     *   {?string}          label    The label of the property (the ID by
     *                               default)
     *   {?(string|object)} type     Indicated the type of the property. Use
     *                               "?" to specify a nullable property, and
     *                               "|" for multiple valid types.
     *   {?function}        setter   Overrides the default property setter.
     *   {?function}        getter   Overrides the default property getter.
     *   {?*}               value    The initial value of the property.
     *   {?(string|array)}  triggers The list of events that can modify the
     *                               property. Can be an array or the list of
     *                               events separated by spaces.
     *   {?(string|array)}  dispatch The list of events that must be triggered
     *                               after modification of the property. Can be
     *                               an array or the list of events separated
     *                               by spaces.
     */
    function addProperty(id, options) {
      var i,
          o = options || {};

      // Check errors:
      if (id === undefined)
        _self.die('Property name not specified');

      if (_properties[id] !== undefined)
        _self.die('Property "' + id + '" already exists');

      if (_protectedNames[id] !== undefined)
        _self.die('"' + id + '" can not be used to name a property');

      // Label:
      _labels[id] = o['label'] || id;

      // Type:
      if (o['type'] !== undefined)
        !_type.isValid(o['type']) ?
          _self.warn(
            'Property "' + id + '": Type not valid'
          ) :
          (_types[id] = o['type']);

      // Setter:
      if (o['setter'] !== undefined)
        !_type.get(o['setter']) !== 'function' ?
          _self.warn(
            'Property "' + id + '": Setter is not a function'
          ) :
          (_setters[id] = o['setter']);

      _setters[id] = _setters[id] || function(v) {
        if (v === _properties[id])
          return false;

        (_types[id] && !_type.check(_types[id], v)) ?
          _self.warn(
            'Property "' + id + '": Wrong type error'
          ) :
          (_properties[id] = v);

        return true;
      };

      // Getter:
      if (o['getter'] !== undefined)
        !_type.get(o['getter']) !== 'function' ?
          _self.warn(
            'Property "' + id + '": Getter is not a function'
          ) :
          (_getters[id] = o['getter']);

      _getters[id] = _getters[id] || function() {
        return _properties[id];
      };

      // Initial value:
      if (o['value'] !== undefined || _types[id])
        o['value'] !== undefined ?
            _set(id, o['value']) :
            _self.warn(
              'Property "' + id + '": ' +
                'Initial value is missing'
            );

      // Triggers (modules-to-domino events):
      if (o['triggers'] !== undefined) {
        !_type.check('array|string', o['triggers']) &&
          _self.warn(
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
        !_type.check('array|string', o['dispatch']) ?
          _self.warn(
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
     * @private
     * @return {domino} Returns the domino instance itself.
     *
     * Here is the list of options that are interpreted:
     *
     *   {(array|string)}  triggers The list of events that can trigger the
     *                              hack. Can be an array or the list of
     *                              events separated by spaces.
     *   {?(array|string)} dispatch The list of events that will be triggered
     *                              after actionning the hack. Can be an array
     *                              or the list of events separated by spaces.
     *                              spaces.
     *   {?function}       method   A method to execute after receiving a
     *                              trigger and before dispatching the
     *                              specified events.
     */
    function addHack(options) {
      var a, i,
          o = options || {};

      // Errors:
      if (o['triggers'] === undefined)
        _self.die(
          'A hack requires at least one trigger to be added'
        );

      a = _utils.array(o['triggers']);
      for (i in a) {
        // Method to execute:
        if (o['method']) {
          _hackMethods[a[i]] = _hackMethods[a[i]] || [];
          _hackMethods[a[i]].push(o['method']);
        }

        // Events to dispatch:
        if (o['dispatch'])
          _hackDispatch[a[i]] = (_hackDispatch[a[i]] || []).concat(
            _utils.array(o['dispatch'])
          );
      }

      return _self;
    }

    /**
     * References a new service, ie an helper to easily interact between your
     * server and your properties. This service will take itself as parameter
     * an object, whose most keys can override the default described bellow.
     *
     * @param   {?Object} options An object containing some more precise
     *                            indications about the service.
     *
     * @private
     * @return {domino} Returns the domino instance itself.
     *
     * Here is the list of options that are interpreted:
     *
     *   {string}          id
     *   {string|function} url
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
     *                                  Will be called in the "full" scope.
     *   {?function}       success+     A function to execute if AJAX
     *                                  successed. Will be called in the
     *                                  "full" scope.
     *   {?string}         setter+*     The name of a property. If the setter
     *                                  exists, then it will be called with the
     *                                  received data as parameter, or the
     *                                  value corresponding to the path, if
     *                                  specified.
     *   {?(string|array)} path+*       Indicates the path of the data to give
     *                                  to the setter, if specified.
     *   {?(string|array)} events++     The events to dispatch in case of
     *                                  success
     *
     * The properties followed by + are overridable when the service is called.
     * The properties followed by ++ are cumulative when the service is called.
     * The properties followed by "*" accept shortcut values.
     */
    function addService(options) {
      var o = options || {};

      // Errors:
      if (o['id'] === undefined || _type.get(o['id']) !== 'string')
        _self.die(
          'The service id is not indicated.'
        );

      if (!_type.check('function|string', o['url']))
        _self.die(
          'The service URL is not valid.'
        );

      if (_services[o['id']] !== undefined)
        _self.die(
          'The service "' + o['id'] + '" already exists.'
        );

      _services[o['id']] = function(params) {
        var p = params || {},
            ajaxObj = {
              contentType: p['contentType'] || o['contentType'],
              dataType: p['dataType'] || o['dataType'],
              type: (p['type'] || o['type'] || 'GET').toString().toUpperCase(),
              data: _type.get(o['data']) === 'function' ?
                      o['data'].apply(_lightScope, p['data'] || []) :
                      (p['data'] || o['data']),
              url: _type.get(o['url']) === 'function' ?
                      o['url'].call(_lightScope) :
                      o['url'],
              error: function(mes, xhr) {
                _self.dispatchEvent('domino.ajaxFailed');
                var error = p['error'] || o['error'];

                if (_type.get(error) === 'function')
                  error.call(_fullScope, mes, xhr);
                else
                  _self.die('Loading failed with message "' + mes + '".');
              }
            };

        var i, exp, k, doTest,
            pref = __settings__['shortcutPrefix'],
            regexContains = new RegExp(pref + '(\\w+)', 'g'),
            regexFull = new RegExp('^' + pref + '(\\w+)$'),
            oldURL = null,
            matches;

        // Manage shortcuts in URL:
        while (
          (matches = ajaxObj['url'].match(regexContains)) &&
          ajaxObj['url'] !== oldURL
        ) {
          oldURL = ajaxObj['url'];
          for (i in matches) {
            exp = _expand(matches[i], p['params']);
            ajaxObj['url'] =
              ajaxObj['url'].replace(new RegExp(matches[i], 'g'), exp);
          }
        }

        // Manage shortcuts in params:
        // (NOT DEEP - only first level)
        doTest = true;
        if (_type.get(ajaxObj['data']) === 'string')
          if (ajaxObj['data'].match(regexFull))
            ajaxObj['data'] = _expand(ajaxObj['data'], p['params']);

        if (_type.get(ajaxObj['data']) === 'object')
          while (doTest) {
            doTest = false;
            for (k in ajaxObj['data'])
              if (
                _type.get(ajaxObj['data'][k]) === 'string' &&
                ajaxObj['data'][k].match(regexFull)
              ) {
                ajaxObj['data'][k] = _expand(ajaxObj['data'][k], p['params']);
                doTest = true;
              }
          }

        // Success management:
        ajaxObj.success = function(data) {
          var i, a, pushEvents, event,
              pathArray, d,
              dispatch = {},
              path = p['path'] || o['path'],
              setter = p['setter'] || o['setter'],
              success = p['success'] || o['success'];

          // Expand different string params:
          if (_type.get(setter) === 'string')
            setter = _expand(setter, p['params']);
          if (_type.get(path) === 'string')
            path = _expand(path, p['params']);

          // Check path:
          d = data;

          if (path.match(/^(?:\w+\.)*\w+$/))
            pathArray = _type.get(path, 'string') ?
              path.split('.') :
              undefined;
          else if (_type.get(path) === 'string')
            _self.warn(
              'Path "' + path + '" does not match regExp /^(?:\\w+\\.)*\\w+$/'
            );

          if (pathArray)
            for (i in pathArray) {
              d = d[pathArray[i]];
              if (d === undefined) {
                _self.warn(
                  'Wrong path "' +
                    path +
                  '" for service "' +
                    o['id'] +
                  '".'
                );
                continue;
              }
            }

          // Events to dispatch (service config):
          a = _utils.array(o['events']);
          for (i in a)
            dispatch[a[i]] = 1;

          // Events to dispatch (call config):
          a = _utils.array(p['events']);
          for (i in a)
            dispatch[a[i]] = 1;

          // Check setter:
          if (setter && _setters[setter])
            if (_set(setter, d))
              for (k in _descending[setter] || [])
                dispatch[_descending[setter][k]] = 1;

          // Check success:
          if (_type.get(success) === 'function')
            success.call(_fullScope, data, p);

          a = [];
          for (event in dispatch) {
            _self.dispatchEvent(event, _lightScope);
            a.push(_self.getEvent(event, _lightScope));
          }

          // Reloop:
          if (a.length)
            _mainLoop(a);
        };

        // Launch AJAX call:
        _utils.ajax(ajaxObj);
      };

      return _self;
    }

    /**
     * Creates a shortcut, that can be called from different parameters in the
     * services. Basically, makes easier to insert changing values in URLs,
     * data, etc...
     *
     * Any property is already registered as shortcut (that returns then the
     * value when called), but can be overridden safely.
     *
     * @param   {string}   id     The string to use to call the shortcut.
     * @param   {function} method The method to call.
     *
     * @private
     * @return {domino} Returns the domino instance itself.
     */
    function addShortcut(id, method) {
      // Check errors:
      if (id === undefined)
        _self.die('Shortcut ID not specified.');

      if (_shortcuts[id])
        _self.die('Shortcut "' + id + '" already exists.');

      if (method === undefined)
        _self.die('Shortcut method not specified.');

      // Add shortcut:
      _shortcuts[id] = method;

      return _self;
    }

    /**
     * This module will create and reference a module, and return it
     *
     * @param   {function} klass   The module class constructor.
     * @param   {?array}   params  The array of the parameters to give to the
     *                             module constructor. The "light" scope will
     *                             always be given as the last parameter, to
     *                             make it easier to find labels or events
     *                             related to any property.
     * @param   {?object}  options An object containing some more precise
     *                             indications about the service (currently not
     *                             used).
     *
     * @private
     * @return {*} Returns the module just created.
     */
    function addModule(klass, params, options) {
      var i,
          o = options || {},
          module = {},
          triggers,
          property,
          event;

      // Check errors:
      if (klass === undefined)
        _self.die('Module class not specified.');

      if (_type.get(klass) !== 'function')
        _self.die('First parameter must be a function.');

      // Instanciate the module:
      klass.apply(module, (params || []).concat(_lightScope));
      triggers = module.triggers || {};

      // Ascending communication:
      for (event in triggers.events || {})
        _self.addEventListener(event, triggers.events[event]);

      for (property in triggers.properties || {}) {
        for (i in _descending[property] || [])
          _self.addEventListener(
            _descending[property][i],
            triggers.properties[property]
          );

        if (_getters[property] !== undefined) {
          var data = {};
          data[property] = _get(property);
          triggers.properties[property](
            _self.getEvent('domino.initialUpdate', _lightScope)
          );
        }
      }

      // Descending communication:
      for (event in _ascending || {})
        module.addEventListener(event, _mainLoop);

      for (event in _hackMethods || {})
        module.addEventListener(event, _mainLoop);

      // Finalize:
      _modules.push(module);
      return module;
    }

    /**
     * The main loop, that is triggered either by modules, hacks or event by
     * itself, and that will update properties and dispatch events to the
     * modules, trigger hacks (and so eventually load services, for example).
     *
     * @param   {array|object}   events  The event or an array of events.
     * @param   {?object}        options The optional parameters.
     * @private
     */
    function _mainLoop(events, options) {
      var a, i, j, k, event, data, pushEvents,
          log = [],
          o = options || {},
          dispatch = {};

      o['loop'] = (o['loop'] || 0) + 1;

      var eventsArray = _utils.array(events);
      for (i in eventsArray) {
        event = eventsArray[i];
        data = event.data || {};
        log.push(event.type);

        // Check properties to update:
        if (data || o['force']) {
          a = _ascending[event.type] || [];
          for (j in a) {
            pushEvents = !!o['force'];

            if (data[a[j]] !== undefined)
              pushEvents = _set(a[j], data[a[j]]) || pushEvents;

            if (pushEvents)
              for (k in _descending[a[j]] || [])
                dispatch[_descending[a[j]][k]] = 1;
          }
        }

        // Check hacks to trigger:
        for (j in _hackMethods[event.type] || [])
          _hackMethods[event.type][j].call(_fullScope, event);

        for (j in _hackDispatch[event.type] || [])
          dispatch[_hackDispatch[event.type][j]] = 1;
      }

      _self.dump('Main loop ' + o['loop'] + ':', log);

      a = [];
      for (event in dispatch) {
        _self.dispatchEvent(event, _lightScope);
        a.push(_self.getEvent(event, _lightScope));
      }

      // Reloop:
      if (a.length)
        _mainLoop(a, o);
    }

    /**
     * A method that can update any of the properties - designed to be used
     * especially from the hacks, eventually from the services success methods.
     * For each property actually updated, the related events will be
     * dispatched through the _mainLoop method.
     *
     * @param   {?object}   properties The optional parameters.
     * @private
     */
    function _update(properties) {
      var i, k, a, event,
          log = [],
          o = properties || {},
          dispatch = {};

      for (k in o) {
        log.push(k);

        if (_setters[k] && _set(k, o[k]))
          for (i in _descending[k] || [])
            dispatch[_descending[k][i]] = 1;
      }

      _self.dump('Updating properties :', log);

      a = [];
      for (event in dispatch) {
        _self.dispatchEvent(event, _lightScope);
        a.push(_self.getEvent(event, _lightScope));
      }

      // Reloop:
      if (a.length)
        _mainLoop(a, o);
    }

    function _get(property) {
      if (_getters[property])
        return _getters[property].call(_lightScope);
      else
        _self.warn('Property "' + property + '" not referenced.');
    }

    function _set(property, value) {
      if (_setters[property])
        return _setters[property].call(_fullScope, value);

      _self.warn('Property "' + property + '" not referenced.');
      return false;
    }

    function _call(service, params) {
      if (_services[service])
        return _services[service](params);

      _self.warn('Service "' + service + '" not referenced.');
      return false;
    }

    function _getLabel(id) {
      return _labels[id];
    }

    function _getEvents(id) {
      return _events[id];
    }

    function _expand(v) {
      var l = arguments.length,
          a = (v || '').toString().match(
            new RegExp('^' + __settings__['shortcutPrefix'] + '(\\w+)$')
          );

      // Case where the string doesn't match:
      if (!a || !a.length)
        return v;
      a = a[1];

      // Check shortcuts:
      if (_type.get(_shortcuts[a]) === 'function')
        return _shortcuts[a].call(_fullScope);

      // Check properties:
      if (_type.get(_getters[a]) === 'function')
        return _get(a);

      // Check other custom objects:
      for (var i = 1; i < l; i++)
        if ((arguments[i] || {})[a] !== undefined)
          return arguments[i][a];

      return v;
    }

    // Return a scope:
    return _fullScope;
  };
  var domino = window.domino;


  /**
   * Utils classes:
   */

  // Logs:
  function __warn__() {
    if (__settings__['strict'])
      __die__.apply(this, arguments);
    else
      __dump__.apply(this, arguments);
  }

  function __die__() {
    var m = '';
    for (var k in arguments)
      m += arguments[k];

    throw (new Error(m));
  }

  function __dump__() {
    if (!__settings__['verbose'])
      return;

    console.log.apply(console, arguments);
  }

  domino.prototype.warn = function(s) {
    var a = ['[' + this.name + ']'];
    for (var k in arguments)
      a.push(arguments[k]);

    __warn__.apply(this, a);
  };

  domino.prototype.die = function(s) {
    var a = ['[' + this.name + ']'];
    for (var k in arguments)
      a.push(arguments[k]);

    __die__.apply(this, a);
  };

  domino.prototype.dump = function() {
    var a = ['[' + this.name + ']'];
    for (var k in arguments)
      a.push(arguments[k]);

    __dump__.apply(this, a);
  };

  // Utils:
  domino.utils = {
    array: function(v, sep) {
      var a = (
            domino.utils.type.get(v) === 'string' ?
              v.split(sep || ' ') :
              domino.utils.type.get(v) === 'array' ?
                v :
                [v]
          ),
          res = [];
      for (var i in a)
        if (!!a[i])
          res.push(a[i]);

      return res;
    },
    ajax: function(o, fn) {
      if (typeof o === 'string')
        o = { url: o, ok: fn };

      var type = o.type || 'GET',
          url = o.url || '',
          ctyp = o.contentType || 'application/x-www-form-urlencoded',
          dtyp = o.dataType || 'json',
          xhr = new XMLHttpRequest(),
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
          } else
            o.error && o.error(xhr.responseText, xhr);
        }
      };

      xhr.open(type, url, true);
      xhr.setRequestHeader('Content-Type', ctyp);

      if (o.headers)
        for (n in o.headers)
          xhr.setRequestHeader(n, o.headers[n]);

      if (o.timeout)
        timer = setTimeout(function() {
          xhr.onreadystatechange = function() {};
          xhr.abort();
          if (o.error)
            o.error && o.error('timeout', xhr);
        }, o.timeout * 1000);

      xhr.send(d);
      return xhr;
    },
    type: (function() {
      var classes = (
            'Boolean Number String Function Array Date RegExp Object'
          ).split(' '),
          class2type = {},
          types = ['*'];

      // Fill types
      for (var k in classes) {
        var name = classes[k];
        types.push(name.toLowerCase());
        class2type['[object ' + name + ']'] = name.toLowerCase();
      }

      return {
        get: function(obj) {
          return obj == null ?
            String(obj) :
            class2type[Object.prototype.toString.call(obj)] || 'object';
        },
        check: function(type, obj) {
          var a, i,
              typeOf = this.get(obj);

          if (this.get(type) === 'string') {
            a = type.replace(/^\?/, '').split(/\|/);
            for (i in a)
              if (types.indexOf(a[i]) < 0)
                __warn__('[domino.global] Invalid type');

            if (obj == null)
              return !!type.match(/^\?/, '');
            else
              type = type.replace(/^\?/, '');

            var splitted = type.split(/\|/);

            return !!(~splitted.indexOf('*') || ~splitted.indexOf(typeOf));
          } else if (this.get(type) === 'object') {
            if (typeOf !== 'object')
              return false;
            var k;

            for (k in type)
              if (!this.check(type[k], obj[k]))
                return false;

            for (k in obj)
              if (type[k] === undefined)
                return false;

            return true;
          } else
            return false;
        },
        isValid: function(type) {
          var a, k, i;
          if (this.get(type) === 'string') {
            a = type.replace(/^\?/, '').split(/\|/);
            for (i in a)
              if (types.indexOf(a[i]) < 0)
                return false;
            return true;
          } else if (this.get(type) === 'object') {
            for (k in type)
              if (!this.isValid(type[k]))
                return false;

            return true;
          } else
            return false;
        }
      };
    })()
  };
  var utils = domino.utils;

  // Global settings:
  var __settings__ = {
    strict: false,
    verbose: false,
    shortcutPrefix: ':'
  };

  domino.settings = function(a1, a2) {
    if (typeof a1 === 'string' && a2 === undefined)
      return __settings__[a1];
    else {
      var o = (typeof a1 === 'object' && a2 === undefined) ? a1 || {} : {};
      if (typeof a1 === 'string')
        o[a1] = a2;

      for (var k in o)
        if (__settings__[k] !== undefined)
          __settings__[k] = o[k];

      return this;
    }
  };

  // Event dispatcher:
  domino.EventDispatcher = function() {
    var _handlers = {};

    /**
     * Will execute the handler everytime that the indicated event (or the
     * indicated events) will be triggered.
     * @param  {string}           events  The name of the event (or the events
     *                                    separated by spaces).
     * @param  {function(Object)} handler The handler to addEventListener.
     * @return {EventDispatcher} Returns itself.
     */
    function addEventListener(events, handler) {
      if (!arguments.length)
        return this;
      else if (
        arguments.length === 1 &&
        utils.type.get(arguments[0]) === 'object'
      )
        for (var events in arguments[0])
          this.addEventListener(events, arguments[0][events]);
      else if (arguments.length > 1) {
        var event,
            events = arguments[0],
            handler = arguments[1],
            eArray = utils.array(events),
            self = this;

        for (var i in eArray) {
          event = eArray[i];

          if (!_handlers[event])
            _handlers[event] = [];

          // Using an object instead of directly the handler will make possible
          // later to add flags
          _handlers[event].push({
            handler: handler
          });
        }
      }

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
    function removeEventListener(events, handler) {
      if (!arguments.length) {
        this._handlers_ = {};
        return this;
      }

      var i, j, a, event,
          eArray = utils.array(events),
          self = this;

      if (handler) {
        for (i in eArray) {
          event = eArray[i];
          if (_handlers[event]) {
            a = [];
            for (j in _handlers[event])
              if (_handlers[event][j].handler !== handler)
                a.push(_handlers[event][j]);

            _handlers[event] = a;
          }

          if (_handlers[event] && _handlers[event].length === 0)
            delete _handlers[event];
        }
      } else
        for (i in eArray)
          delete _handlers[eArray[i]];

      return self;
    };

    /**
     * Executes each handler bound to the event
     * @param  {string}  events The name of the event (or the events separated
     *                          by spaces).
     * @param  {?Object} data   The content of the event (optional).
     * @return {EventDispatcher} Returns itself.
     */
    function dispatchEvent(events, data) {
      var i, j, a, event, eventName,
          eArray = utils.array(events),
          self = this;

      data = data === undefined ? {} : data;

      for (i in eArray) {
        eventName = eArray[i];

        if (_handlers[eventName]) {
          event = self.getEvent(eventName, data);
          a = [];

          for (j in _handlers[eventName]) {
            _handlers[eventName][j].handler(event);
            if (!_handlers[eventName][j]['one'])
              a.push(_handlers[eventName][j]);
          }

          _handlers[eventName] = a;
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
    function getEvent(event, data) {
      return {
        type: event,
        data: data,
        target: this
      };
    };

    this.removeEventListener = removeEventListener;
    this.addEventListener = addEventListener;
    this.dispatchEvent = dispatchEvent;
    this.getEvent = getEvent;
  };
  var dispatcher = domino.EventDispatcher;

  // Default module template:
  domino.module = function() {
    dispatcher.call(this);

    // In this object will be stored the module's triggers:
    this.triggers = {
      properties: {},
      events: {}
    };
  };
  var module = domino.module;
})(window);
