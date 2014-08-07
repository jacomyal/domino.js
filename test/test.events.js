module('domino.triggerer');

test('Basics', function() {
  // 1. Basics
  var count = 0,
      instance = new domino.triggerer(),
      callback = function() { count++; };

  instance.trigger('myEvent');
  strictEqual(count, 0, 'Dispatching an event with no callback does nothing.');

  instance.on('myEvent', callback);
  instance.trigger('myEvent');
  strictEqual(count, 1, 'Dispatching an event with a callback executes the callback.');

  instance.off('myEvent', callback);
  instance.trigger('myEvent');
  strictEqual(count, 1, 'Dispatching an event with a callback than has been unbound does nothing.');
});

test('API', function() {
  // 1. "unbind" polymorphism
  var count = 0,
      instance = new domino.triggerer(),
      callback = function() { count++; };

  instance.on('myEvent', callback);
  instance.off('myEvent', callback);
  instance.trigger('myEvent');
  strictEqual(count, 0, 'unbind(event, handler) works.');

  instance.on('myEvent', callback);
  instance.off(['myEvent', 'anotherEvent'], callback);
  instance.trigger('myEvent');
  strictEqual(count, 0, 'unbind(event, handler) works.');

  instance.on('myEvent', callback);
  instance.off('myEvent');
  instance.trigger('myEvent');
  strictEqual(count, 0, 'unbind(event) works.');

  instance.on('myEvent', callback);
  instance.off();
  instance.trigger('myEvent');
  strictEqual(count, 0, 'unbind() works.');

  // 2. "bind" polymorphism
  var count1 = 0,
      count2 = 0,
      instance = new domino.triggerer(),
      callback1 = function() { count1++; },
      callback2 = function() { count2++; };

  instance.on('myEvent1', callback1);
  instance.trigger('myEvent1');
  strictEqual(count1, 1, 'bind(event, handler) works.');
  instance.off('myEvent1');
  count1 = 0;

  instance.on(['myEvent1', 'myEvent2'], callback1);
  instance.trigger('myEvent1');
  instance.trigger('myEvent2');
  strictEqual(count1, 2, 'bind(["event1", "event2"], handler) works.');
  instance.off(['myEvent1', 'myEvent2']);
  count1 = 0;

  instance.on({ myEvent1: callback1, myEvent2: callback2 });
  instance.trigger('myEvent1');
  instance.trigger('myEvent2');
  deepEqual([count1, count2], [1, 1], 'bind({ event1: callback1, event2: callback2, }, handler) works.');
  instance.off(['myEvent1', 'myEvent2']);
  count1 = 0;
  count2 = 0;
});
