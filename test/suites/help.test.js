var assert = require('assert'),
    domino = require('../../src/domino.core.js');

describe('Help', function() {
  var controller = new domino({
    properties: {
      prop1: {
        type: 'string',
        description: 'I am a property.'
      }
    },
    facets: {
      facet1: {
        method: function() {},
        description: 'I am a facet.'
      }
    },
    services: {
      service1: {
        url: '/yeah/so/fine',
        description: 'I am a service.'
      }
    }
  });

  var help = {
    properties: {
      prop1: 'I am a property.'
    },
    facets: {
      facet1: 'I am a facet.'
    },
    services: {
      services: 'I am a service.'
    }
  };

  it('should be possible to display help for properties.', function() {
    assert.deepEqual(controller.help('properties'), help.properties);
  });

  it('should be possible to display help for facets.', function() {
    assert.deepEqual(controller.help('facets'), help.facets);
  });

  it('should be possible to display help for services.', function() {
    assert.deepEqual(controller.help('services'), help.services);
  });

  it('should be possible to display global help.', function() {
    assert.deepEqual(controller.help(), help);
  });
});
