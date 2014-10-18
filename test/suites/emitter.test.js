var assert = require('assert'),
    domino = require('../../src/domino.core.js');

describe('Emitter', function() {
  describe('basics', function() {
    var count = 0,
        emitter = new domino.emitter(),
        callback = function(e) {
          count += e.data.count || 1;
        };

    it('dispatching an event with no trigger does nothing.', function() {
      emitter.emit('myEvent');
      assert.strictEqual(count, 0);
    });

    it('dispatching an event with a trigger executes the callback.', function() {
      emitter.on('myEvent', callback);
      emitter.emit('myEvent');
      assert.strictEqual(count, 1);
    });

    it('dispatching an event with a trigger executes the callback.', function() {
      emitter.emit('myEvent', { count: 2 });
      assert.strictEqual(count, 3);
    });

    it('dispatching an event with a trigger than has been unbound does nothing.', function() {
      emitter.off('myEvent', callback);
      emitter.emit('myEvent');
      assert.strictEqual(count, 3);
    });
  });

  describe('api', function() {
    it('unbind polymorphisms should work.', function() {
      var count = 0,
          emitter = new domino.emitter(),
          callback = function() { count++; };

      emitter.on('myEvent', callback);
      emitter.off('myEvent', callback);
      emitter.emit('myEvent');
      assert.strictEqual(count, 0);

      emitter.on('myEvent', callback);
      emitter.off(['myEvent', 'anotherEvent'], callback);
      emitter.emit('myEvent');
      assert.strictEqual(count, 0);

      emitter.on('myEvent', callback);
      emitter.off('myEvent');
      emitter.emit('myEvent');
      assert.strictEqual(count, 0);

      emitter.on('myEvent', callback);
      emitter.off();
      emitter.emit('myEvent');
      assert.strictEqual(count, 0);
    });

    it('bind polymorphisms should work.', function() {
      var count1 = 0,
          count2 = 0,
          emitter = new domino.emitter(),
          callback1 = function() { count1++; },
          callback2 = function() { count2++; };

      emitter.on('myEvent1', callback1);
      emitter.emit('myEvent1');
      assert.strictEqual(count1, 1);
      emitter.off();
      count1 = 0;

      emitter.on(['myEvent1', 'myEvent2'], callback1);
      emitter.emit('myEvent1');
      emitter.emit('myEvent2');
      assert.strictEqual(count1, 2);
      emitter.off();
      count1 = 0;

      emitter.on(callback1);
      emitter.emit('myEvent1');
      emitter.emit('myEvent2');
      assert.deepEqual([count1, count2], [2, 0]);
      emitter.off();
      count1 = 0;
      count2 = 0;

      emitter.on({ myEvent1: callback1, myEvent2: callback2 });
      emitter.emit('myEvent1');
      emitter.emit('myEvent2');
      assert.deepEqual([count1, count2], [1, 1]);
      emitter.off();
      count1 = 0;
      count2 = 0;
    });
  });
});

describe('Binder', function() {
  describe('basics', function() {
    var count1,
        count2,
        emitter = new domino.emitter(),
        callback1 = function() { count1++; },
        callback2 = function() { count2++; },
        binder = emitter.binder({ myEvent1: callback1 });

    it('creating a binding binds the related functions.', function() {
      count1 = 0;
      emitter.emit('myEvent1');
      assert.strictEqual(count1, 1);
    });

    it('binder.on binds functions to the related emitter.', function() {
      count2 = 0;
      binder.on('myEvent2', callback2);
      emitter.emit('myEvent2');
      assert.strictEqual(count2, 1);
    });

    it('binder.off unbinds functions from the related emitter.', function() {
      count2 = 0;
      binder.off('myEvent2', callback2);
      emitter.emit('myEvent2');
      assert.strictEqual(count2, 0);
    });

    it('binder.disable unbinds all functions from the related emitter.', function() {
      count1 = 0;
      binder.disable();
      emitter.emit('myEvent1');
      assert.strictEqual(count1, 0);
    });

    it('binder.enable rebinds all functions to the related emitter.', function() {
      count1 = 0;
      binder.enable();
      emitter.emit('myEvent1');
      assert.strictEqual(count1, 1);
    });
  });

  describe('api', function() {
    it('unbind polymorphisms should work.', function() {
      var count = 0,
          emitter = new domino.emitter(),
          callback = function() { count++; },
          binder = emitter.binder();

      binder.on('myEvent', callback);
      binder.off('myEvent', callback);
      emitter.emit('myEvent');
      assert.strictEqual(count, 0);

      binder.on('myEvent', callback);
      binder.off(['myEvent', 'anotherEvent'], callback);
      emitter.emit('myEvent');
      assert.strictEqual(count, 0);

      binder.on('myEvent', callback);
      binder.off('myEvent');
      emitter.emit('myEvent');
      assert.strictEqual(count, 0);

      binder.on('myEvent', callback);
      binder.off();
      emitter.emit('myEvent');
      assert.strictEqual(count, 0);
    });

    it('bind polymorphisms should work.', function() {
      var count1 = 0,
          count2 = 0,
          emitter = new domino.emitter(),
          callback1 = function() { count1++; },
          callback2 = function() { count2++; },
          binder = emitter.binder();

      binder.on('myEvent1', callback1);
      emitter.emit('myEvent1');
      assert.strictEqual(count1, 1);
      binder.off();
      count1 = 0;

      binder.on(['myEvent1', 'myEvent2'], callback1);
      emitter.emit('myEvent1');
      emitter.emit('myEvent2');
      assert.strictEqual(count1, 2);
      binder.off();
      count1 = 0;

      binder.on(callback1);
      emitter.emit('myEvent1');
      emitter.emit('myEvent2');
      assert.deepEqual([count1, count2], [2, 0]);
      binder.off();
      count1 = 0;
      count2 = 0;

      binder.on({ myEvent1: callback1, myEvent2: callback2 });
      emitter.emit('myEvent1');
      emitter.emit('myEvent2');
      assert.deepEqual([count1, count2], [1, 1]);
      binder.off();
      count1 = 0;
      count2 = 0;
    });
  });
});
