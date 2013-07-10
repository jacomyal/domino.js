;(function() {
  'use strict';

  // Domino settings:
  domino.settings({
    verbose: false,
    strict: true
  });

  // domino.help():
  QUnit.module('domino misc');
  QUnit.test('domino.help', function() {
    var d = new domino({
      properties: {
        myProperty1: {
          description: 'Description of myProperty1',
          dispatch: 'myProperty1Updated',
          triggers: 'updateMyProperty1',
          type: 'object',
          value: { a: 1 }
        },
        myProperty2: {
          description: 'Description of myProperty2',
          dispatch: 'myProperty2Updated',
          triggers: 'updateMyProperty2',
          type: 'number',
          value: 42
        },
        myProperty3: {
          type: 'string',
          value: 'abc'
        }
      },
      hacks: [
        {
          description: 'Description of my hack n°1',
          triggers: 'myEvent1',
          dispatch: 'myEvent2'
        },
        {
          description: 'Description of my hack n°2',
          triggers: ['myEvent1', 'myEvent2'],
          dispatch: 'myEvent3'
        },
        {
          description: 'Description of my hack n°3',
          triggers: 'myEvent2',
          dispatch: ['myEvent1', 'myEvent3']
        },
        {
          triggers: 'myEvent1',
          dispatch: 'myEvent2'
        }
      ],
      shortcuts: [
        {
          id: 'myShortcut1',
          description: 'Description of myShortcut1',
          method: function() {
            return 42;
          }
        },
        {
          id: 'myShortcut2',
          description: 'Description of myShortcut2',
          method: function() {
            return '123';
          }
        },
        {
          id: 'myShortcut3',
          method: function() {
            return 'hoho';
          }
        }
      ],
      services: [
        {
          id: 'myService1',
          url: '/myService1',
          description: 'Description of myService1',
          success: function() {
            return 42;
          }
        },
        {
          id: 'myService2',
          url: '/myService2',
          description: 'Description of myService2',
          contentType: 'application/json',
          type: 'POST',
          data: {
            value: 'abc'
          },
          success: function(data) {
            return 'blah';
          },
          error: function(data) {
            return 'ooh';
          }
        },
        {
          id: 'myService3',
          url: '/myService3',
          success: function() {
            return 123;
          }
        }
      ]
    });

    // Tests with properties:
    QUnit.deepEqual(d.help('properties', 'myProperty1'), 'Description of myProperty1', 'Properties help() test 1.');
    QUnit.deepEqual(d.help('properties'), {
      myProperty1: 'Description of myProperty1',
      myProperty2: 'Description of myProperty2',
      myProperty3: '[no description is specified]'
    }, 'Properties help() test 2.');

    // Tests with services:
    QUnit.deepEqual(d.help('services', 'myService1'), 'Description of myService1', 'Services help() test 1.');
    QUnit.deepEqual(d.help('services'), {
      myService1: 'Description of myService1',
      myService2: 'Description of myService2',
      myService3: '[no description is specified]'
    }, 'Services help() test 2.');

    // Tests with shortcuts:
    QUnit.deepEqual(d.help('shortcuts', 'myShortcut1'), 'Description of myShortcut1', 'Shortcuts help() test 1.');
    QUnit.deepEqual(d.help('shortcuts'), {
      myShortcut1: 'Description of myShortcut1',
      myShortcut2: 'Description of myShortcut2',
      myShortcut3: '[no description is specified]'
    }, 'Shortcuts help() test 2.');

    // Tests with hacks:
    QUnit.deepEqual(d.help('hacks', 'trigger', 'myEvent1'), [
      'Description of my hack n°1',
      'Description of my hack n°2'
    ], 'Hacks help() test 1.');
    QUnit.deepEqual(d.help('hacks', 'dispatch', 'myEvent2'), 'Description of my hack n°1', 'Hacks help() test 2.');
    QUnit.deepEqual(d.help('hacks'), [
      'Description of my hack n°1',
      'Description of my hack n°2',
      'Description of my hack n°3'
    ], 'Hacks help() test 3.');

    // Full test:
    QUnit.deepEqual(d.help('full'), {
      properties: {
        myProperty1: 'Description of myProperty1',
        myProperty2: 'Description of myProperty2',
        myProperty3: '[no description is specified]'
      },
      services: {
        myService1: 'Description of myService1',
        myService2: 'Description of myService2',
        myService3: '[no description is specified]'
      },
      shortcuts: {
        myShortcut1: 'Description of myShortcut1',
        myShortcut2: 'Description of myShortcut2',
        myShortcut3: '[no description is specified]'
      },
      hacks: [
        'Description of my hack n°1',
        'Description of my hack n°2',
        'Description of my hack n°3'
      ]
    }, 'Full help() test.');
  });
})();
