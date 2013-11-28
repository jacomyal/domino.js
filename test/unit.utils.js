// Domino settings:
domino.settings({
  verbose: false,
  strict: true
});

// domino.utils.array():
QUnit.module('domino.utils');
QUnit.test('domino.utils.array', function() {
  QUnit.deepEqual(domino.utils.array('a'), ['a'], '"a" makes ["a"]');
  QUnit.deepEqual(domino.utils.array('a b'), ['a', 'b'], '"a b" makes ["a", "b"]');
  QUnit.deepEqual(domino.utils.array(['a']), ['a'], '["a"] makes ["a"]');
  QUnit.deepEqual(domino.utils.array(['a', 'b']), ['a', 'b'], '["a", "b"] makes ["a", "b"]');
  QUnit.deepEqual(domino.utils.array({a:1, b:2}), [{a:1, b:2}], '{a:1, b:2} makes [{a:1, b:2}]');
  QUnit.deepEqual(domino.utils.array(undefined), [], 'undefined makes []');
  QUnit.deepEqual(domino.utils.array(null), [], 'null makes []');
});

QUnit.test('domino.utils.partial', function() {
  var fn = function() {
        return this.name + ' ' +  Array.prototype.slice.call(arguments).join(' ');
      };
      obj = {
        name: 'moe'
      };

  obj.fn = domino.utils.partial(fn, 'a', 'b');
  QUnit.deepEqual(obj.fn('c', 'd'), 'moe a b c d', 'domino.utils.partial works');
});

// domino.utils.clone():
QUnit.test('domino.utils.clone', function() {
  // Basic tests:
  var o1 = {a: 1},
      o2 = domino.utils.clone(o1);
  QUnit.deepEqual(o1, o2, 'Cloning a simple object works...');
  o2.a = 2;
  QUnit.notDeepEqual(o1, o2, '...and the clone is effectively another object.');

  var a1 = [1, 2, 3, {a: 1}],
      a2 = domino.utils.clone(a1);
  QUnit.deepEqual(a1, a2, 'Cloning a simple array works...');
  a2[3].a = 3;
  QUnit.notDeepEqual(a1, a2, '...and the clone is effectively another array.');

  // Advanced tests with limit cases:
  if (typeof document === 'object') {
    var e1 = document.createElement('div'),
        e2 = domino.utils.clone(e1);
    QUnit.deepEqual(e1, e2, 'Cloning a DOM element works...');
    e2.a = 2;
    QUnit.deepEqual(e1, e2, '...but the clone is actually just a reference.');
  }
});

// domino.struct.get():
QUnit.module('domino.struct');
QUnit.test('domino.struct.get', function() {
  QUnit.deepEqual(domino.struct.get(true), 'boolean', 'Boolean succeeds');
  QUnit.deepEqual(domino.struct.get(42), 'number', 'Number succeeds');
  QUnit.deepEqual(domino.struct.get('abc'), 'string', 'String succeeds');
  QUnit.deepEqual(domino.struct.get(function() {}), 'function', 'Function succeeds');
  QUnit.deepEqual(domino.struct.get([]), 'array', 'Array succeeds');
  QUnit.deepEqual(domino.struct.get(new Date()), 'date', 'Date succeeds');
  QUnit.deepEqual(domino.struct.get(/abd/), 'regexp', 'RegExp succeeds');
  QUnit.deepEqual(domino.struct.get({a: 1, b: 2}), 'object', 'Object succeeds');
  QUnit.deepEqual(domino.struct.get(null), 'null', 'Null succeeds');
  QUnit.deepEqual(domino.struct.get(undefined), 'undefined', 'Undefined succeeds');
});

