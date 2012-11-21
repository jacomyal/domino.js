// Domino settings:
domino.settings({
  verbose: true,
  strict: true
});

// domino.utils.array():
module('domino.utils');
test('domino.utils.array', function() {
  deepEqual(domino.utils.array('a'), ['a'], '"a" makes ["a"]');
  deepEqual(domino.utils.array('a b'), ['a', 'b'], '"a b" makes ["a", "b"]');
  deepEqual(domino.utils.array(['a']), ['a'], '["a"] makes ["a"]');
  deepEqual(domino.utils.array(['a', 'b']), ['a', 'b'], '["a", "b"] makes ["a", "b"]');
  deepEqual(domino.utils.array({a:1, b:2}), [{a:1, b:2}], '{a:1, b:2} makes [{a:1, b:2}]');
  deepEqual(domino.utils.array(undefined), [], 'undefined makes []');
  deepEqual(domino.utils.array(null), [], 'null makes []');
});

// domino.utils.clone():
test('domino.utils.clone', function() {
  var o1 = {a: 1},
      o2 = domino.utils.clone(o1);

  deepEqual(o1, o2, 'Object is deeply equal');

  o2.a = 2;
  notDeepEqual(o1, o2, 'Object does not contain any reference');
});

// domino.struct.get():
module('domino.struct');
test('domino.struct.get', function() {
  deepEqual(domino.struct.get(true), 'boolean', 'Boolean succeeds');
  deepEqual(domino.struct.get(42), 'number', 'Number succeeds');
  deepEqual(domino.struct.get('abc'), 'string', 'String succeeds');
  deepEqual(domino.struct.get(function() {}), 'function', 'Function succeeds');
  deepEqual(domino.struct.get([]), 'array', 'Array succeeds');
  deepEqual(domino.struct.get(new Date()), 'date', 'Date succeeds');
  deepEqual(domino.struct.get(/abd/), 'regexp', 'RegExp succeeds');
  deepEqual(domino.struct.get({a: 1, b: 2}), 'object', 'Object succeeds');
  deepEqual(domino.struct.get(null), 'null', 'Null succeeds');
  deepEqual(domino.struct.get(undefined), 'undefined', 'Undefined succeeds');
});

// domino.struct.isValid():
test('domino.struct.isValid', function() {
  deepEqual(domino.struct.isValid('boolean'), true, '"boolean" validity succeeds');
  deepEqual(domino.struct.isValid('number'), true, '"number" validity succeeds');
  deepEqual(domino.struct.isValid('string'), true, '"string" validity succeeds');
  deepEqual(domino.struct.isValid('function'), true, '"function" validity succeeds');
  deepEqual(domino.struct.isValid('array'), true, '"array" validity succeeds');
  deepEqual(domino.struct.isValid('date'), true, '"date" validity succeeds');
  deepEqual(domino.struct.isValid('regexp'), true, '"regexp" validity succeeds');
  deepEqual(domino.struct.isValid('object'), true, '"object" validity succeeds');
  deepEqual(domino.struct.isValid('*'), true, '"*" validity succeeds');
  deepEqual(domino.struct.isValid('?string'), true, '"?string" validity succeeds');
  deepEqual(domino.struct.isValid('string|array'), true, '"string|array" validity succeeds');
  deepEqual(domino.struct.isValid('?string|array'), true, '"?string|array" validity succeeds');
  deepEqual(domino.struct.isValid('boolean'), true, '"boolean" validity succeeds');
  deepEqual(domino.struct.isValid({a: 'string', b: 'object'}), true, '{a: "string", b: "object"} validity succeeds');
  deepEqual(domino.struct.isValid({a: 'string', b: {a: 'string'}}), true, '{a: "string", b: {a: "string"}} validity succeeds');
  deepEqual(domino.struct.isValid({a: '?string|array', b: '?*'}), true, '{a: "?string|array", b: "?*"} validity succeeds');
  deepEqual(domino.struct.isValid({a: '?string|array', b: ['?*']}), true, '{a: "?string|array", b: ["?*"]} validity succeeds');
  deepEqual(domino.struct.isValid([{a: '?string|array', b: '?*'}]), true, '[{a: "?string|array", b: "?*"}] validity succeeds');
  deepEqual(domino.struct.isValid('null'), false, '"null" invalidity succeeds');
  deepEqual(domino.struct.isValid('undefined'), false, '"undefined" invalidity succeeds');
  deepEqual(domino.struct.isValid('string?'), false, '"string?" invalidity succeeds');
  deepEqual(domino.struct.isValid('string|'), false, '"string|" invalidity succeeds');
  deepEqual(domino.struct.isValid('|string'), false, '"|string" invalidity succeeds');
  deepEqual(domino.struct.isValid('sstring'), false, '"sstring" invalidity succeeds');
  deepEqual(domino.struct.isValid({a: 'sstring'}), false, '{a: "sstring"} invalidity succeeds');
  deepEqual(domino.struct.isValid('string|?array'), false, '"string|?array" invalidity succeeds');
  deepEqual(domino.struct.isValid([]), false, '[] invalidity succeeds');
  deepEqual(domino.struct.isValid(['string', 'number']), false, '["string", "number"] invalidity succeeds');
});

