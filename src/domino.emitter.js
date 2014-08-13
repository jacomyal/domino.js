'use strict';

var emitter = function() {
  this._handlers = {};
  this._handlersAll = [];
};

emitter.prototype.on = function(events, handler) {
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
    arguments.length === 1 &&
    typeof arguments[0] === 'function'
  )
    this._handlersAll.push({
      handler: arguments[0]
    });

  else if (
    arguments.length === 2 &&
    typeof arguments[1] === 'function'
  ) {
    eArray = typeof events === 'string' ?
      [events] :
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
    throw 'emitter.on: Wrong arguments.';

  return this;
};

emitter.prototype.off = function(events, handler) {
  var i,
      n,
      j,
      m,
      k,
      a,
      event,
      eArray = typeof events === 'string' ?
        [events] :
        events;

  if (!arguments.length) {
    this._handlersAll = [];
    for (k in this._handlers)
      delete this._handlers[k];
  }

  else if (arguments.length === 1 && typeof eArray !== 'function')
    for (i = 0, n = eArray.length; i !== n; i += 1)
      delete this._handlers[eArray[i]];

  else if (arguments.length === 1 && typeof eArray === 'function') {
    handler = arguments[0];

    // Handlers bound to events:
    for (k in this._handlers) {
      a = [];
      for (i = 0, n = this._handlers[k].length; i !== n; i += 1)
        if (this._handlers[k][i].handler !== handler)
          a.push(this._handlers[k][i]);
      this._handlers[k] = a;
    }

    a = [];
    for (i = 0, n = this._handlersAll.length; i !== n; i += 1)
      if (this._handlersAll[i].handler !== handler)
        a.push(this._handlersAll[i]);
    this._handlersAll = a;
  }

  else if (arguments.length === 2) {
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
  }

  return this;
};

emitter.prototype.emit = function(events, data) {
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
        [events] :
        events;

  data = data === undefined ? {} : data;

  for (i = 0, n = eArray.length; i !== n; i += 1) {
    eventName = eArray[i];
    handlers = (this._handlers[eventName] || []).concat(this._handlersAll);

    if (handlers.length) {
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

module.exports = emitter;