// domino.struct.isValid():
QUnit.test('domino.struct.isValid', function() {
  QUnit.deepEqual(domino.struct.isValid('boolean'), true, '"boolean" validity succeeds');
  QUnit.deepEqual(domino.struct.isValid('number'), true, '"number" validity succeeds');
  QUnit.deepEqual(domino.struct.isValid('string'), true, '"string" validity succeeds');
  QUnit.deepEqual(domino.struct.isValid('function'), true, '"function" validity succeeds');
  QUnit.deepEqual(domino.struct.isValid('array'), true, '"array" validity succeeds');
  QUnit.deepEqual(domino.struct.isValid('date'), true, '"date" validity succeeds');
  QUnit.deepEqual(domino.struct.isValid('regexp'), true, '"regexp" validity succeeds');
  QUnit.deepEqual(domino.struct.isValid('object'), true, '"object" validity succeeds');
  QUnit.deepEqual(domino.struct.isValid('*'), true, '"*" validity succeeds');
  QUnit.deepEqual(domino.struct.isValid('?string'), true, '"?string" validity succeeds');
  QUnit.deepEqual(domino.struct.isValid('string|array'), true, '"string|array" validity succeeds');
  QUnit.deepEqual(domino.struct.isValid('?string|array'), true, '"?string|array" validity succeeds');
  QUnit.deepEqual(domino.struct.isValid('boolean'), true, '"boolean" validity succeeds');
  QUnit.deepEqual(domino.struct.isValid({a: 'string', b: 'object'}), true, '{a: "string", b: "object"} validity succeeds');
  QUnit.deepEqual(domino.struct.isValid({a: 'string', b: {a: 'string'}}), true, '{a: "string", b: {a: "string"}} validity succeeds');
  QUnit.deepEqual(domino.struct.isValid({a: '?string|array', b: '?*'}), true, '{a: "?string|array", b: "?*"} validity succeeds');
  QUnit.deepEqual(domino.struct.isValid({a: '?string|array', b: ['?*']}), true, '{a: "?string|array", b: ["?*"]} validity succeeds');
  QUnit.deepEqual(domino.struct.isValid([{a: '?string|array', b: '?*'}]), true, '[{a: "?string|array", b: "?*"}] validity succeeds');
  QUnit.deepEqual(domino.struct.isValid('null'), false, '"null" invalidity succeeds');
  QUnit.deepEqual(domino.struct.isValid('undefined'), false, '"undefined" invalidity succeeds');
  QUnit.deepEqual(domino.struct.isValid('string?'), false, '"string?" invalidity succeeds');
  QUnit.deepEqual(domino.struct.isValid('string|'), false, '"string|" invalidity succeeds');
  QUnit.deepEqual(domino.struct.isValid('|string'), false, '"|string" invalidity succeeds');
  QUnit.deepEqual(domino.struct.isValid('sstring'), false, '"sstring" invalidity succeeds');
  QUnit.deepEqual(domino.struct.isValid({a: 'sstring'}), false, '{a: "sstring"} invalidity succeeds');
  QUnit.deepEqual(domino.struct.isValid('string|?array'), false, '"string|?array" invalidity succeeds');
  QUnit.deepEqual(domino.struct.isValid([]), false, '[] invalidity succeeds');
  QUnit.deepEqual(domino.struct.isValid(['string', 'number']), false, '["string", "number"] invalidity succeeds');
});

