var assert = require('assert'),
    domino = require('../../src/domino.core.js');

describe('Facets', function() {

  describe('validation', function() {

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

    it('should validate correct facets.', function() {
      var correctFacets = [
        {
          id: 'facet1',
          method: function() {}
        },
        {
          id: 'facet2',
          method: function() {},
          description: 'Facet description for testing purposes.'
        }
      ];

      correctFacets.forEach(function(facet) {
        assert(domino.types.check(facet, 'domino.facet'));
      });
    });

    it('should not validate incorrect facets.', function() {
      var inccorrectFacets = [

        // Wrong variable type
        'gloubiboulga',

        // No identifier
        {
          method: function() {}
        },

        // No method
        {
          id: 'facet1'
        }
      ];

      inccorrectFacets.forEach(function(facet) {
        assert(!domino.types.check(facet, 'domino.facet'));
      });
    });
  });

  describe('registration', function() {

    it('should be possible to register a single facet.', function() {

      var method = function() {
        return this.get('firstname') + ' ' + this.get('lastname');
      };

      controller.registerFacet('facet1', method);
      controller.registerFacet('facet2', {method: method, description: 'Yeah!'});
      controller.registerFacet({id: 'facet3', method: method, description: 'Yeah!'});

      // Assertions
      assert.strictEqual(controller.get('facet1'), 'Joachim Murat');
      assert.strictEqual(controller.get('facet2'), 'Joachim Murat');
      assert.strictEqual(controller.get('facet3'), 'Joachim Murat');
    });

    it('should be possible to register multiple facets at once.', function() {

      controller.registerFacets({
        facet4: method,
        facet5: {method: method, description: 'Yeah!'}
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
      });
    });
  });
});