// domino.struct.check():
test('domino.struct.check', function() {
  deepEqual(domino.struct.check('boolean', true), true, '"boolean", true" succeeds');
  deepEqual(domino.struct.check('boolean', true), true, '"boolean", true" succeeds');
  deepEqual(domino.struct.check('number', 42), true, '"number", 42" succeeds');
  deepEqual(domino.struct.check('string', 'abc'), true, '"string", "abc" succeeds');
  deepEqual(domino.struct.check('function', function() {}), true, '"function", function() {}" succeeds');
  deepEqual(domino.struct.check('array', [1, 2, 3]), true, '"array", [1, 2, 3]" succeeds');
  deepEqual(domino.struct.check('date', new Date()), true, '"date", new Date()" succeeds');
  deepEqual(domino.struct.check('regexp', /rhqq2/), true, '"regexp", /rhqq2/" succeeds');
  deepEqual(domino.struct.check('object', {a: 1, b: 2}), true, '"object", {a: 1, b: 2}" succeeds');
  deepEqual(domino.struct.check('*', '42'), true, '"*", "42" succeeds');
  deepEqual(domino.struct.check('?string', 'abc'), true, '"?string", "abc" succeeds');
  deepEqual(domino.struct.check('?string', null), true, '"?string", null succeeds');
  deepEqual(domino.struct.check('?string', undefined), true, '"?string", undefined succeeds');
  deepEqual(domino.struct.check('string|array', 'abc'), true, '"string|array", "abc" succeeds');
  deepEqual(domino.struct.check('string|array', [1, 2, 3]), true, '"string|array", [1, 2, 3] succeeds');
  deepEqual(domino.struct.check('?string|array', 'abc'), true, '"?string|array", "abc" succeeds');
  deepEqual(domino.struct.check('?string|array', [1, 2, 3]), true, '"?string|array", [1, 2, 3] succeeds');
  deepEqual(domino.struct.check('?string|array', null), true, '"?string|array", null succeeds');
  deepEqual(domino.struct.check({a: '?string|array', b: '?*'}, {b: 'def'}), true, '{a: "?string|array", b: "?*"}, {b: "def"} succeeds');
  deepEqual(domino.struct.check({a: 'string', b: 'object'}, {a: 'abc', b: {a: 1, b: 2}}), true, '{a: "string", b: "object"}, {a: "abc", b: {a: 1, b: 2}} succeeds');
  deepEqual(domino.struct.check({a: 'string', b: {a: 'string'}}, {a: 'abc', b: {a: 'def'}}), true, '{a: "string", b: {a: "string"}}, {a: "abc", b: {a: "def"}} succeeds');
  deepEqual(domino.struct.check({a: '?string|array', b: '?*'}, {a: null, b: 'def'}), true, '{a: "?string|array", b: "?*"}, {a: null, b: "def"} succeeds');
  deepEqual(domino.struct.check({a: '?string|array', b: '?*'}, {a: 'abc', b: 'def'}), true, '{a: "?string|array", b: "?*"}, {a: "abc", b: "def"} succeeds');
  deepEqual(domino.struct.check({a: '?string|array', b: '?*'}, {a: [1, 2, 3], b: 'def'}), true, '{a: "?string|array", b: "?*"}, {a: [1, 2, 3], b: "def"} succeeds');
  deepEqual(domino.struct.check(['boolean'], []), true, '["boolean"], [] succeeds');
  deepEqual(domino.struct.check(['boolean'], [true]), true, '["boolean"], [true] succeeds');
  deepEqual(domino.struct.check(['boolean'], [true, false, true]), true, '["boolean"], [true, false, true] succeeds');
  deepEqual(domino.struct.check([{a: '?boolean'}], [{}, {a: false}]), true, '[{a: "?boolean"}], [{}, {a: false}] succeeds');
  deepEqual(domino.struct.check('boolean', 42), false, '');
  deepEqual(domino.struct.check('number', 'abc'), false, '');
  deepEqual(domino.struct.check('string', function() {}), false, '');
  deepEqual(domino.struct.check('function', [1, 2, 3]), false, '');
  deepEqual(domino.struct.check('array', new Date()), false, '');
  deepEqual(domino.struct.check('date', /rhqq2/), false, '');
  deepEqual(domino.struct.check('regexp', {a: 1, b: 2}), false, '');
  deepEqual(domino.struct.check('object', true), false, '');
  deepEqual(domino.struct.check('*', null), false, '');
  deepEqual(domino.struct.check('string|array', null), false, '');
  deepEqual(domino.struct.check('?string', 42), false, '');
  deepEqual(domino.struct.check(['boolean'], null), false, '');
  deepEqual(domino.struct.check(['boolean'], [false, 1]), false, '');
  deepEqual(domino.struct.check({a: 'string'}, {a: 'abc', b: '12'}), false, '');
  deepEqual(domino.struct.check({a: 'string', b: 'object'}, {a: 'abc', b: 42}), false, '');
  deepEqual(domino.struct.check({a: 'string', b: 'object'}, {b: {a: 1, b: 2}}), false, '');
  deepEqual(domino.struct.check({a: 'string', b: 'object'}, {a: 'abc'}), false, '');
  deepEqual(domino.struct.check({a: 'string', b: {a: 'string'}}, {a: 'abc', b: {a: 1, b: 2}}), false, '');
  deepEqual(domino.struct.check({a: 'string', b: {a: 'string'}}, {a: 'abc', b: 'def'}), false, '');
  deepEqual(domino.struct.check({a: '?string|array', b: '?*'}, 42), false, '');
  throws(
    function() {
      domino.struct.check('string|?array', 'abc');
    },
    /Error\: \[[^\]]*\] Invalid type/,
    'Invalid type 1 detected'
  );
  throws(
    function() {
      domino.struct.check({a: 'sstring'}, {a: 'abc', b: '12'});
    },
    /Error\: \[[^\]]*\] Invalid type/,
    'Deep invalid type 1 detected'
  );
});

