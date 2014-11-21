var assert = require('assert'),
    domino = require('../../src/domino.core.js');

describe('Frames injection ("breadthFirstSearch" set to true)', function() {
  it('should inject a frame before updating a property', function(done) {
    var c = new domino({
      properties: {
        myProp: '?string'
      }
    });

    assert.deepEqual(c.get('myProp'), undefined);

    c.update('myProp', 'abc');
    assert.deepEqual(c.get('myProp'), undefined);

    setTimeout(function() {
      assert.deepEqual(c.get('myProp'), 'abc');
      done();
    }, 0);
  });

  it('should inject a frame before emitting an event', function(done) {
    var i = 0,
        c = new domino({
          bindings: {
            myEvent: function() {
              i++;
            }
          }
        });

    assert.deepEqual(i, 0);

    c.emit('myEvent');
    assert.deepEqual(i, 0);

    setTimeout(function() {
      assert.deepEqual(i, 1);
      done();
    }, 0);
  });

  it('should skip frame injection when calling #go', function(done) {
    var i = 0,
        c = new domino({
          properties: {
            myProp: '?string'
          },
          bindings: {
            myEvent: function() {
              i++;
            }
          }
        });

    assert.deepEqual(i, 0);
    assert.deepEqual(c.get('myProp'), undefined);

    c.emit('myEvent')
     .update('myProp', 'abc')
     .go();

    assert.deepEqual(i, 1);
    assert.deepEqual(c.get('myProp'), 'abc');

    setTimeout(function() {
      assert.deepEqual(i, 1);
      assert.deepEqual(c.get('myProp'), 'abc');
      done();
    }, 0);
  });
});

describe('Synchronous workflow ("breadthFirstSearch" set to false)', function() {
  it('should not inject any frame before updating a property', function(done) {
    var c = new domino({
      properties: {
        myProp: '?string'
      },
      settings: {
        breadthFirstSearch: false
      }
    });

    assert.deepEqual(c.get('myProp'), undefined);

    c.update('myProp', 'abc');
    assert.deepEqual(c.get('myProp'), 'abc');

    setTimeout(function() {
      assert.deepEqual(c.get('myProp'), 'abc');
      done();
    }, 0);
  });

  it('should inject a frame before emitting an event', function(done) {
    var i = 0,
        c = new domino({
          bindings: {
            myEvent: function() {
              i++;
            }
          },
          settings: {
            breadthFirstSearch: false
          }
        });

    assert.deepEqual(i, 0);

    c.emit('myEvent');
    assert.deepEqual(i, 1);

    setTimeout(function() {
      assert.deepEqual(i, 1);
      done();
    }, 0);
  });

  it('should also work when calling #go', function(done) {
    var i = 0,
        c = new domino({
          properties: {
            myProp: '?string'
          },
          bindings: {
            myEvent: function() {
              i++;
            }
          },
          settings: {
            breadthFirstSearch: false
          }
        });

    assert.deepEqual(i, 0);
    assert.deepEqual(c.get('myProp'), undefined);

    c.emit('myEvent')
     .update('myProp', 'abc');

    assert.deepEqual(i, 1);
    assert.deepEqual(c.get('myProp'), 'abc');

    c.go();

    assert.deepEqual(i, 1);
    assert.deepEqual(c.get('myProp'), 'abc');

    setTimeout(function() {
      assert.deepEqual(i, 1);
      assert.deepEqual(c.get('myProp'), 'abc');
      done();
    }, 0);
  });
});

describe('Orders management', function() {
  it('should work fine if a value is updated twice with the same value in the same frame', function(done) {
    var c = new domino({
      properties: {
        myProp: '?string'
      }
    });

    c.update('myProp', 'abc');
    c.update('myProp', 'abc');
    assert.deepEqual(c.get('myProp'), undefined);

    setTimeout(function() {
      assert.deepEqual(c.get('myProp'), 'abc');
      done();
    }, 0);
  });

  it('should throw an error if a value is updated twice with different values in the same frame', function() {
    var c = new domino({
      properties: {
        myProp: '?string'
      }
    });

    c.update('myProp', 'abc');
    assert.throws(function() {
      c.update('myProp', 'def')
    });
  });

  it('should not deduplicate an event without data sent several time in the same frame', function(done) {
    var i = 0,
        c = new domino({
          bindings: {
            myEvent: function(e) {
              i++;
            }
          }
        });

    c.emit('myEvent');
    c.emit('myEvent');

    setTimeout(function() {
      assert.deepEqual(i, 2);
      done();
    }, 0);
  });

  it('should not deduplicate an event sent several time in the same frame with different data', function(done) {
    var i = 0,
        c = new domino({
          bindings: {
            myEvent: function(e) {
              i += e.data;
            }
          }
        });

    c.emit('myEvent', 1);
    c.emit('myEvent', 2);

    setTimeout(function() {
      assert.deepEqual(i, 3);
      done();
    }, 0);
  });
});