// domino.struct.check():
QUnit.test('domino.struct.check', function() {
  QUnit.deepEqual(domino.struct.check('boolean', true), true, '"boolean", true" succeeds');
  QUnit.deepEqual(domino.struct.check('boolean', true), true, '"boolean", true" succeeds');
  QUnit.deepEqual(domino.struct.check('number', 42), true, '"number", 42" succeeds');
  QUnit.deepEqual(domino.struct.check('string', 'abc'), true, '"string", "abc" succeeds');
  QUnit.deepEqual(domino.struct.check('function', function() {}), true, '"function", function() {}" succeeds');
  QUnit.deepEqual(domino.struct.check('array', [1, 2, 3]), true, '"array", [1, 2, 3]" succeeds');
  QUnit.deepEqual(domino.struct.check('date', new Date()), true, '"date", new Date()" succeeds');
  QUnit.deepEqual(domino.struct.check('regexp', /rhqq2/), true, '"regexp", /rhqq2/" succeeds');
  QUnit.deepEqual(domino.struct.check('object', {a: 1, b: 2}), true, '"object", {a: 1, b: 2}" succeeds');
  QUnit.deepEqual(domino.struct.check('*', '42'), true, '"*", "42" succeeds');
  QUnit.deepEqual(domino.struct.check('?string', 'abc'), true, '"?string", "abc" succeeds');
  QUnit.deepEqual(domino.struct.check('?string', null), true, '"?string", null succeeds');
  QUnit.deepEqual(domino.struct.check('?string', undefined), true, '"?string", undefined succeeds');
  QUnit.deepEqual(domino.struct.check('string|array', 'abc'), true, '"string|array", "abc" succeeds');
  QUnit.deepEqual(domino.struct.check('string|array', [1, 2, 3]), true, '"string|array", [1, 2, 3] succeeds');
  QUnit.deepEqual(domino.struct.check('?string|array', 'abc'), true, '"?string|array", "abc" succeeds');
  QUnit.deepEqual(domino.struct.check('?string|array', [1, 2, 3]), true, '"?string|array", [1, 2, 3] succeeds');
  QUnit.deepEqual(domino.struct.check('?string|array', null), true, '"?string|array", null succeeds');
  QUnit.deepEqual(domino.struct.check({a: '?string|array', b: '?*'}, {b: 'def'}), true, '{a: "?string|array", b: "?*"}, {b: "def"} succeeds');
  QUnit.deepEqual(domino.struct.check({a: 'string', b: 'object'}, {a: 'abc', b: {a: 1, b: 2}}), true, '{a: "string", b: "object"}, {a: "abc", b: {a: 1, b: 2}} succeeds');
  QUnit.deepEqual(domino.struct.check({a: 'string', b: {a: 'string'}}, {a: 'abc', b: {a: 'def'}}), true, '{a: "string", b: {a: "string"}}, {a: "abc", b: {a: "def"}} succeeds');
  QUnit.deepEqual(domino.struct.check({a: '?string|array', b: '?*'}, {a: null, b: 'def'}), true, '{a: "?string|array", b: "?*"}, {a: null, b: "def"} succeeds');
  QUnit.deepEqual(domino.struct.check({a: '?string|array', b: '?*'}, {a: 'abc', b: 'def'}), true, '{a: "?string|array", b: "?*"}, {a: "abc", b: "def"} succeeds');
  QUnit.deepEqual(domino.struct.check({a: '?string|array', b: '?*'}, {a: [1, 2, 3], b: 'def'}), true, '{a: "?string|array", b: "?*"}, {a: [1, 2, 3], b: "def"} succeeds');
  QUnit.deepEqual(domino.struct.check(['boolean'], []), true, '["boolean"], [] succeeds');
  QUnit.deepEqual(domino.struct.check(['boolean'], [true]), true, '["boolean"], [true] succeeds');
  QUnit.deepEqual(domino.struct.check(['boolean'], [true, false, true]), true, '["boolean"], [true, false, true] succeeds');
  QUnit.deepEqual(domino.struct.check([{a: '?boolean'}], [{}, {a: false}]), true, '[{a: "?boolean"}], [{}, {a: false}] succeeds');
  QUnit.deepEqual(domino.struct.check('boolean', 42), false, '"boolean", 42 does not match');
  QUnit.deepEqual(domino.struct.check('number', 'abc'), false, '"number", "abc" does not match');
  QUnit.deepEqual(domino.struct.check('string', function() {}), false, '"string", function() {} does not match');
  QUnit.deepEqual(domino.struct.check('function', [1, 2, 3]), false, '"function", [1, 2, 3] does not match');
  QUnit.deepEqual(domino.struct.check('array', new Date()), false, '"array", new Date() does not match');
  QUnit.deepEqual(domino.struct.check('date', /rhqq2/), false, '"date", /rhqq2/ does not match');
  QUnit.deepEqual(domino.struct.check('regexp', {a: 1, b: 2}), false, '"regexp", {a: 1, b: 2} does not match');
  QUnit.deepEqual(domino.struct.check('object', true), false, '"object", true does not match');
  QUnit.deepEqual(domino.struct.check('*', null), false, '"*", null does not match');
  QUnit.deepEqual(domino.struct.check('string|array', null), false, '"string|array", null does not match');
  QUnit.deepEqual(domino.struct.check('?string', 42), false, '"?string", 42 does not match');
  QUnit.deepEqual(domino.struct.check(['boolean'], null), false, '["boolean"], null does not match');
  QUnit.deepEqual(domino.struct.check(['boolean'], [false, 1]), false, '["boolean"], [false, 1] does not match');
  QUnit.deepEqual(domino.struct.check({a: 'string'}, {a: 'abc', b: '12'}), false, '{a: "string"}, {a: "abc", b: "12"} does not match');
  QUnit.deepEqual(domino.struct.check({a: 'string', b: 'object'}, {a: 'abc', b: 42}), false, '{a: "string", b: "object"}, {a: "abc", b: 42} does not match');
  QUnit.deepEqual(domino.struct.check({a: 'string', b: 'object'}, {b: {a: 1, b: 2}}), false, '{a: "string", b: "object"}, {b: {a: 1, b: 2}} does not match');
  QUnit.deepEqual(domino.struct.check({a: 'string', b: 'object'}, {a: 'abc'}), false, '{a: "string", b: "object"}, {a: "abc"} does not match');
  QUnit.deepEqual(domino.struct.check({a: 'string', b: {a: 'string'}}, {a: 'abc', b: {a: 1, b: 2}}), false, '{a: "string", b: {a: "string"}}, {a: "abc", b: {a: 1, b: 2}} does not match');
  QUnit.deepEqual(domino.struct.check({a: 'string', b: {a: 'string'}}, {a: 'abc', b: 'def'}), false, '{a: "string", b: {a: "string"}}, {a: "abc", b: "def"} does not match');
  QUnit.deepEqual(domino.struct.check({a: '?string|array', b: '?*'}, 42), false, '{a: "?string|array", b: "?*"}, 42 does not match');
  QUnit.throws(
    function() {
      domino.struct.check('string|?array', 'abc');
    },
    /Error\: \[[^\]]*\] Invalid type/,
    'Invalid type detected'
  );
  QUnit.throws(
    function() {
      domino.struct.check({a: 'sstring'}, {a: 'abc', b: '12'});
    },
    /Error\: \[[^\]]*\] Invalid type/,
    'Deep invalid type detected'
  );
  QUnit.deepEqual(domino.struct.check({a: 'number'}, {a: 42}, {includes: true}), true, '{a: "number"}, {a: 42} matches (with "includes" flag on)');
  QUnit.deepEqual(domino.struct.check({a: 'number'}, {a: 42, b: 1337}), false, '{a: "number"}, {a: 42, b: 1337} does not match (with "includes" flag off)');
  QUnit.deepEqual(domino.struct.check({a: 'number'}, {a: 42, b: 1337}, {includes: true}), true, '{a: "number"}, {a: 42, b: 1337} matches (with "includes" flag on)');
});

