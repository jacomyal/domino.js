var assert = require('assert'),
    domino = require('../../src/domino.core.js');

describe('Frames injection', function() {
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
});
