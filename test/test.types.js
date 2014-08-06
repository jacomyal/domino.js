QUnit.module('domino.types');

QUnit.test('domino.types.get', function() {
  QUnit.deepEqual(domino.types.get(true), 'boolean', 'Boolean succeeds');
  QUnit.deepEqual(domino.types.get(42), 'number', 'Number succeeds');
  QUnit.deepEqual(domino.types.get('abc'), 'string', 'String succeeds');
  QUnit.deepEqual(domino.types.get(function() {}), 'function', 'Function succeeds');
  QUnit.deepEqual(domino.types.get([]), 'array', 'Array succeeds');
  QUnit.deepEqual(domino.types.get(new Date()), 'date', 'Date succeeds');
  QUnit.deepEqual(domino.types.get(/abd/), 'regexp', 'RegExp succeeds');
  QUnit.deepEqual(domino.types.get({a: 1, b: 2}), 'object', 'Object succeeds');
  QUnit.deepEqual(domino.types.get(null), 'null', 'Null succeeds');
  QUnit.deepEqual(domino.types.get(undefined), 'undefined', 'Undefined succeeds');
});

QUnit.test('domino.types.isValid', function() {
  QUnit.deepEqual(domino.types.isValid('boolean'), true, '"boolean" validity succeeds');
  QUnit.deepEqual(domino.types.isValid('number'), true, '"number" validity succeeds');
  QUnit.deepEqual(domino.types.isValid('string'), true, '"string" validity succeeds');
  QUnit.deepEqual(domino.types.isValid('function'), true, '"function" validity succeeds');
  QUnit.deepEqual(domino.types.isValid('array'), true, '"array" validity succeeds');
  QUnit.deepEqual(domino.types.isValid('date'), true, '"date" validity succeeds');
  QUnit.deepEqual(domino.types.isValid('regexp'), true, '"regexp" validity succeeds');
  QUnit.deepEqual(domino.types.isValid('object'), true, '"object" validity succeeds');
  QUnit.deepEqual(domino.types.isValid('*'), true, '"*" validity succeeds');
  QUnit.deepEqual(domino.types.isValid('?string'), true, '"?string" validity succeeds');
  QUnit.deepEqual(domino.types.isValid('string|array'), true, '"string|array" validity succeeds');
  QUnit.deepEqual(domino.types.isValid('?string|array'), true, '"?string|array" validity succeeds');
  QUnit.deepEqual(domino.types.isValid('boolean'), true, '"boolean" validity succeeds');
  QUnit.deepEqual(domino.types.isValid({a: 'string', b: 'object'}), true, '{a: "string", b: "object"} validity succeeds');
  QUnit.deepEqual(domino.types.isValid({a: 'string', b: {a: 'string'}}), true, '{a: "string", b: {a: "string"}} validity succeeds');
  QUnit.deepEqual(domino.types.isValid({a: '?string|array', b: '?*'}), true, '{a: "?string|array", b: "?*"} validity succeeds');
  QUnit.deepEqual(domino.types.isValid({a: '?string|array', b: ['?*']}), true, '{a: "?string|array", b: ["?*"]} validity succeeds');
  QUnit.deepEqual(domino.types.isValid([{a: '?string|array', b: '?*'}]), true, '[{a: "?string|array", b: "?*"}] validity succeeds');
  QUnit.deepEqual(domino.types.isValid('null'), false, '"null" invalidity succeeds');
  QUnit.deepEqual(domino.types.isValid('undefined'), false, '"undefined" invalidity succeeds');
  QUnit.deepEqual(domino.types.isValid('string?'), false, '"string?" invalidity succeeds');
  QUnit.deepEqual(domino.types.isValid('string|'), false, '"string|" invalidity succeeds');
  QUnit.deepEqual(domino.types.isValid('|string'), false, '"|string" invalidity succeeds');
  QUnit.deepEqual(domino.types.isValid('sstring'), false, '"sstring" invalidity succeeds');
  QUnit.deepEqual(domino.types.isValid({a: 'sstring'}), false, '{a: "sstring"} invalidity succeeds');
  QUnit.deepEqual(domino.types.isValid('string|?array'), false, '"string|?array" invalidity succeeds');
  QUnit.deepEqual(domino.types.isValid([]), false, '[] invalidity succeeds');
  QUnit.deepEqual(domino.types.isValid(['string', 'number']), false, '["string", "number"] invalidity succeeds');

  QUnit.deepEqual(domino.types.check('boolean', 'type'), true, 'domino.types.check(val, "type") works with valid types.');
  QUnit.deepEqual(domino.types.check('null', 'type'), false, 'domino.types.check(val, "type") works with unvalid types.');
});

