QUnit.module('domino.types');

// domino.types.get():
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

// domino.types.isValid():
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

  QUnit.deepEqual(domino.types.check('type', 'boolean'), true, 'domino.types.check("type", val) works with valid types.');
  QUnit.deepEqual(domino.types.check('type', 'null'), false, 'domino.types.check("type", val) works with unvalid types.');
});

// domino.types.check():
QUnit.test('domino.types.check', function() {
  QUnit.deepEqual(domino.types.check('boolean', true), true, '"boolean", true" succeeds');
  QUnit.deepEqual(domino.types.check('boolean', true), true, '"boolean", true" succeeds');
  QUnit.deepEqual(domino.types.check('number', 42), true, '"number", 42" succeeds');
  QUnit.deepEqual(domino.types.check('string', 'abc'), true, '"string", "abc" succeeds');
  QUnit.deepEqual(domino.types.check('function', function() {}), true, '"function", function() {}" succeeds');
  QUnit.deepEqual(domino.types.check('array', [1, 2, 3]), true, '"array", [1, 2, 3]" succeeds');
  QUnit.deepEqual(domino.types.check('date', new Date()), true, '"date", new Date()" succeeds');
  QUnit.deepEqual(domino.types.check('regexp', /rhqq2/), true, '"regexp", /rhqq2/" succeeds');
  QUnit.deepEqual(domino.types.check('object', {a: 1, b: 2}), true, '"object", {a: 1, b: 2}" succeeds');
  QUnit.deepEqual(domino.types.check('*', '42'), true, '"*", "42" succeeds');
  QUnit.deepEqual(domino.types.check('?string', 'abc'), true, '"?string", "abc" succeeds');
  QUnit.deepEqual(domino.types.check('?string', null), true, '"?string", null succeeds');
  QUnit.deepEqual(domino.types.check('?string', undefined), true, '"?string", undefined succeeds');
  QUnit.deepEqual(domino.types.check('string|array', 'abc'), true, '"string|array", "abc" succeeds');
  QUnit.deepEqual(domino.types.check('string|array', [1, 2, 3]), true, '"string|array", [1, 2, 3] succeeds');
  QUnit.deepEqual(domino.types.check('?string|array', 'abc'), true, '"?string|array", "abc" succeeds');
  QUnit.deepEqual(domino.types.check('?string|array', [1, 2, 3]), true, '"?string|array", [1, 2, 3] succeeds');
  QUnit.deepEqual(domino.types.check('?string|array', null), true, '"?string|array", null succeeds');
  QUnit.deepEqual(domino.types.check({a: '?string|array', b: '?*'}, {b: 'def'}), true, '{a: "?string|array", b: "?*"}, {b: "def"} succeeds');
  QUnit.deepEqual(domino.types.check({a: 'string', b: 'object'}, {a: 'abc', b: {a: 1, b: 2}}), true, '{a: "string", b: "object"}, {a: "abc", b: {a: 1, b: 2}} succeeds');
  QUnit.deepEqual(domino.types.check({a: 'string', b: {a: 'string'}}, {a: 'abc', b: {a: 'def'}}), true, '{a: "string", b: {a: "string"}}, {a: "abc", b: {a: "def"}} succeeds');
  QUnit.deepEqual(domino.types.check({a: '?string|array', b: '?*'}, {a: null, b: 'def'}), true, '{a: "?string|array", b: "?*"}, {a: null, b: "def"} succeeds');
  QUnit.deepEqual(domino.types.check({a: '?string|array', b: '?*'}, {a: 'abc', b: 'def'}), true, '{a: "?string|array", b: "?*"}, {a: "abc", b: "def"} succeeds');
  QUnit.deepEqual(domino.types.check({a: '?string|array', b: '?*'}, {a: [1, 2, 3], b: 'def'}), true, '{a: "?string|array", b: "?*"}, {a: [1, 2, 3], b: "def"} succeeds');
  QUnit.deepEqual(domino.types.check(['boolean'], []), true, '["boolean"], [] succeeds');
  QUnit.deepEqual(domino.types.check(['boolean'], [true]), true, '["boolean"], [true] succeeds');
  QUnit.deepEqual(domino.types.check(['boolean'], [true, false, true]), true, '["boolean"], [true, false, true] succeeds');
  QUnit.deepEqual(domino.types.check([{a: '?boolean'}], [{}, {a: false}]), true, '[{a: "?boolean"}], [{}, {a: false}] succeeds');
  QUnit.deepEqual(domino.types.check('boolean', 42), false, '"boolean", 42 does not match');
  QUnit.deepEqual(domino.types.check('number', 'abc'), false, '"number", "abc" does not match');
  QUnit.deepEqual(domino.types.check('string', function() {}), false, '"string", function() {} does not match');
  QUnit.deepEqual(domino.types.check('function', [1, 2, 3]), false, '"function", [1, 2, 3] does not match');
  QUnit.deepEqual(domino.types.check('array', new Date()), false, '"array", new Date() does not match');
  QUnit.deepEqual(domino.types.check('date', /rhqq2/), false, '"date", /rhqq2/ does not match');
  QUnit.deepEqual(domino.types.check('regexp', {a: 1, b: 2}), false, '"regexp", {a: 1, b: 2} does not match');
  QUnit.deepEqual(domino.types.check('object', true), false, '"object", true does not match');
  QUnit.deepEqual(domino.types.check('*', null), false, '"*", null does not match');
  QUnit.deepEqual(domino.types.check('string|array', null), false, '"string|array", null does not match');
  QUnit.deepEqual(domino.types.check('?string', 42), false, '"?string", 42 does not match');
  QUnit.deepEqual(domino.types.check(['boolean'], null), false, '["boolean"], null does not match');
  QUnit.deepEqual(domino.types.check(['boolean'], [false, 1]), false, '["boolean"], [false, 1] does not match');
  QUnit.deepEqual(domino.types.check({a: 'string'}, {a: 'abc', b: '12'}), false, '{a: "string"}, {a: "abc", b: "12"} does not match');
  QUnit.deepEqual(domino.types.check({a: 'string', b: 'object'}, {a: 'abc', b: 42}), false, '{a: "string", b: "object"}, {a: "abc", b: 42} does not match');
  QUnit.deepEqual(domino.types.check({a: 'string', b: 'object'}, {b: {a: 1, b: 2}}), false, '{a: "string", b: "object"}, {b: {a: 1, b: 2}} does not match');
  QUnit.deepEqual(domino.types.check({a: 'string', b: 'object'}, {a: 'abc'}), false, '{a: "string", b: "object"}, {a: "abc"} does not match');
  QUnit.deepEqual(domino.types.check({a: 'string', b: {a: 'string'}}, {a: 'abc', b: {a: 1, b: 2}}), false, '{a: "string", b: {a: "string"}}, {a: "abc", b: {a: 1, b: 2}} does not match');
  QUnit.deepEqual(domino.types.check({a: 'string', b: {a: 'string'}}, {a: 'abc', b: 'def'}), false, '{a: "string", b: {a: "string"}}, {a: "abc", b: "def"} does not match');
  QUnit.deepEqual(domino.types.check({a: '?string|array', b: '?*'}, 42), false, '{a: "?string|array", b: "?*"}, 42 does not match');
  QUnit.throws(
    function() {
      domino.types.check('string|?array', 'abc');
    },
    /Invalid type/,
    'Invalid type detected'
  );
  QUnit.throws(
    function() {
      domino.types.check({a: 'sstring'}, {a: 'abc', b: '12'});
    },
    /Invalid type/,
    'Deep invalid type detected'
  );
  QUnit.deepEqual(domino.types.check({a: 'number'}, {a: 42, b: 1337}), false, '{a: "number"}, {a: 42, b: 1337} does not match (with "includes" flag off)');
});

