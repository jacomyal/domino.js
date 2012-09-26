(function(window) {
  'use strict';

  // Check domino.js existance:
  if (window.domino) {
    throw new Error('domino already exists');
  }

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
          dump: self.dump,
          expand: _expand
        },
        _fullScope = {
          get: _get,
          set: _set,
          events: _getEvents,
          label: _getLabel,
          dump: self.dump,
          warn: self.warn,
          die: self.die,
          update: _update,
          expand: _expand
        };

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
    })();


    /**
     * References a new property, generated the setter and getter if not
     * specified, and binds the events.
     *
     * @param   {string}  name    The name  of the property.
     * @param   {(?{
     *   type:     (?string),
     *   setter:   (?function),
     *   getter:   (?function),
     *   value:    (?*)
     *   triggers: (?(string|array))
     *   dispatch: (?(string|array))
     * })}                options An object containing eventually some more
     *                            precise indications about the property.
     *
     * Here is the list of options that are interpreted:
     *
     *   type     Indicated the type of the property. Use "?" to specify a
     *            nullable property, and "|" for multiple valid types.
     *   setter   Overrides the default property setter.
     *   getter   Overrides the default property getter.
     *   value    The initial value of the property. If not specified, the
     *            value will be null if no type is specified, and the default
     *            empty value else.
     *   triggers The list of events that can modify the property. Can be an
     *            array or the list of events separated by spaces.
     *   dispatch The list of events that must be triggered after modification
     *            of the property. Can be an array or the list of events
     *            separated by spaces.
     */
    function addProperty(id, options) {
      var i,
          o = options || {};

      // Check errors:
      if (id === undefined)
        _self.die('Property name not specified');

      if (_properties[id] !== undefined)
        _self.die('Property "' + id + '" already exists');

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
    }

    /**
     * Binds a new hack. Basically, hacks make possible to explicitely
     * trigger actions and events on specified events.
     *
     * @param   {?Object} options An object containing some more precise
     *                            indications about the hack.
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
    }

    /**
     * TODO
     *
     * @param   {?Object} options An object containing some more precise
     *                            indications about the service.
     *
     * Here is the list of options that are interpreted:
     *
     *   {string}             id      The name of the property.
     *   {(string|function)}  url     The URL to call. If function, it will be
     *                                called with the provider as parameter and
     *                                it has to return the URL as a string.
     *   {?string}            type    The REST method to use (default: 'GET').
     *   {?(object|function)} params  If function, a function taking the
     *                                provider as parameter. Else, the different
     *                                params to send.
     *   {?(string|array)}    event   The event to dispatch after success.
     *   {?(string|array)}    json    "data", "content" or ["data","content"].
     *                                Indicated if the sent/received data is in
     *                                JSON.
     *   {?string}            setter  See below...
     *   {?(function|string)} success The function to call in case of success.
     *                                If not indicated, will try to set in the
     *                                provider the value named as this service
     *                                ID.
     *                                If a string, will split it on "." and call
     *                                the path in the "data" object before
     *                                calling the setter (like the "setter").
     *   {?function}          error   The function to call in case of error.
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
        var p = params || {};
            ajaxObj = {
              type: (p.type || o.type || 'GET').toString().toUpperCase(),
              data: _type.get(o.params) === 'function' ?
                      o.params.apply(_lightScope, p.params || []) :
                      (p.params || o.params),
              url: o['url'],
              error: p.error || o.error || function(mes, xhr) {
                _self.die('Loading failed with message "' + mes + '".');
              }
            };

        var i, exp, k, doTest,
            pref = __settings__['shortcutPrefix'],
            regexContains = new RegExp(pref + '\w*', 'g'),
            regexFull = new RegExp('^' + pref + '\w*$'),
            matches;

        // Manage shortcuts in URL:
        while (matches = p['url'].match(regexContains)) {
          for (i in matches) {
            exp = _expand(matches[i]);
            p['url'] = p['url'].replace(new RegExp(matches[i], 'g'), exp);
          }
        }

        // Manage shortcuts in params:
        // (NOT DEEP - only first level)
        doTest = true;
        if (_type.get(ajaxObj['data']) === 'string')
          if (ajaxObj['data'].match(regexFull))
            ajaxObj['data'] = _expand(ajaxObj['data']);

        if (_type.get(ajaxObj['data']) === 'object')
          while (doTest) {
            doTest = false;
            for (k in ajaxObj['data'])
              if (ajaxObj['data'][k].match(regexFull)) {
                ajaxObj['data'][k] = _expand(ajaxObj['data'][k]);
                doTest = true;
              }
          }

        // Success management:
        ajaxObj.success = function(data) {
          var i, a, pushEvents,
              dispatch = {},
              setter = p.setter || o.setter,
              success = p.success || o.success;

          // Events to dispatch (service config):
          a = _utils.array(o.events);
          for (i in a)
            dispatch[a[i]] = 1;

          // Events to dispatch (call config):
          a = _utils.array(p.events);
          for (i in a)
            dispatch[a[i]] = 1;

          // Check setter:
          if (setter && _setters[setter])
            if (_set(setter, data))
              for (k in _descending[setter] || [])
                dispatch[_descending[setter][k]] = 1;

          // Check setter:
          if (_type.get(success) === 'string' && _setters[success])
            if (_set(success, data))
              for (k in _descending[success] || [])
                dispatch[_descending[success][k]] = 1;
          else if (_type.get(success) === 'function')
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
      };
    }

    function addModule(klass, params, options) {
      var i,
          o = options || {},
          module = {},
          triggers,
          property,
          event;

      // Check errors:
      if (klass === undefined)
        _self.die('Module class not specified');

      if (_type.get(klass) !== 'function')
        _self.die('First parameter must be a function');

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
     * The main loop, that will update
     *
     * @param   {array}   events  [description].
     * @param   {?object} options [description].
     * @private
     */
    function _mainLoop(events, options) {
      _self.dump('Main loop', events, options);

      var a, i, j, k, event, data,
          o = options || {},
          dispatch = {};

      var eventsArray = _utils.array(events);
      for (i in eventsArray) {
        event = eventsArray[i];
        data = event.data || {};

        // Check properties to update:
        if (data || o['force']) {
          a = _ascending[event.type] || [];
          for (j in a) {
            var pushEvents = !!o['force'];

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

      a = [];
      for (event in dispatch) {
        _self.dispatchEvent(event, _lightScope);
        a.push(_self.getEvent(event, _lightScope));
      }

      // Reloop:
      if (a.length)
        _mainLoop(a, o);
    }

    function _update(options) {
      _self.dump('Updating', options);

      var i, k, a, event,
          o = options || {},
          dispatch = {};

      for (k in o) {
        if (_setters[k])
          _set(k, o[k]);

        for (i in _descending[k] || [])
          dispatch[_descending[k][i]] = 1;
      }

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

    function _getLabel(id) {
      return _labels[id];
    }

    function _getEvents(id) {
      return _events[id];
    }

    function _expand(v) {
      var a = (v || '').toString().match(
        new RegExp('^' + __settings__['shortcutPrefix'])
      );

      // Case where the string doesn't match:
      if (!a || !a.length)
        return v;
      a = a[0];

      // Check shortcuts:
      if (_type.get(_shortcuts[a]) === 'function')
        return _shortcuts[a].call(_fullScope);

      // Check properties:
      if (_type.get(_getters[a]) === 'function')
        return _get(a);

      return v;
    }

    this.addModule = addModule;
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
          ctyp = o.contenttype || 'application/x-www-form-urlencoded',
          dtyp = o.datatype || 'application/json',
          xhr = new XMLHttpRequest(),
          timer,
          d;

      if (o.data) {
        if (typeof o.data === 'string')
          d = o.data;
        else if (/json/.test(ctyp))
          d = JSON.stringify(o.data);
        else {
          d = [];
          for (var n in o.data)
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

          if (xhr.status >= 200) {
            d = xhr.responseText;
            if (/json/.test(dtyp)) {
              try {
                d = JSON.parse(xhr.responseText);
              } catch (e) {
                return (o.error &&
                  o.error('json parse error: ' + e.message, xhr));
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
        for (var n in o.headers)
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
     * @param  {string} events            The name of the event (or the events
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
     * @param  {?string} events            The name of the event (or the events
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
     * @param  {string} events The name of the event (or the events
     *                         separated by spaces).
     * @param  {?Object} data  The content of the event (optional).
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
     * @param  {string} events The name of the event.
     * @param  {?Object} data  The content of the event (optional).
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
