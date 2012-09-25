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
        _utils = window.domino.utils;

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
    var _services = {};

    // Scopes:
    var _lightScope = {
          get: _getters,
          dump: self.dump,
          warn: self.warn,
          die: self.die,
          events: _getEvents,
          label: _getLabel
        },
        _fullScope = {
          get: _getters,
          set: _setters,
          dump: self.dump,
          warn: self.warn,
          die: self.die,
          events: _getEvents,
          label: _getLabel,
          update: _update
        };

    // Initialization:
    var _o = {};
    this.name = 'domino';

    if (_utils.type.get(arguments[0]) === 'string')
      this.name = arguments[0];
    else if (
      arguments[0] !== undefined &&
      _utils.type.get(arguments[0]) === 'object'
    )
      _o = arguments[0];
    else if (
      arguments[1] !== undefined &&
      _utils.type.get(arguments[1]) === 'object'
    )
      _o = arguments[1];

    this.name = _o['name'] || this.name;

    (_o.properties || []).forEach(function(p) {
      addProperty(p.id, p);
    });

    (_o.hacks || []).forEach(function(h) {
      addHack(h);
    });


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
      var o = options || {};

      // Check errors:
      if (id === undefined)
        _self.die('Property name not specified');

      if (_properties[id] !== undefined)
        _self.die('Property "' + id + '" already exists');

      // Label:
      _labels[id] = o['label'] || id;

      // Type:
      if (o['type'] !== undefined)
        !_utils.type.isValid(o['type']) ?
          _self.warn(
            'Property "' + id + '": Type not valid'
          ) :
          (_types[id] = o['type']);

      // Setter:
      if (o['setter'] !== undefined)
        !_utils.type.get(o['setter']) !== 'function' ?
          _self.warn(
            'Property "' + id + '": Setter is not a function'
          ) :
          (_setters[id] = o['setter']);

      _setters[id] = _setters[id] || function(v) {
        if (v === _properties[id])
          return false;

        (_types[id] && !_utils.type.check(_types[id], v)) ?
          _self.warn(
            'Property "' + id + '": Wrong type error'
          ) :
          (_properties[id] = v);

        return true;
      };

      // Getter:
      if (o['getter'] !== undefined)
        !_utils.type.get(o['getter']) !== 'function' ?
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
            _setters[id](o['value']) :
            _self.warn(
              'Property "' + id + '": ' +
                'Initial value is missing'
            );

      // Triggers (modules-to-domino events):
      if (o['triggers'] !== undefined) {
        !_utils.type.check('array|string', o['triggers']) &&
          _self.warn(
            'Property "' + id + '": ' +
              'Events ("triggers") must be specified in an array or ' +
              'separated by spaces in a string'
          );

        _events[id] = _utils.array(o['triggers']);
        _utils.array(o['triggers']).forEach(function(event) {
          _ascending[event] = _ascending[event] || [];
          _ascending[event].push(id);
        });
      }

      // Dispatched events (domino-to-modules event):
      if (o['dispatch'] !== undefined)
        !_utils.type.check('array|string', o['dispatch']) ?
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
      var o = options || {};

      // Errors:
      if (o['triggers'] === undefined)
        _self.die(
          'A hack requires at least one trigger to be added'
        );

      _utils.array(o['triggers']).forEach(function(event) {
        // Method to execute:
        if (o['method']) {
          _hackMethods[event] = _hackMethods[event] || [];
          _hackMethods[event].push(o['method']);
        }

        // Events to dispatch:
        if (o['dispatch'])
          _hackDispatch[event] = (_hackDispatch[event] || []).concat(
            _utils.array(o['dispatch'])
          );
      });
    }

    function addModule(klass, params, options) {
      var o = options || {},
          module = {},
          triggers,
          property,
          event;

      // Check errors:
      if (klass === undefined)
        _self.die('Module class not specified');

      if (_utils.type.get(klass) !== 'function')
        _self.die('First parameter must be a function');

      // Instanciate the module:
      klass.apply(module, (params || []).concat([_lightScope]));
      triggers = module.triggers || {};

      // Ascending communication:
      for (event in triggers.events || {})
        _self.addEventListener(event, triggers.events[event]);

      for (property in triggers.properties || {}) {
        (_descending[property] || []).forEach(function(event) {
          _self.addEventListener(event, triggers.properties[property]);
        });

        if (_getters[property] !== undefined) {
          var data = {};
          data[property] = _getters[property]();
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

      var o = options || {},
          dispatch = {};

      var eventsArray = _utils.array(events);

      eventsArray.forEach(function(event) {
        var data = event.data || {};
        // Check properties to update:
        if (data || o['force'])
          (_ascending[event.type] || []).forEach(function(propName) {
            var pushEvents = !!o['force'];

            if (data[propName] !== undefined)
              pushEvents = _setters[propName].call(
                _fullScope,
                data[propName]
              ) || pushEvents;

            if (pushEvents)
              (_descending[propName] || []).forEach(function(descEvent) {
                dispatch[descEvent] = 1;
              });
          });

        // Check hacks to trigger:
        (_hackMethods[event.type] || []).forEach(function(hack) {
          hack.call(_fullScope, event);
        });

        (_hackDispatch[event.type] || []).forEach(function(descEvent) {
          dispatch[descEvent] = 1;
        });
      });

      dispatch = Object.keys(dispatch).map(function(event) {
        _self.dispatchEvent(event, _lightScope);
        return _self.getEvent(event, _lightScope);
      });

      // Reloop:
      if (dispatch.length)
        _mainLoop(dispatch, o);
    }

    function _update(options) {
      _self.dump('Updating', options);

      var o = options || {},
          dispatch = {},
          k;

      for (k in o) {
        if (_setters[k])
          _setters[k](o[k]);

        (_descending[k] || []).forEach(function(descEvent) {
          dispatch[descEvent] = 1;
        });
      }

      dispatch = Object.keys(dispatch).map(function(event) {
        _self.dispatchEvent(event, _lightScope);
        return _self.getEvent(event, _lightScope);
      });

      // Reloop:
      if (dispatch.length)
        _mainLoop(dispatch, o);
    }

    function _getLabel(id) {
      return _labels[id];
    }

    function _getEvents(id) {
      return _events[id];
    }

    this.addModule = addModule;
  };
  var domino = window.domino;


  /**
   * Utils classes:
   */

  // Logs:
  domino.prototype.warn = function(s) {
    if (__settings__['strict'])
      throw (new Error('[' + this.name + '] ' + s));
    else if (__settings__['verbose'])
      console.log('[' + this.name + '] ' + s);
  };

  domino.prototype.die = function(s) {
    throw (new Error('[' + this.name + '] ' + s));
  };

  domino.prototype.dump = function() {
    if (!__settings__['verbose'])
      return this;

    var a = ['[' + this.name + ']'];
    for (var k in arguments)
      a.push(arguments[k]);

    console.log.apply(console, a);
  };

  // Utils:
  domino.utils = {
    array: function(v, sep) {
      return (
        domino.utils.type.get(v) === 'string' ?
          v.split(sep || ' ') :
          domino.utils.type.get(v) === 'array' ?
            v :
            [v]
      ).filter(function(s) {
        return !!s;
      });
    },
    unique: function(a) {
      var u = {},
          res = [];

      for (var i = 0, l = a.length; i < l; ++i) {
        if (!u[a[i]]) {
          res.push(a[i]);
          u[a[i]] = 1;
        }
      }
      return res;
    },
    type: (function() {
      var class2type = (
            'Boolean Number String Function Array Date RegExp Object'
          ).split(' ').reduce(function(o, name) {
            o['[object ' + name + ']'] = name.toLowerCase();
            return o;
          },{}),
          types = Object.keys(class2type).map(function(k) {
            return class2type[k];
          }).concat('*');

      return {
        get: function(obj) {
          return obj == null ?
            String(obj) :
            class2type[Object.prototype.toString.call(obj)] || 'object';
        },
        check: function(type, obj) {
          var typeOf = this.get(obj);
          if (this.get(type) === 'string') {
            if (obj == null)
              return !!type.match(/^\?/, '');
            else
              type = type.replace(/^\?/, '');

            var types = type.split(/\|/);

            return !!(~types.indexOf('*') || ~types.indexOf(typeOf));
          } else if (this.get(type) === 'object') {
            if (typeOf !== 'object')
              return false;

            for (var k in type)
              if (!this.check(type[k], obj[k]))
                return false;

            return true;
          } else
            return false;
        },
        isValid: function(type) {
          if (this.get(type) === 'string')
            return !type.replace(/^\?/, '').split(/\|/).some(function(t) {
              return types.indexOf(t) < 0;
            });
          else if (this.get(type) === 'object') {
            for (var k in type)
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
    verbose: false
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
        var events = arguments[0],
            handler = arguments[1],
            eArray = utils.array(events),
            self = this;

        eArray.forEach(function(event) {
          if (!_handlers[event]) {
            _handlers[event] = [];
          }

          // Using an object instead of directly the handler will make possible
          // later to add flags
          _handlers[event].push({
            handler: handler
          });
        });
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

      var eArray = utils.array(events),
          self = this;

      if (handler) {
        eArray.forEach(function(event) {
          if (_handlers[event]) {
            _handlers[event] = _handlers[event].filter(function(e) {
              return e.handler !== handler;
            });
          }

          if (_handlers[event] && _handlers[event].length === 0)
            delete _handlers[event];
        });
      } else
        eArray.forEach(function(event) {
          delete _handlers[event];
        });

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
      var event,
          eArray = utils.array(events),
          self = this;

      data = data === undefined ? {} : data;

      eArray.forEach(function(eventName) {
        if (_handlers[eventName]) {
          event = self.getEvent(eventName, data);

          _handlers[eventName].forEach(function(e) {
            e.handler(event);
          });

          _handlers[eventName] =
            _handlers[eventName].filter(function(e) {
              return !e['one'];
            });
        }
      });

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
