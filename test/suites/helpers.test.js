var assert = require('assert'),
    domino = require('../../src/domino.core.js');

describe('Helpers', function() {

  describe('clone', function() {

    // Basic tests:
    var o1 = {a: 1},
        o2 = domino.helpers.clone(o1);

    it('should clone a simple object.', function() {
      assert.deepEqual(o1, o2);
    });

    it('but should really produce another object.', function() {
      o2.a = 2;
      assert.notDeepEqual(o1, o2);
    });

    var a1 = [1, 2, 3, {a: 1}],
        a2 = domino.helpers.clone(a1);

    it('should clone a simple array.', function() {
      assert.deepEqual(a1, a2);
    });

    it('but should really produce another array.', function() {
      a2[3].a = 3;
      assert.notDeepEqual(a1, a2);
    });

    // Browser only
    if (typeof document === 'object') {
      var e1 = document.createElement('div'),
          e2 = domino.helpers.clone(e1);

      it('should be possible to clone a DOM element.', function() {
        assert.deepEqual(e1, e2);
      });

      it('but the clone should actually be a reference.', function() {
        e2.a = 2;
        assert.deepEqual(e1, e2);
      });
    }
  });
});
