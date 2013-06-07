// Domino settings:
domino.settings({
  verbose: true,
  strict: true
});

module('domino instance');
test('Modules management', function() {
  function moduleConstructor(d) {
    domino.module.call(this);
    var self = this,
        p1Value,
        p2Value = d.get('p2');

    // Descending bindings:
    this.triggers.properties.p1 = function(d) {
      p1Value = d.get('p1');
    }

    this.triggers.events.desc2 = function(d) {
      p2Value = d.get('p2');
    }

    // Ascending bindings;
    this.dispatch = function(value) {
      this.dispatchEvent('asc3', {
        p3: value
      });
    }

    this.p1 = function() {
      return p1Value;
    }

    this.p2 = function() {
      return p2Value;
    }
  }

  var domInstance = new domino({
    name: 'modules',
    properties: [
      {
        id: 'p1',
        dispatch: 'desc1',
        triggers: 'asc1',
        type: 'string',
        value: 'p1:abc'
      },
      {
        id: 'p2',
        dispatch: 'desc2',
        triggers: 'asc2',
        type: 'string',
        value: 'p2:abc'
      },
      {
        id: 'p3',
        dispatch: 'desc3',
        triggers: 'asc3',
        type: 'string',
        value: 'p3:abc'
      }
    ]
  });

  // Instanciate the module:
  var module = domInstance.addModule(moduleConstructor);

  // Test bindings:
  deepEqual(module.p1(), 'p1:abc', 'Descending properties bindings are automatically called at the creation of the module.');

  domInstance.update('p1', 'p1:def');
  deepEqual(module.p1(), 'p1:def', 'Descending properties bindings are received by the module.');

  domInstance.update('p2', 'p2:def');
  deepEqual(module.p2(), 'p2:def', 'Descending events bindings are received by the module.');

  module.dispatch('p3:def');
  deepEqual(domInstance.get('p3'), 'p3:def', 'Ascending bindings are received by domino instance.');

  // Kill the module:
  domInstance.killModule(module);

  // Test that bindings are gone:
  domInstance.update('p1', 'p1:ghi');
  deepEqual(module.p1(), 'p1:def', 'Descending properties bindings are not received by a killed module.');

  domInstance.update('p2', 'p2:ghi');
  deepEqual(module.p2(), 'p2:def', 'Descending events bindings are not received by a killed module.');

  module.dispatch('p3:ghi');
  deepEqual(domInstance.get('p3'), 'p3:def', 'Ascending bindings are not received by domino instance when the module is killed.');
});
