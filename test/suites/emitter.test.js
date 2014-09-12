var assert = require('assert'),
    domino = require('../../src/domino.core.js');

describe('Emitter', function() {

  describe('basics', function() {
    var count = 0,
        instance = new domino.emitter(),
        callback = function() { count++; };

    it('dispatching an event with no callback does nothing.', function() {
      instance.emit('myEvent');
      assert.strictEqual(count, 0);
    });

    it('dispatching an event with a callback executes the callback.', function() {
      instance.on('myEvent', callback);
      instance.emit('myEvent');
      assert.strictEqual(count, 1);
    });

    it('dispatching an event with a callback than has been unbound does nothing.', function() {
      instance.off('myEvent', callback);
      instance.emit('myEvent');
      assert.strictEqual(count, 1);
    });
  });

  describe('api', function() {

    it('unbind polymorphisms should work.', function() {
      var count = 0,
          instance = new domino.emitter(),
          callback = function() { count++; };

      instance.on('myEvent', callback);
      instance.off('myEvent', callback);
      instance.emit('myEvent');
      assert.strictEqual(count, 0);

      instance.on('myEvent', callback);
      instance.off(['myEvent', 'anotherEvent'], callback);
      instance.emit('myEvent');
      assert.strictEqual(count, 0);

      instance.on('myEvent', callback);
      instance.off('myEvent');
      instance.emit('myEvent');
      assert.strictEqual(count, 0);

      instance.on('myEvent', callback);
      instance.off();
      instance.emit('myEvent');
      assert.strictEqual(count, 0);
    });

    it('bind polymorphisms should work.', function() {
      var count1 = 0,
          count2 = 0,
          instance = new domino.emitter(),
          callback1 = function() { count1++; },
          callback2 = function() { count2++; };

      instance.on('myEvent1', callback1);
      instance.emit('myEvent1');
      assert.strictEqual(count1, 1);
      instance.off();
      count1 = 0;

      instance.on(['myEvent1', 'myEvent2'], callback1);
      instance.emit('myEvent1');
      instance.emit('myEvent2');
      assert.strictEqual(count1, 2);
      instance.off();
      count1 = 0;

      instance.on(callback1);
      instance.emit('myEvent1');
      instance.emit('myEvent2');
      assert.deepEqual([count1, count2], [2, 0]);
      instance.off();
      count1 = 0;
      count2 = 0;

      instance.on({ myEvent1: callback1, myEvent2: callback2 });
      instance.emit('myEvent1');
      instance.emit('myEvent2');
      assert.deepEqual([count1, count2], [1, 1]);
      instance.off();
      count1 = 0;
      count2 = 0;
    });
  });
});