// domino.struct.deepScalar():
test('domino.struct.deepScalar', function() {
  deepEqual(domino.struct.deepScalar('boolean'), true, '"boolean" succeeds');
  deepEqual(domino.struct.deepScalar('number'), true, '"number" succeeds');
  deepEqual(domino.struct.deepScalar('null'), true, '"null" succeeds');
  deepEqual(domino.struct.deepScalar('undefined'), true, '"undefined" succeeds');
  deepEqual(domino.struct.deepScalar('string'), true, '"string" succeeds');
  deepEqual(domino.struct.deepScalar('?string'), true, '"?string" succeeds');
  deepEqual(domino.struct.deepScalar('string|number'), true, '"string|number" succeeds');
  deepEqual(domino.struct.deepScalar('?string|number'), true, '"?string|number" succeeds');
  deepEqual(domino.struct.deepScalar({a: 'string'}), true, '"{a: "string"}" succeeds');
  deepEqual(domino.struct.deepScalar([{a: 'string'}]), true, '"[{a: "string"}]" succeeds');
  deepEqual(domino.struct.deepScalar([{a: 'string'}, 'number']), true, '"[{a: "string"}, "number"]" succeeds');
  deepEqual(domino.struct.deepScalar('object'), false, '"object" succeeds');
  deepEqual(domino.struct.deepScalar('array'), false, '"array" succeeds');
  deepEqual(domino.struct.deepScalar('*'), false, '"*" succeeds');
  deepEqual(domino.struct.deepScalar('date'), false, '"date" succeeds');
  deepEqual(domino.struct.deepScalar('regexp'), false, '"regexp" succeeds');
  deepEqual(domino.struct.deepScalar('?object'), false, '"?object" succeeds');
  deepEqual(domino.struct.deepScalar(['object']), false, '["object"] succeeds');
  deepEqual(domino.struct.deepScalar('object|number'), false, '"object|number" succeeds');
  deepEqual(domino.struct.deepScalar('?object|number'), false, '"?object|number" succeeds');
  deepEqual(domino.struct.deepScalar({a: 'object'}), false, '"{a: object}" succeeds');
  deepEqual(domino.struct.deepScalar('abcde'), false, '"abcde" succeeds');
});