// Custom types:
QUnit.test('Custom types', function() {
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
  QUnit.deepEqual(domino.types.check('integer', 1), true, 'domino.types.check("integer", 1) is true');
  QUnit.deepEqual(domino.types.check('integer', 1.2), false, 'domino.types.check("integer", 1.2) is false');
  QUnit.deepEqual(domino.types.check({a: 'integer'}, {a: 1}), true, 'domino.types.check({a: "integer"}, {a: 1}) is true');

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
  QUnit.deepEqual(domino.types.check('template', {
    a: 42,
    b: 'toto',
    c: {
      d: '42'
    },
    e: 2
  }), true, 'domino.types.check("template", ...) works');
  QUnit.deepEqual(domino.types.check('template', {
    a: 42,
    b: 'toto',
    c: {
      d: '42'
    },
    e: 2.4
  }), false, 'domino.types.check("template", ...) works again');

  // Create a recursive type:
  domino.types.add({
    id: 's',
    type: {
      k: '?s'
    }
  });

  QUnit.deepEqual(domino.types.isValid('s'), true, 'domino.types.isValid("s") is true (recursive)');
  QUnit.deepEqual(domino.types.check('s', {}), true, 'recursive types work (level 0)');
  QUnit.deepEqual(domino.types.check('s', {
    k: {}
  }), true, 'recursive types work (level 1)');
  QUnit.deepEqual(domino.types.check('s', {
    k: {
      k: {}
    }
  }), true, 'recursive types work (level 2)');
  QUnit.deepEqual(domino.types.check('s', {
    k: {
      k: {},
      a: 42
    }
  }), false, 'recursive types still check wrong keys (level 2)');

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
  QUnit.deepEqual(domino.types.check('s1', {}), true, 'double recursive types work (level 0)');
  QUnit.deepEqual(domino.types.check('s1', {
    k: {}
  }), true, 'double recursive types work (level 1)');
  QUnit.deepEqual(domino.types.check('s1', {
    k: {
      k: {}
    }
  }), true, 'double recursive types work (level 2)');
  QUnit.deepEqual(domino.types.check('s1', {
    k: {
      k: {},
      a: 42
    }
  }), false, 'double recursive types still check wrong keys (level 2)');
});
