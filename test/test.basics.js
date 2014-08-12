module('domino');

test('Custom types', function() {
  QUnit.deepEqual(domino.types.check('prop', 'domino.name'), true, 'The type "domino.name" works well (1).');
  QUnit.deepEqual(domino.types.check('prop1', 'domino.name'), true, 'The type "domino.name" works well (2).');
  QUnit.deepEqual(domino.types.check('1prop', 'domino.name'), false, 'The type "domino.name" works well (3).');

  QUnit.deepEqual(domino.types.check({}, 'domino.property'), false, 'The type "domino.property" works well (1).');
  QUnit.deepEqual(domino.types.check({
    id: 'id'
  }, 'domino.property'), true, 'The type "domino.property" works well (2).');
  QUnit.deepEqual(domino.types.check({
    id: 'id',
    type: 'number',
    value: 42
  }, 'domino.property'), true, 'The type "domino.property" works well (3).');
  QUnit.deepEqual(domino.types.check({
    id: 'id',
    type: 'number',
    get: function() {}
  }, 'domino.property'), false, 'The type "domino.property" works well (4).');

  QUnit.deepEqual(domino.types.check({}, 'domino.shortcut'), false, 'The type "domino.shortcut" works well (1).');
  QUnit.deepEqual(domino.types.check({
    id: 'id'
  }, 'domino.shortcut'), false, 'The type "domino.shortcut" works well (2).');
  QUnit.deepEqual(domino.types.check({
    id: 'id',
    type: 'number',
    get: function() {}
  }, 'domino.shortcut'), false, 'The type "domino.shortcut" works well (3).');
  QUnit.deepEqual(domino.types.check({
    id: 'id',
    get: function() {}
  }, 'domino.shortcut'), true, 'The type "domino.shortcut" works well (4).');
});

test('Basics', function() {
  var d = new domino();

  ok(1, 'Domino instanciation works.');

  d.addProperty({
    id: 'prop1',
    value: 42
  });

  ok(1, 'Adding a property works.');

  equal(d.get('prop1'), 42, 'Getting a property\'s value works.');

  d.set('prop1', 123);
  stop();
  setTimeout(function() {
    start();
    equal(d.get('prop1'), 123, 'Setting a property\'s value works.');
  }, 0);
});