QUnit.test('domino.types.check', function() {
  QUnit.deepEqual(domino.types.check(true, 'boolean'), true, 'true" matches "boolean"');
  QUnit.deepEqual(domino.types.check(true, 'boolean'), true, 'true" matches "boolean"');
  QUnit.deepEqual(domino.types.check(42, 'number'), true, '42" matches "number"');
  QUnit.deepEqual(domino.types.check('abc', 'string'), true, '"abc" matches "string"');
  QUnit.deepEqual(domino.types.check(function() {}, 'function'), true, 'function() {}" matches "function"');
  QUnit.deepEqual(domino.types.check([1, 2, 3], 'array'), true, '[1, 2, 3]" matches "array"');
  QUnit.deepEqual(domino.types.check(new Date(), 'date'), true, 'new Date()" matches "date"');
  QUnit.deepEqual(domino.types.check(/rhqq2/, 'regexp'), true, '/rhqq2/" matches "regexp"');
  QUnit.deepEqual(domino.types.check({a: 1, b: 2}, 'object'), true, '{a: 1, b: 2}" matches "object"');
  QUnit.deepEqual(domino.types.check('42', '*'), true, '"42" matches "*"');
  QUnit.deepEqual(domino.types.check('abc', '?string'), true, '"abc" matches "?string"');
  QUnit.deepEqual(domino.types.check(null, '?string'), true, 'null matches "?string"');
  QUnit.deepEqual(domino.types.check(undefined, '?string'), true, 'undefined matches "?string"');
  QUnit.deepEqual(domino.types.check('abc', 'string|array'), true, '"abc" matches "string|array"');
  QUnit.deepEqual(domino.types.check([1, 2, 3], 'string|array'), true, '[1, 2, 3] matches "string|array"');
  QUnit.deepEqual(domino.types.check('abc', '?string|array'), true, '"abc" matches "?string|array"');
  QUnit.deepEqual(domino.types.check([1, 2, 3], '?string|array'), true, '[1, 2, 3] matches "?string|array"');
  QUnit.deepEqual(domino.types.check(null, '?string|array'), true, 'null matches "?string|array"');
  QUnit.deepEqual(domino.types.check({b: 'def'}, {a: '?string|array', b: '?*'}), true, '{b: "def"} matches {a: "?string|array", b: "?*"}');
  QUnit.deepEqual(domino.types.check({a: 'abc', b: {a: 1, b: 2}}, {a: 'string', b: 'object'}), true, '{a: "abc", b: {a: 1, b: 2}} matches {a: "string", b: "object"}');
  QUnit.deepEqual(domino.types.check({a: 'abc', b: {a: 'def'}}, {a: 'string', b: {a: 'string'}}), true, '{a: "abc", b: {a: "def"}} matches {a: "string", b: {a: "string"}}');
  QUnit.deepEqual(domino.types.check({a: null, b: 'def'}, {a: '?string|array', b: '?*'}), true, '{a: null, b: "def"} matches {a: "?string|array", b: "?*"}');
  QUnit.deepEqual(domino.types.check({a: 'abc', b: 'def'}, {a: '?string|array', b: '?*'}), true, '{a: "abc", b: "def"} matches {a: "?string|array", b: "?*"}');
  QUnit.deepEqual(domino.types.check({a: [1, 2, 3], b: 'def'}, {a: '?string|array', b: '?*'}), true, '{a: [1, 2, 3], b: "def"} matches {a: "?string|array", b: "?*"}');
  QUnit.deepEqual(domino.types.check([], ['boolean']), true, '[] matches ["boolean"]');
  QUnit.deepEqual(domino.types.check([true], ['boolean']), true, '[true] matches ["boolean"]');
  QUnit.deepEqual(domino.types.check([true, false, true], ['boolean']), true, '[true, false, true] matches ["boolean"]');
  QUnit.deepEqual(domino.types.check([{}, {a: false}], [{a: '?boolean'}]), true, '[{}, {a: false}] matches [{a: "?boolean"}]');
  QUnit.deepEqual(domino.types.check(42, 'boolean'), false, '42 does not match "boolean"');
  QUnit.deepEqual(domino.types.check('abc', 'number'), false, '"abc" does not match "number"');
  QUnit.deepEqual(domino.types.check(function() {}, 'string'), false, 'function() {} does not match "string"');
  QUnit.deepEqual(domino.types.check([1, 2, 3], 'function'), false, '[1, 2, 3] does not match "function"');
  QUnit.deepEqual(domino.types.check(new Date(), 'array'), false, 'new Date() does not match "array"');
  QUnit.deepEqual(domino.types.check(/rhqq2/, 'date'), false, '/rhqq2/ does not match "date"');
  QUnit.deepEqual(domino.types.check({a: 1, b: 2}, 'regexp'), false, '{a: 1, b: 2} does not match "regexp"');
  QUnit.deepEqual(domino.types.check(true, 'object'), false, 'true does not match "object"');
  QUnit.deepEqual(domino.types.check(null, '*'), false, 'null does not match "*"');
  QUnit.deepEqual(domino.types.check(null, 'string|array'), false, 'null does not match "string|array"');
  QUnit.deepEqual(domino.types.check(42, '?string'), false, '42 does not match "?string"');
  QUnit.deepEqual(domino.types.check(null, ['boolean']), false, 'null does not match ["boolean"]');
  QUnit.deepEqual(domino.types.check([false, 1], ['boolean']), false, '[false, 1] does not match ["boolean"]');
  QUnit.deepEqual(domino.types.check({a: 'abc', b: '12'}, {a: 'string'}), false, '{a: "abc", b: "12"} does not match {a: "string"}');
  QUnit.deepEqual(domino.types.check({a: 'abc', b: 42}, {a: 'string', b: 'object'}), false, '{a: "abc", b: 42} does not match {a: "string", b: "object"}');
  QUnit.deepEqual(domino.types.check({b: {a: 1, b: 2}}, {a: 'string', b: 'object'}), false, '{b: {a: 1, b: 2}} does not match {a: "string", b: "object"}');
  QUnit.deepEqual(domino.types.check({a: 'abc'}, {a: 'string', b: 'object'}), false, '{a: "abc"} does not match {a: "string", b: "object"}');
  QUnit.deepEqual(domino.types.check({a: 'abc', b: {a: 1, b: 2}}, {a: 'string', b: {a: 'string'}}), false, '{a: "abc", b: {a: 1, b: 2}} does not match {a: "string", b: {a: "string"}}');
  QUnit.deepEqual(domino.types.check({a: 'abc', b: 'def'}, {a: 'string', b: {a: 'string'}}), false, '{a: "abc", b: "def"} does not match {a: "string", b: {a: "string"}}');
  QUnit.deepEqual(domino.types.check(42, {a: '?string|array', b: '?*'}), false, '42 does not match {a: "?string|array", b: "?*"}');

  QUnit.throws(
    function() {
      domino.types.check('abc', 'string|?array');
    },
    /Invalid type/,
    'Invalid type detected'
  );
  QUnit.throws(
    function() {
      domino.types.check({a: 'abc', b: '12'}, {a: 'sstring'});
    },
    /Invalid type/,
    'Deep invalid type detected'
  );
});

