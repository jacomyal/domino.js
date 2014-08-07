'use strict';

var triggerer = function() {
  Object.defineProperty(this, '_handlers', {
    value: {}
  });
};

triggerer.prototype.on = function(events, handler) {
  var i,
      l,
      event,
      eArray;

  if (
    arguments.length === 1 &&
    typeof arguments[0] === 'object'
  )
    for (event in arguments[0])
      this.on(event, arguments[0][event]);

  else if (
    arguments.length === 2 &&
    typeof arguments[1] === 'function'
  ) {
    eArray = typeof events === 'string' ?
      [ events ] :
      events;

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
    throw 'triggerer.on: Wrong arguments.';

  return this;
};

triggerer.prototype.off = function(events, handler) {
  var i,
      n,
      j,
      m,
      k,
      a,
      event,
      eArray = typeof events === 'string' ?
        [ events ] :
        events;

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

triggerer.prototype.trigger = function(events, data) {
  var i,
      n,
      j,
      m,
      a,
      event,
      handlers,
      eventName,
      self = this,
      eArray = typeof events === 'string' ?
        [ events ] :
        events;

  data = data === undefined ? {} : data;

  for (i = 0, n = eArray.length; i !== n; i += 1) {
    eventName = eArray[i];
    handlers = this._handlers[eventName];

    if (handlers && handlers.length) {
      event = {
        type: eventName,
        data: data || {},
        target: this
      };
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

module.exports = triggerer;
