(function(window) {
  // Check domino.js existance:
  if (window.domino) {
    throw new Error('domino already exists');
  }

  var domino =
  window.domino = function(name) {
    this.name = name || 'domino';

    // Misc:
    var _self = this,
        _instance = 'domino',
        _utils = window.domino.utils;

    // Properties management:
    var _types = {},
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
    var _eventsScope = {
      get: _getters
    };

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
    function addProperty(name, options) {
      var o = options || {};

      // Check errors:
      (name === undefined) &&
        _self.die('Property name not specified');

      (_properties[name] !== undefined) &&
        _self.die('Property "' + name + '" already exists');

      // Type:
      if (o['type'] !== undefined)
        !_utils.type.isValid(o['type']) ?
          _self.warn(
            'Property "' + name + '": Type not valid'
          ) :
          (_types[name] = o['type']);

      // Setter:
      if (o['setter'] !== undefined)
        !_utils.type.get(o['setter']) !== 'function' ?
          _self.warn(
            'Property "' + name + '": Setter is not a function'
          ) :
          (_setters[name] = o['setter']);

      _setters[name] = _setters[name] || function(v) {
        (_types[name] && !_utils.type.check(_types[name], v)) ?
          _self.warn(
            'Property "' + name + '": Wrong type error'
          ) :
          (_properties[name] = v);
      };

      // Getter:
      if (o['getter'] !== undefined)
        !_utils.type.get(o['getter']) !== 'function' ?
          _self.warn(
            'Property "' + name + '": Getter is not a function'
          ) :
          (_getters[name] = o['getter']);

      _setters[name] = _setters[name] || function() {
        return _properties[name];
      };

      // Initial value:
      if (o['value'] !== undefined || _types[name])
        _setters[name](
          o['value'] !== undefined ?
            o['value'] :
            _utils.type.getDefault(_types[name])
        );

      // Triggers (modules-to-domino events):
      if (o['triggers'] !== undefined)
        !_utils.type.check(o['triggers'], 'array|string') ?
          _self.warn(
            'Property "' + name + '":' +
              'Events ("triggers") must be specified in an array or ' +
              'separated by spaces in a string'
          ) :
          utils.array(_o['triggers']).forEach(function(event) {
            _ascending[event] = _ascending[event] || [];
            _ascending[event].push(name);
          });

      // Dispatched events (domino-to-modules event):
      if (o['dispatch'] !== undefined)
        !_utils.type.check(o['dispatch'], 'array|string') ?
          _self.warn(
            'Property "' + name + '":' +
              'Events ("dispatch") must be specified in an array or ' +
              'separated by spaces in a string'
          ) :
          (_descending[name] = utils.array(_o['dispatch']));
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
      (o['triggers'] === undefined) &&
        _self.die(
          'A hack requires at least one trigger to be added'
        );

      utils.array(o['triggers']).forEach(function(event) {
        // Method to execute:
        if (o['method']) {
          _hackMethods[event] = _hackMethods[event] || [];
          _hackMethods[event].push(o['method']);
        }

        // Events to dispatch:
        if (o['dispatch']) {
          _hackDispatch[event] = (_hackDispatch[event] || []).concat(
            utils.array(o['dispatch'])
          );
        }
      });
    }

    function addModule(klass, options) {
      var o = options || {},
          module = {},
          event;

      // Check errors:
      (klass === undefined) &&
        _self.die('Module class not specified');

      !_utils.type.check(klass, 'function') &&
        _self.die('First parameter must be a function');

      // Instanciate the module:
      klass.call(module);

      // Ascending communication:
      for (event in module.triggers || {}) {
        _self.addEventListener(event, module.triggers[event]);
      }

      // Descending communication:
      for (event in module.triggers || {}) {
        _self.addEventListener(event, module.triggers[event]);
      }

      // TODO
      klass;

    }

    /**
     * The main loop, that will update
     *
     * @param   {array}   events  [description].
     * @param   {?object} options [description].
     * @private
     */
    function _mainLoop(events, options) {
      var o = options || {},
          dispatch = {};

      events.forEach(function(event) {
        var data = event.data || {};

        // Check properties to update:
        (data || o['force']) &&
          (_ascending[event.name] || []).forEach(function(propName) {
            var pushEvents = !!o['force'];

            if (data[proName] !== undefined) {
              // TODO: Precise scope
              pushEvents = _setters[propName](data[proName]) || pushEvents;
            }

            pushEvents &&
              (_descending[propName] || []).forEach(function(descEvent) {
                dispatch[descEvent] = 1;
              });
          });

        // Check hacks to trigger:
        (_hackMethods[event.name] || []).forEach(function(hack) {
          // TODO: Precise scope
          hack(event);
        });

        (_hackDispatch[event.name] || []).forEach(function(descEvent) {
          dispatch[descEvent] = 1;
        });
      });

      // TODO:
      //  - Dispatch events for the modules
      dispatch = Object.keys(dispatch).map(function(event) {
        _self.dispatchEvent(event, _eventsScope);
        return _self.getEvent(event, _eventsScope);
      });

      // Reloop:
      dispatch.length &&
        _mainLoop(dispatch, o);
    }
  };


  /**
   * Utils classes:
   */

  // Logs:
  domino.prototype.warn = function(s) {
    if (__settings__['strict']) {
      throw (new Error('[' + this.name + '] ' + s));
    } else if (__settings__['verbose']) {
      console.log('[' + this.name + '] ' + s);
    }
  };

  domino.prototype.die = function(s) {
    throw (new Error('[' + this.name + '] ' + s));
  };

  domino.prototype.dump = function(s) {
    if (__settings__['verbose']) {
      console.log('[' + this.name + '] ' + s);
    }
  };

  // Utils:
  var utils =
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
      // Thanks jQuery:
      var class2type = (
        'Boolean Number String Function Array Date RegExp Object'
      ).split(' ').reduce(function(o, name) {
        o['[object ' + name + ']'] = name.toLowerCase();
        return o;
      },{});

      return {
        get: function(obj) {
          return obj == null ?
            String(obj) :
            class2type[Object.prototype.toString.call(obj)] || 'object';
        },
        check: function(type, obj) {
          if (typeof type == 'string') {
            // TODO
          } else {
            // TODO
          }
        },
        getDefault: function(type) {
          // TODO
        },
        isValid: function(type) {
          // TODO
        }
      };
    })()
  };

  // Global settings:
  var __settings__ = {
    strict: false,
    verbose: false
  };

  domino.settings = function(a1, a2) {
    if (typeof a1 === 'string' && a2 === undefined) {
      return __settings__[a1];
    } else {
      var o = (typeof a1 === 'object' && a2 === undefined) ? a1 : {};
      if (typeof a1 === 'string') {
        o[a1] = a2;
      }

      for (var k in o) {
        if (__settings__[k] !== undefined) {
          __settings__[k] = o[k];
        }
      }
      
      return this;
    }
  };

  // Default module template:
  var module =
  domino.module = function() {
    dispatcher.call(this);

    // In this object will be stored the module's triggers:
    this.triggers = {};
  };

  // Event dispatcher:
  var dispatcher =
  domino.EventDispatcher = function() {
    this._handlers_ = {};
  };

  /**
   * Will execute the handler everytime that the indicated event (or the
   * indicated events) will be triggered.
   * @param  {string} events            The name of the event (or the events
   *                                    separated by spaces).
   * @param  {function(Object)} handler The handler to addEventListener.
   * @return {EventDispatcher} Returns itself.
   */
  dispatcher.prototype.addEventListener = function(events, handler) {
    if (!arguments.length) {
      return this;
    }else if (
      arguments.length === 1 &&
      utils.type.get(arguments[0]) === 'object'
    ) {
      for (var events in arguments[0]) {
        this.addEventListener(events, arguments[0][events]);
      }
    }else if (arguments.length > 1) {
      var events = arguments[0],
          handler = arguments[1],
          eArray = utils.array(events),
          self = this;

      eArray.forEach(function(event) {
        if (!self._handlers_[event]) {
          self._handlers_[event] = [];
        }

        // Using an object instead of directly the handler will make possible
        // later to add flags
        self._handlers_[event].push({
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
   * @param  {?function(Object)} handler The handler to removeEventListener. If
   *                                     undefined, each handler bound to the
   *                                     event or the events will be removed.
   * @return {EventDispatcher} Returns itself.
   */
  dispatcher.prototype.removeEventListener = function(events, handler) {
    if (!arguments.length) {
      this._handlers_ = {};
      return this;
    }

    var eArray = utils.array(events),
        self = this;

    if (handler) {
      eArray.forEach(function(event) {
        if (self._handlers_[event]) {
          self._handlers_[event] = self._handlers_[event].filter(function(e) {
            return e.handler !== handler;
          });
        }

        if (self._handlers_[event] && self._handlers_[event].length === 0) {
          delete self._handlers_[event];
        }
      });
    }else {
      eArray.forEach(function(event) {
        delete self._handlers_[event];
      });
    }

    return self;
  };

  /**
   * Executes each handler bound to the event
   * @param  {string} events The name of the event (or the events
   *                         separated by spaces).
   * @param  {?Object} data  The content of the event (optional).
   * @return {EventDispatcher} Returns itself.
   */
  dispatcher.prototype.dispatchEvent = function(events, data) {
    var event,
        eArray = utils.array(events),
        self = this;

    data = data === undefined ? {} : data;

    eArray.forEach(function(eventName) {
      if (self._handlers_[eventName]) {
        event = self.getEvent(eventName, data);

        self._handlers_[eventName].forEach(function(e) {
          e.handler(event);
        });

        self._handlers_[eventName] =
          self._handlers_[eventName].filter(function(e) {
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
  dispatcher.prototype.getEvent = function(event, data) {
    return {
      type: event,
      data: data,
      target: this
    };
  };
})(window);
