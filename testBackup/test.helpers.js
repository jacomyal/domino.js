QUnit.module('domino.helpers');

// domino.helpers.clone():
QUnit.test('domino.helpers.clone', function() {
  // Basic tests:
  var o1 = {a: 1},
      o2 = domino.helpers.clone(o1);
  QUnit.deepEqual(o1, o2, 'Cloning a simple object works...');
  o2.a = 2;
  QUnit.notDeepEqual(o1, o2, '...and the clone is effectively another object.');

  var a1 = [1, 2, 3, {a: 1}],
      a2 = domino.helpers.clone(a1);
  QUnit.deepEqual(a1, a2, 'Cloning a simple array works...');
  a2[3].a = 3;
  QUnit.notDeepEqual(a1, a2, '...and the clone is effectively another array.');

  // Advanced tests with limit cases:
  if (typeof document === 'object') {
    var e1 = document.createElement('div'),
        e2 = domino.helpers.clone(e1);
    QUnit.deepEqual(e1, e2, 'Cloning a DOM element works...');
    e2.a = 2;
    QUnit.deepEqual(e1, e2, '...but the clone is actually just a reference.');
  }
});
