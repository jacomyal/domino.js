var assert = require('assert'),
    domino = require('../../src/domino.core.js');

describe('Facets', function() {

  var controller = new domino({
    properties: {
      firstname: {
        type: 'string',
        value: 'Joachim'
      },
      lastname: {
        type: 'string',
        value: 'Murat'
      }
    }
  });

  describe('validation', function() {
    it('should validate correct facets.', function() {
      var correctFacets = [
        {
          id: 'facet1',
          get: function() {}
        },
        {
          id: 'facet2',
          get: function() {},
          description: 'Facet description for testing purposes.'
        }
      ];

      correctFacets.forEach(function(facet) {
        assert(domino.types.check(facet, 'domino.facet'));
      });
    });

    it('should not validate incorrect facets.', function() {
      var incorrectFacets = [

        // Wrong variable type
        'gloubiboulga',

        // No identifier
        {
          get: function() {}
        },

        // No get
        {
          id: 'facet1'
        }
      ];

      incorrectFacets.forEach(function(facet) {
        assert(!domino.types.check(facet, 'domino.facet'));
      });
    });
  });

  describe('registration', function() {
    var get = function() {
      return this.get('firstname') + ' ' + this.get('lastname');
    };

    it('should be possible to register a single facet.', function() {

      controller.registerFacet('facet1', get);
      controller.registerFacet('facet2', {get: get, description: 'Yeah!'});
      controller.registerFacet({id: 'facet3', get: get, description: 'Yeah!'});

      // Assertions
      assert.strictEqual(controller.get('facet1'), 'Joachim Murat');
      assert.strictEqual(controller.get('facet2'), 'Joachim Murat');
      assert.strictEqual(controller.get('facet3'), 'Joachim Murat');
    });

    it('should be possible to register multiple facets at once.', function() {

      controller.registerFacets({
        facet4: get,
        facet5: {get: get, description: 'Yeah!'}
      });

      // Assertions
      assert.strictEqual(controller.get('facet4'), 'Joachim Murat');
      assert.strictEqual(controller.get('facet5'), 'Joachim Murat');
    });

    it('should trigger errors when trying to register invalid facets.', function() {
      var controller = new domino();

      // Wrong signatures
      assert.throws(function() {
        controller.registerFacet('facet');
        controller.registerFacet('facet', 43);
      });

      // Attempting to register invalid facets
      assert.throws(function() {
        controller.registerFacet('facet', {hello: 'world'});
      });
    });
  });

  describe('getters', function() {
    it('should be possible to retrieve facets with properties indifferently.', function() {

      var result = controller.get('facet1', 'firstname');

      assert.deepEqual({
        facet1: 'Joachim Murat',
        firstname: 'Joachim'
      }, result);
    });
  });
});
