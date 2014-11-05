var assert = require('assert'),
    domino = require('../../src/domino.core.js');

describe('Helpers', function() {
  describe('"clone" method', function() {
    // Basic tests:
    var o1 = {a: 1},
        o2 = domino.helpers.clone(o1);

    it('should clone a simple object', function() {
      assert.deepEqual(o1, o2);
    });

    it('should really produce another object', function() {
      o2.a = 2;
      assert.notDeepEqual(o1, o2);
    });

    var a1 = [1, 2, 3, {a: 1}],
        a2 = domino.helpers.clone(a1);

    it('should clone a simple array', function() {
      assert.deepEqual(a1, a2);
    });

    it('should really produce another array', function() {
      a2[3].a = 3;
      assert.notDeepEqual(a1, a2);
    });

    // Browser only
    if (typeof document === 'object') {
      var e1 = document.createElement('div'),
          e2 = domino.helpers.clone(e1);

      it('should be possible to clone a DOM element', function() {
        assert.deepEqual(e1, e2);
      });

      it('the clone should actually be a reference', function() {
        e2.a = 2;
        assert.deepEqual(e1, e2);
      });
    }
  });

  describe('"extend" method', function() {
    var o1 = {a: 1},
        o2 = {a: {b: 1}},
        o3 = {a: 2, b: 1},
        o4 = {b: 2, c: 1};

    it('should return a clone of the object', function() {
      var o = domino.helpers.extend(o1);
      assert.deepEqual(o1, o);
      o.a = 2;
      assert(o1.a === 1);
    });

    it('should not deeply clone a deep object', function() {
      var o = domino.helpers.extend(o2);
      assert.deepEqual(o2, o);
      o.a.b = 2;
      assert(o2.a.b === 2);
    });

    it('should merge the latest objects into the first ones, and retrun a new clone', function() {
      var o = domino.helpers.extend(o1, o3, o4)
      assert.deepEqual(o, {a: 1, b: 1, c: 1});
      assert.deepEqual(o1, {a: 1});
      assert.deepEqual(o3, {a: 2, b: 1});
      assert.deepEqual(o4, {b: 2, c: 1});
    });
  });

  describe('"browse" method', function() {
    var o = {
      a: 123,
      b: 'abc',
      c: {
        d: 'def',
        e: 456
      },
      f: [
        'ghi',
        789
      ]
    };

    it('should return a clone and not alter the original object', function() {
      domino.helpers.browse(o, function(s) { return false; });

      assert.deepEqual(o, {
        a: 123,
        b: 'abc',
        c: {
          d: 'def',
          e: 456
        },
        f: [
          'ghi',
          789
        ]
      });
    });

    it('should transform the scalars with the given function', function() {
      var o2 = domino.helpers.browse(
        o,
        function(s) {
          if (typeof s === 'string')
            return s.toUpperCase();
          return s;
        }
      );

      assert.deepEqual(o2, {
        a: 123,
        b: 'ABC',
        c: {
          d: 'DEF',
          e: 456
        },
        f: [
          'GHI',
          789
        ]
      });
    });

    it('should call the transform function on every scalars, and only scalars', function() {
      var parsed = [];
      domino.helpers.browse(
        [{}, [], new Date(), 1, 'a', false, null, undefined],
        function(s) { parsed.push(s); }
      );

      assert.deepEqual(parsed, [1, 'a', false, null, undefined]);
    });
  });

  describe('"concat" method', function() {
    it('should concat the arguments', function() {
      var arr = domino.helpers.concat(
        1,
        null,
        undefined,
        [undefined, null],
        [2, 3],
        [[4]],
        [5],
        [[null]]
      );

      assert.deepEqual(arr, [1, 2, 3, [4], 5, [null]]);
    });
  });
});
