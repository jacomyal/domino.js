// Domino settings:
domino.settings({
  verbose: false,
  strict: true
});

// Hacks:
QUnit.module('domino instance');
QUnit.test('Hacks', function() {
  var o = new domino({
    properties: [
      {
        id: 'p1',
        value: false,
        dispatch: 'p1Updated'
      },
      {
        id: 'p2',
        value: false,
        dispatch: 'p2Updated'
      }
    ],
    hacks: [
      {
        triggers: 'trigger_0',
        dispatch: 'dispatch_0'
      },
      {
        triggers: ['trigger_1_0', 'trigger_1_1'],
        dispatch: 'dispatch_1'
      },
      {
        triggers: 'trigger_2',
        dispatch: ['dispatch_2_0', 'dispatch_2_1']
      },
      {
        triggers: 'trigger_3',
        method: method_3
      },
      {
        triggers: 'trigger_4',
        method: method_4
      },
      {
        triggers: 'trigger_5',
        method: method_5
      },
      {
        triggers: 'trigger_6',
        method: method_6
      }
    ]
  });

  // Hack with single trigger and single dispatch
  o.addEventListener('dispatch_0', function() {
    QUnit.ok(true, 'Hack with single trigger and single dispatch works.')

    o.dispatchEvent('trigger_1_0');
    o.dispatchEvent('trigger_1_1');
  });

  // Hack with multiple triggers
  var c1 = 0;
  o.addEventListener('dispatch_1', function() {
    if (++c1 === 2) {
      QUnit.ok(true, 'Hack with multiple triggers works.')

      o.dispatchEvent('trigger_2');
    }
  });

  // Hack with multiple dispatches
  var c2 = 0;
  o.addEventListener('dispatch_2_0 dispatch_2_1', function() {
    if (++c2 === 2) {
      QUnit.ok(true, 'Hack with multiple dispatches works.')

      o.dispatchEvent('trigger_3', {
        value: 42
      });
    }
  });

  // Hack with event data reception
  function method_3(event) {
    QUnit.equal(event.data.value, 42, 'Hack with event data reception works.');

    o.dispatchEvent('trigger_4');
  }

  // Hack with scope alteration
  function method_4(event) {
    this.p1 = true;
  }

  o.addEventListener('p1Updated', function() {
    QUnit.equal(o.get('p1'), true, 'Hack with scope alteration works.');

    o.dispatchEvent('trigger_5');
  });

  // Hack with "update"
  function method_5(event) {
    this.update('p2', true);
  }

  o.addEventListener('p2Updated', function() {
    QUnit.equal(o.get('p2'), true, 'Hack with "update" works.');

    o.dispatchEvent('trigger_6');
  });

  // Hack with "dispatchEvent"
  function method_6(event) {
    this.dispatchEvent('dispatch_6');
  }

  o.addEventListener('dispatch_6', function() {
    QUnit.ok(true, 'Hack with "dispatchEvent" works.');
  });

  // Init the testing chain:
  o.dispatchEvent('trigger_0');
});