// domino.struct.deepScalar():
QUnit.test('domino.struct.deepScalar', function() {
  QUnit.deepEqual(domino.struct.deepScalar('boolean'), true, '"boolean" succeeds');
  QUnit.deepEqual(domino.struct.deepScalar('number'), true, '"number" succeeds');
  QUnit.deepEqual(domino.struct.deepScalar('null'), true, '"null" succeeds');
  QUnit.deepEqual(domino.struct.deepScalar('undefined'), true, '"undefined" succeeds');
  QUnit.deepEqual(domino.struct.deepScalar('string'), true, '"string" succeeds');
  QUnit.deepEqual(domino.struct.deepScalar('?string'), true, '"?string" succeeds');
  QUnit.deepEqual(domino.struct.deepScalar('string|number'), true, '"string|number" succeeds');
  QUnit.deepEqual(domino.struct.deepScalar('?string|number'), true, '"?string|number" succeeds');
  QUnit.deepEqual(domino.struct.deepScalar({a: 'string'}), true, '"{a: "string"}" succeeds');
  QUnit.deepEqual(domino.struct.deepScalar([{a: 'string'}]), true, '"[{a: "string"}]" succeeds');
  QUnit.deepEqual(domino.struct.deepScalar([{a: 'string'}, 'number']), true, '"[{a: "string"}, "number"]" succeeds');
  QUnit.deepEqual(domino.struct.deepScalar('object'), false, '"object" succeeds');
  QUnit.deepEqual(domino.struct.deepScalar('array'), false, '"array" succeeds');
  QUnit.deepEqual(domino.struct.deepScalar('*'), false, '"*" succeeds');
  QUnit.deepEqual(domino.struct.deepScalar('date'), false, '"date" succeeds');
  QUnit.deepEqual(domino.struct.deepScalar('regexp'), false, '"regexp" succeeds');
  QUnit.deepEqual(domino.struct.deepScalar('?object'), false, '"?object" succeeds');
  QUnit.deepEqual(domino.struct.deepScalar(['object']), false, '["object"] succeeds');
  QUnit.deepEqual(domino.struct.deepScalar('object|number'), false, '"object|number" succeeds');
  QUnit.deepEqual(domino.struct.deepScalar('?object|number'), false, '"?object|number" succeeds');
  QUnit.deepEqual(domino.struct.deepScalar({a: 'object'}), false, '"{a: object}" succeeds');
  QUnit.deepEqual(domino.struct.deepScalar('abcde'), false, '"abcde" succeeds');
});