QUnit.test('domino.types.add', function() {
  // Check wrong calls to type.add:
  QUnit.throws(
    function() {
      domino.types.add('number', function(v) {
        return v === +v;
      });
    },
    /.* reserved type name/,
    'Naming a type "number" is forbidden.'
  );

  // Create a basic type and use it:
  domino.types.add('integer', function(v) {
    return (v === +v) && ((v % 1) === 0);
  });

  QUnit.deepEqual(domino.types.isValid('integer'), true, 'domino.types.isValid("integer") is true');
  QUnit.deepEqual(domino.types.check(1, 'integer'), true, 'domino.types.check(1, "integer") is true');
  QUnit.deepEqual(domino.types.check(1.2, 'integer'), false, 'domino.types.check(1.2, "integer") is false');
  QUnit.deepEqual(domino.types.check({a: 1}, {a: 'integer'}), true, 'domino.types.check({a: 1}, {a: "integer"}) is true');

  // Create an advanced type and use it:
  domino.types.add('template', {
    a: 'number',
    b: 'string',
    c: {
      d: 'number|string'
    },
    e: '?integer'
  });

  QUnit.deepEqual(domino.types.isValid('template'), true, 'domino.types.isValid("template") is true');
  QUnit.deepEqual(domino.types.check({
    a: 42,
    b: 'toto',
    c: {
      d: '42'
    },
    e: 2
  }, 'template'), true, 'domino.types.check(value, "template") works');
  QUnit.deepEqual(domino.types.check({
    a: 42,
    b: 'toto',
    c: {
      d: '42'
    },
    e: 2.4
  }, 'template'), false, 'domino.types.check(value, "template") works again');

  // Create a recursive type:
  domino.types.add({
    id: 's',
    type: {
      k: '?s'
    }
  });

  QUnit.deepEqual(domino.types.isValid('s'), true, 'domino.types.isValid("s") is true (recursive)');
  QUnit.deepEqual(domino.types.check({}, 's'), true, 'recursive types work (level 0)');
  QUnit.deepEqual(domino.types.check({
    k: {}
  }, 's'), true, 'recursive types work (level 1)');
  QUnit.deepEqual(domino.types.check({
    k: {
      k: {}
    }
  }, 's'), true, 'recursive types work (level 2)');
  QUnit.deepEqual(domino.types.check({
    k: {
      k: {},
      a: 42
    }
  }, 's'), false, 'recursive types still check wrong keys (level 2)');

  // Create two self referencing types:
  domino.types.add({
    id: 's1',
    proto: ['s2'],
    type: {
      k: '?s2'
    }
  });

  domino.types.add('s2', {
    k: '?s1'
  });

  QUnit.deepEqual(domino.types.isValid('s1'), true, 'domino.types.isValid("s1") is true (recursive)');
  QUnit.deepEqual(domino.types.isValid('s2'), true, 'domino.types.isValid("s2") is true');
  QUnit.deepEqual(domino.types.check({}, 's1'), true, 'double recursive types work (level 0)');
  QUnit.deepEqual(domino.types.check({
    k: {}
  }, 's1'), true, 'double recursive types work (level 1)');
  QUnit.deepEqual(domino.types.check({
    k: {
      k: {}
    }
  }, 's1'), true, 'double recursive types work (level 2)');
  QUnit.deepEqual(domino.types.check({
    k: {
      k: {},
      a: 42
    }
  }, 's1'), false, 'double recursive types still check wrong keys (level 2)');
});
