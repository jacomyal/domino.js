'use strict';


/**
 * The emitter's constructor. It initializes the handlers-per-events store and
 * the global handlers store.
 *
 * Emitters are useful for non-DOM events communication. Read its methods
 * documentation for more information about how it works.
 *
 * @return {Emitter} The fresh new instance.
 */
var Emitter = function() {
  this._handlers = {};
  this._handlersAll = [];
};


/**
 * This method binds one or more functions to the emitter, handled to one or a
 * suite of events. So, these functions will be executed anytime one related
 * event is emitted.
 *
 * It is also possible to bind a function to any emitted event by not specifying
 * any event to bind the function to.
 *
 * Variant 1:
 * **********
 * > myEmitter.on('myEvent', function(e) { console.log(e); });
 *
 * @param  {string}   event   The event to listen to.
 * @param  {function} handler The function to bind.
 * @return {Emitter}          Returns this.
 *
 * Variant 2:
 * **********
 * > myEmitter.on(['myEvent1', 'myEvent2'], function(e) { console.log(e); });
 *
 * @param  {array}    events  The events to listen to.
 * @param  {function} handler The function to bind.
 * @return {Emitter}          Returns this.
 *
 * Variant 3:
 * **********
 * > myEmitter.on({
 * >   myEvent1: function(e) { console.log(e); },
 * >   myEvent2: function(e) { console.log(e); }
 * > });
 *
 * @param  {object} bindings An object containing pairs event / function.
 * @return {Emitter}         Returns this.
 *
 * Variant 4:
 * **********
 * > myEmitter.on(function(e) { console.log(e); });
 *
 * @param  {function} handler The function to bind to every events.
 * @return {Emitter}          Returns this.
 */
Emitter.prototype.on = function(events, handler) {
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


/**
 * This method unbinds one or more functions from events of the emitter. So,
 * these functions will no more be executed when the related events are emitted.
 * If the functions were not bound to the events, nothing will happen, and no
 * error will be thrown.
 *
 * It is also possible to unbind a function from every AND any emitted event by
 * not specifying any event to bind the function to.
 *
 * Variant 1:
 * **********
 * > myEmitter.off('myEvent');
 *
 * @param  {string} event The event to unbind.
 * @return {Emitter}      Returns this.
 *
 * Variant 1:
 * **********
 * > myEmitter.off(['myEvent1', 'myEvent2']);
 *
 * @param  {array} events The events to unbind.
 * @return {Emitter}      Returns this.
 *
 * Variant 2:
 * **********
 * > myEmitter.off(['myEvent1', 'myEvent2'], myHandler);
 *
 * @param  {array}    events  The events to unbind to.
 * @param  {function} handler The function to unbind.
 * @return {Emitter}          Returns this.
 *
 * Variant 3:
 * **********
 * > myEmitter.off({
 * >   myEvent1: myHandler1,
 * >   myEvent2: myHandler2
 * > });
 *
 * @param  {object} bindings An object containing pairs event / function.
 * @return {Emitter}         Returns this.
 *
 * Variant 4:
 * **********
 * > myEmitter.off(myHandler);
 *
 * @param  {function} handler The function to unbind to every events.
 * @return {Emitter}          Returns this.
 */
Emitter.prototype.off = function(events, handler) {
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


/**
 * This method emits the specified event(s), and executes every handlers bound
 * to the event(s).
 *
 * Use cases:
 * **********
 * > myEmitter.emit('myEvent');
 * > myEmitter.emit('myEvent', myData);
 * > myEmitter.emit(['myEvent1', 'myEvent2']);
 * > myEmitter.emit(['myEvent1', 'myEvent2'], myData);
 *
 * @param  {string|array} events The event(s) to emit.
 * @param  {object?}      data   The data.
 * @return {Emitter}             Returns this.
 */
Emitter.prototype.emit = function(events, data) {
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


// Export:
module.exports = Emitter;