// Custom structures:
QUnit.test('Custom structures', function() {
  // Check wrong calls to struct.add:
  QUnit.throws(
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

  QUnit.deepEqual(domino.struct.isValid('integer'), true, 'domino.struct.isValid("integer") is true');
  QUnit.deepEqual(domino.struct.check('integer', 1), true, 'domino.struct.check("integer", 1) is true');
  QUnit.deepEqual(domino.struct.check('integer', 1.2), false, 'domino.struct.check("integer", 1.2) is false');
  QUnit.deepEqual(domino.struct.check({a: 'integer'}, {a: 1}), true, 'domino.struct.check({a: "integer"}, {a: 1}) is true');

  // Create an advanced structure and use it:
  domino.struct.add('template', {
    a: 'number',
    b: 'string',
    c: {
      d: 'number|string'
    },
    e: '?integer'
  });

  QUnit.deepEqual(domino.struct.isValid('template'), true, 'domino.struct.isValid("template") is true');
  QUnit.deepEqual(domino.struct.check('template', {
    a: 42,
    b: 'toto',
    c: {
      d: '42'
    },
    e: 2
  }), true, 'domino.struct.check("template", ...) works');
  QUnit.deepEqual(domino.struct.check('template', {
    a: 42,
    b: 'toto',
    c: {
      d: '42'
    },
    e: 2.4
  }), false, 'domino.struct.check("template", ...) works again');

  // Create an advanced structure with the "includes" flag:
  domino.struct.add({
    id: 'includesTest',
    includes: true,
    struct: {
      a: 'number'
    }
  });

  QUnit.deepEqual(domino.struct.check('includesTest', {
    a: 42
  }), true, '"includes"-like structures do not need other attributes.');
  QUnit.deepEqual(domino.struct.check('includesTest', {
    a: 42,
    b: 'toto'
  }), true, '"includes"-like structures can have other attributes.');
  QUnit.deepEqual(domino.struct.check('includesTest', {
    a: 'NotANumber'
  }), false, '"includes"-like structures need to have their values valid when they have no other attribute.');
  QUnit.deepEqual(domino.struct.check('includesTest', {
    a: 'NotANumber',
    b: 'toto'
  }), false, '"includes"-like structures need to have their values valid when they have other attributes.');

  // Create a recursive structure:
  domino.struct.add({
    id: 's',
    struct: {
      k: '?s'
    }
  });

  QUnit.deepEqual(domino.struct.isValid('s'), true, 'domino.struct.isValid("s") is true (recursive)');
  QUnit.deepEqual(domino.struct.check('s', {}), true, 'recursive structures work (level 0)');
  QUnit.deepEqual(domino.struct.check('s', {
    k: {}
  }), true, 'recursive structures work (level 1)');
  QUnit.deepEqual(domino.struct.check('s', {
    k: {
      k: {}
    }
  }), true, 'recursive structures work (level 2)');
  QUnit.deepEqual(domino.struct.check('s', {
    k: {
      k: {},
      a: 42
    }
  }), false, 'recursive structures still check wrong keys (level 2)');

  // Create two self referencing structures:
  domino.struct.add({
    id: 's1',
    proto: ['s2'],
    struct: {
      k: '?s2'
    }
  });

  domino.struct.add('s2', {
    k: '?s1'
  });

  QUnit.deepEqual(domino.struct.isValid('s1'), true, 'domino.struct.isValid("s1") is true (recursive)');
  QUnit.deepEqual(domino.struct.isValid('s2'), true, 'domino.struct.isValid("s2") is true');
  QUnit.deepEqual(domino.struct.check('s1', {}), true, 'double recursive structures work (level 0)');
  QUnit.deepEqual(domino.struct.check('s1', {
    k: {}
  }), true, 'double recursive structures work (level 1)');
  QUnit.deepEqual(domino.struct.check('s1', {
    k: {
      k: {}
    }
  }), true, 'double recursive structures work (level 2)');
  QUnit.deepEqual(domino.struct.check('s1', {
    k: {
      k: {},
      a: 42
    }
  }), false, 'double recursive structures still check wrong keys (level 2)');

  QUnit.deepEqual(domino.struct.existing('s1'), { k: '?s2' }, 'domino.struct.existing("s1") returns the previously defined structure');
  QUnit.deepEqual(domino.struct.existing('s3'), undefined, 'domino.struct.existing("s3") returns undefined');
  QUnit.deepEqual(Object.keys(domino.struct.existing()).sort(), ['includesTest', 'integer', 's', 's1', 's2', 'template'], 'domino.struct.existing() returns every existing custom structures.');
});
