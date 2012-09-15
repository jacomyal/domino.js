(function(window) {
  var __settings = {
    strict: false,
    verbose: false
  };

  window.domino = window.domino || function() {
    // Misc:
    var _self = this,
        _instance = 'domino',
        _utils = window.domino.utils;

    // Properties management:
    var _types = {},
        _getters = {},
        _setters = {};
        _statics = {},
        _properties = {};

    // Communication management:
    var _ascending = {},
        _descending = {};

    // Hacks management:
    var _hackMethods = {},
        _hackDispatch = {};

    // AJAX management:
    var _services = {};

    // Scopes:
    var _publicScope = {},
        _privateScope = {};

    /**
     * References a new property, generated the setter and getter if not
     * specified, and binds the events.
     * 
     * @param   {string}  name    The name  of the property.
     * @param   {?Object} options An object containing eventually some more
     *                            precise indications about the property.
     *
     * 
     * Here is the list of options that are interpreted:
     * 
     *   {?string}         type     Indicated the type of the property. Use "?"
     *                              to specify a nullable property, and "|" for
     *                              multiple valid types.
     *   {?function(*)}    setter   Overrides the default property setter.
     *   {?(function: *)}  getter   Overrides the default property getter.
     *   {?*}              value    The initial value of the property. If not
     *                              specified, the value will be null if no
     *                              type is specified, and the default empty
     *                              value else.
     *   {?(string|array)} triggers The list of events that can modify the
     *                              property. Can be an array or the list of
     *                              events separated by spaces.
     *   {?(string|array)} dispatch The list of events that must be triggered
     *                              after modification of the property. Can be
     *                              an array or the list of events separated by
     *                              spaces.
     */
    function _addProperty(name, options) {
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

    function _step(events,options){
      var dispatch = {};

      events.forEach(function(event) {
        var data = event.data || {};

        // Check properties to update:
        (_ascending[event.name] || []).forEach(function(propName){
          if (data[proName] !== undefined) {
            _setters[propName](data[proName]);
            (_descending[propName] || []).forEach(function(descEvent) {
              dispatch[descEvent] = 1;
            });
          }
        });

        // Check hacks to trigger:
        (_hackMethods[event.name] || []).forEach(function(hack) {
          hack(event);
        });

        (_hackDispatch[event.name] || []).forEach(function(descEvent) {
          dispatch[descEvent] = 1;
        });
      });
      
      dispatch = Object.keys(dispatch);
      // TODO:
      //  - Dispatch events for the modules
      //  - Dispatch events for the self-loop
    }
  };

  // Logs:
  window.domino.prototype.fullName = function() {
    return this.name ? '[domino.' + this.name + ']' : '[domino]';
  };

  window.domino.prototype.warn = function(s) {
    if (__settings['strict']) {
      throw (new Error(this.fullName() + s));
    }else if (__settings['verbose']) {
      console.log(this.fullName() + s);
    }
  };

  window.domino.prototype.die = function(s) {
    throw (new Error(this.fullName() + s));
  };

  window.domino.prototype.dump = function(s) {
    if (__settings['verbose']) {
      console.log(this.fullName() + s);
    }
  };

  window.domino.utils = window.domino.utils || {
    array: function(v, sep) {
      return (
        window.domino.utils.type.get(v) === 'array' ?
          v :
          (v || '').toString().split(sep || ' ')
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
          }else {
            // TODO
          }
        },
        getDefault: function(type) {

        },
        isValid: function(type) {
          // TODO
        }
    })()
  };
})(window);