// Custom structures:
test('Custom structures', function() {
  // Check wrong calls to struct.add:
  throws(
    function() {
      domino.struct.add('number', function(v) {
        return v === +v;
      });
    },
    /Error\: \[[^\]]*\] .* reserved structure name/,
    'Naming a structure "number" is forbidden.'
  );

  // Create a basic structure and use it:
  domino.struct.add('integer', function(v) {
    return (v === +v) && ((v % 1) === 0);
  });

  deepEqual(domino.struct.isValid('integer'), true, 'domino.struct.isValid("integer") is true');
  deepEqual(domino.struct.check('integer', 1), true, 'domino.struct.check("integer", 1) is true');
  deepEqual(domino.struct.check('integer', 1.2), false, 'domino.struct.check("integer", 1.2) is false');
  deepEqual(domino.struct.check({a: 'integer'}, {a: 1}), true, 'domino.struct.check({a: "integer"}, {a: 1}) is true');

  // Create an advanced structure and use it:
  domino.struct.add('template', {
    a: 'number',
    b: 'string',
    c: {
      d: 'number|string'
    },
    e: '?integer'
  });

  deepEqual(domino.struct.isValid('template'), true, 'domino.struct.isValid("template") is true');
  deepEqual(domino.struct.check('template', {
    a: 42,
    b: 'toto',
    c: {
      d: '42'
    },
    e: 2
  }), true, 'domino.struct.check("template", ...) works');
  deepEqual(domino.struct.check('template', {
    a: 42,
    b: 'toto',
    c: {
      d: '42'
    },
    e: 2.4
  }), false, 'domino.struct.check("template", ...) works again');

  // Create a recursive structure:
  domino.struct.add({
    id: 's',
    recursive: true,
    structure: {
      k: '?s'
    }
  });

  deepEqual(domino.struct.isValid('s'), true, 'domino.struct.isValid("s") is true (recursive)');
  deepEqual(domino.struct.check('s', {}), true, 'recursive structures work (level 0)');
  deepEqual(domino.struct.check('s', {
    k: {}
  }), true, 'recursive structures work (level 1)');
  deepEqual(domino.struct.check('s', {
    k: {
      k: {}
    }
  }), true, 'recursive structures work (level 2)');
  deepEqual(domino.struct.check('s', {
    k: {
      k: {},
      a: 42
    }
  }), false, 'recursive structures still check wrong keys (level 2)');

  // Create two self referencing structures:
  domino.struct.add({
    id: 's1',
    recursive: true,
    structure: {
      k: '?s2'
    }
  });

  domino.struct.add('s2', {
    k: '?s1'
  });

  deepEqual(domino.struct.isValid('s1'), true, 'domino.struct.isValid("s1") is true (recursive)');
  deepEqual(domino.struct.isValid('s2'), true, 'domino.struct.isValid("s2") is true');
  deepEqual(domino.struct.check('s1', {}), true, 'double recursive structures work (level 0)');
  deepEqual(domino.struct.check('s1', {
    k: {}
  }), true, 'double recursive structures work (level 1)');
  deepEqual(domino.struct.check('s1', {
    k: {
      k: {}
    }
  }), true, 'double recursive structures work (level 2)');
  deepEqual(domino.struct.check('s1', {
    k: {
      k: {},
      a: 42
    }
  }), false, 'double recursive structures still check wrong keys (level 2)');
});
