var assert = require('assert'),
    domino = require('../../src/domino.core.js');

describe('Properties', function() {
  describe('validation', function() {
    it('should validate correct properties', function() {
      var correctProps = [
        {
          id: 'prop1',
          type: '?string'
        },
        {
          id: 'prop2',
          type: 'string',
          value: 'hello',
          emit: 'custom.event',
          description: 'A random test prop for testing purposes.'
        },
        {
          id: 'prop3',
          type: 'number',
          value: 4,
          emit: ['event1', 'event2']
        }
      ];

      correctProps.forEach(function(prop) {
        assert(domino.types.check(prop, 'domino.property'));
      });
    });

    it('should not validate incorrect properties', function() {
      var incorrectProps = [
        // Wrong variable type
        'gloubiboulga',

        // No identifier
        {
          value: 'test',
          emit: 'custom.event'
        },

        // Non-optional type with no initial value
        {
          id: 'prop1',
          type: 'string'
        },

        // Wrong emit type
        {
          id: 'prop2',
          emit: 34
        }
      ];

      incorrectProps.forEach(function(prop) {
        assert(!domino.types.check(prop, 'domino.property'));
      });
    });
  });

  describe('registration', function() {
    it('should be possible to register a single property', function() {
      var controller = new domino();

      controller.registerProperty('prop1', '?string');
      controller.registerProperty('prop2', {type: 'string', value: 'hello'});
      controller.registerProperty({id: 'prop3', type: 'string', value: 'world'});

      // Assertions
      assert.strictEqual(controller.get('prop1'), undefined);
      assert.strictEqual(controller.get('prop2'), 'hello');
      assert.strictEqual(controller.get('prop3'), 'world');
    });

    it('should be possible to register multiple properties at once', function() {
      var controller = new domino();

      controller.registerProperties({
        prop1: '?string',
        prop2: {type: 'string', value: 'hello'},
        prop3: {type: 'boolean', value: false}
      });

      // Assertions
      assert.strictEqual(controller.get('prop1'), undefined);
      assert.strictEqual(controller.get('prop2'), 'hello');
      assert.strictEqual(controller.get('prop3'), false);
    });

    it('should trigger errors when trying to register invalid properties', function() {
      var controller = new domino();

      // Trying to set a property with required value but without starting value
      assert.throws(function() {
        controller.registerProperty('prop1', 'string');
      }, Error);

      // Wrong signatures
      assert.throws(function() {
        controller.registerProperty('prop1');
        controller.registerProperty('prop2', 43);
      });

      // Attempting to register invalid properties
      assert.throws(function() {
        controller.registerProperty('prop1', {emit: 43});
      });
    });

    it('should trigger errors when trying to register already registered properties', function() {
      var controller = new domino({
        properties: {
          myProp: '?string'
        }
      });

      assert.throws(function() {
        controller.registerFacet('myProp', '?string');
      });
    });
  });

  // Unique controller for the getters & setters tests
  var controller = new domino();
  controller.registerProperties({
    prop1: '?string',
    prop2: {type: 'string', value: 'hello'},
    prop3: {type: 'boolean', value: false}
  })

  describe('getters', function() {
    it('should be possible to retrieve a property', function() {
      assert.strictEqual(controller.get('prop1'), undefined);
      assert.strictEqual(controller.get('prop2'), 'hello');
      assert.strictEqual(controller.get('prop3'), false);
    });

    it('should be possible to retrieve multiple properties', function() {
      assert.deepEqual(
        controller.get('prop1', 'prop2', 'prop3'),
        {
          prop1: undefined,
          prop2: 'hello',
          prop3: false
        }
      );

      assert.deepEqual(
        controller.get(['prop1', 'prop2', 'prop3']),
        [
          undefined,
          'hello',
          false
        ]
      );
    });
  });

  describe('setters', function() {
    it('should be possible to set a property', function(done) {
      controller.update('prop1', 'test1');

      setTimeout(function() {
        assert.strictEqual(controller.get('prop1'), 'test1');
        done();
      }, 0);
    });

    it('should be possible to set multiple properties', function(done) {
      controller.update({
        prop2: 'test2',
        prop3: true
      });

      setTimeout(function() {
        assert.deepEqual(
          controller.get(['prop2', 'prop3']),
          ['test2', true]
        );
        done();
      }, 0);
    });

    it('should not update value with wrong types', function() {
      assert.throws(function() {
        controller.update('prop1', [ 'not a string' ]);
      });
    });

    it('should not update multiple values with at least one wrong type', function() {
      assert.throws(function() {
        controller.update({
          prop1: [ 'not a string' ]
        });
      });

      assert.throws(function() {
        controller.update({
          prop1: 'a string',
          prop2: [ 'not a string' ]
        });
      });
    });
  });
});
