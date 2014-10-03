var assert = require('assert'),
    domino = require('../../src/domino.core.js'),
    types = domino.types;

describe('API', function() {
  describe('Constructor', function() {
    it('should not throw an error and return a new instance', function() {
      var controller = new domino();
    });

    it('should have all its public methods', function() {
      var controller = new domino();
      assert(types.check(controller.register, 'function'));
      assert(types.check(controller.registerFacet, 'function'));
      assert(types.check(controller.registerFacets, 'function'));
      assert(types.check(controller.registerProperty, 'function'));
      assert(types.check(controller.registerProperties, 'function'));
      assert(types.check(controller.update, 'function'));
      assert(types.check(controller.get, 'function'));
      assert(types.check(controller.binder, 'function'));
      assert(types.check(controller.on, 'function'));
      assert(types.check(controller.off, 'function'));
      assert(types.check(controller.emit, 'function'));
      assert(types.check(controller.settings, 'function'));
      assert(types.check(controller.debug, 'function'));
      assert(types.check(controller.info, 'function'));
      assert(types.check(controller.warn, 'function'));
      assert(types.check(controller.die, 'function'));
    });

    it('should register properties and facets given in arrays', function() {
      var controller = new domino({
        properties: [
          { id: 'p1', type: 'string', value: 'abc' },
          { id: 'p2', type: 'number', value: 123 }
        ],
        facets: [
          { id: 'f1', get: function() { return 'def'; } },
          { id: 'f2', get: function() { return 456; } }
        ]
      });

      assert(controller.get('p1') === 'abc');
      assert(controller.get('p2') === 123);
      assert(controller.get('f1') === 'def');
      assert(controller.get('f2') === 456);
    });

    it('should register properties and facets given in objects', function() {
      var controller = new domino({
        properties: {
          p1: { type: 'string', value: 'abc' },
          p2: { type: 'number', value: 123 }
        },
        facets: {
          f1: { get: function() { return 'def'; } },
          f2: function() { return 456; }
        }
      });

      assert(controller.get('p1') === 'abc');
      assert(controller.get('p2') === 123);
      assert(controller.get('f1') === 'def');
      assert(controller.get('f2') === 456);
    });
  });

  describe('#.register', function() {

    it('should register properties and facets given in arrays', function() {
      var controller = new domino();

      controller.register({
        properties: [
          { id: 'p1', type: 'string', value: 'abc' },
          { id: 'p2', type: 'number', value: 123 }
        ],
        facets: [
          { id: 'f1', get: function() { return 'def'; } },
          { id: 'f2', get: function() { return 456; } }
        ]
      });

      assert(controller.get('p1') === 'abc');
      assert(controller.get('p2') === 123);
      assert(controller.get('f1') === 'def');
      assert(controller.get('f2') === 456);
    });

    it('should register properties and facets given in objects', function() {
      var controller = new domino();

      controller.register({
        properties: {
          p1: { type: 'string', value: 'abc' },
          p2: { type: 'number', value: 123 }
        },
        facets: {
          f1: { get: function() { return 'def'; } },
          f2: function() { return 456; }
        }
      });

      assert(controller.get('p1') === 'abc');
      assert(controller.get('p2') === 123);
      assert(controller.get('f1') === 'def');
      assert(controller.get('f2') === 456);
    });
  });
});
