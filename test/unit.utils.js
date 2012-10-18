// Domino settings:
domino.settings({
  verbose: true,
  strict: true
});

// domino.utils.array():
module('domino.utils.array()');
test('test 1', function() {
  deepEqual(domino.utils.array('a'), ['a'], 'String without space succeeds');
});
test('test 2', function() {
  deepEqual(domino.utils.array('a b'), ['a', 'b'], 'String with spaces succeeds');
});
test('test 3', function() {
  deepEqual(domino.utils.array(['a']), ['a'], 'Array (one element) succeeds');
});
test('test 4', function() {
  deepEqual(domino.utils.array(['a', 'b']), ['a', 'b'], 'Array (two elements) succeeds');
});
test('test 5', function() {
  deepEqual(domino.utils.array({a:1, b:2}), [{a:1, b:2}], 'Object succeeds');
});
test('test 6', function() {
  deepEqual(domino.utils.array(undefined), [], 'Undefined succeeds');
});
test('test 7', function() {
  deepEqual(domino.utils.array(null), [], 'Null succeeds');
});

// domino.struct.get():
module('domino.struct.get()');
test('test 1', function() {
  deepEqual(domino.struct.get(true), 'boolean', 'Boolean succeeds');
});
test('test 2', function() {
  deepEqual(domino.struct.get(42), 'number', 'Number succeeds');
});
test('test 3', function() {
  deepEqual(domino.struct.get('abc'), 'string', 'String succeeds');
});
test('test 4', function() {
  deepEqual(domino.struct.get(function() {}), 'function', 'Function succeeds');
});
test('test 5', function() {
  deepEqual(domino.struct.get([]), 'array', 'Array succeeds');
});
test('test 6', function() {
  deepEqual(domino.struct.get(new Date()), 'date', 'Date succeeds');
});
test('test 7', function() {
  deepEqual(domino.struct.get(/abd/), 'regexp', 'RegExp succeeds');
});
test('test 8', function() {
  deepEqual(domino.struct.get({a: 1, b: 2}), 'object', 'Object succeeds');
});
test('test 9', function() {
  deepEqual(domino.struct.get(null), 'null', 'Null succeeds');
});
test('test 10', function() {
  deepEqual(domino.struct.get(undefined), 'undefined', 'Undefined succeeds');
});

// domino.struct.isValid():
module('domino.struct.isValid()');
test('test 1', function() {
  deepEqual(domino.struct.isValid('boolean'), true, '"boolean" validity succeeds');
});
test('test 2', function() {
  deepEqual(domino.struct.isValid('number'), true, '"number" validity succeeds');
});
test('test 3', function() {
  deepEqual(domino.struct.isValid('string'), true, '"string" validity succeeds');
});
test('test 4', function() {
  deepEqual(domino.struct.isValid('function'), true, '"function" validity succeeds');
});
test('test 5', function() {
  deepEqual(domino.struct.isValid('array'), true, '"array" validity succeeds');
});
test('test 6', function() {
  deepEqual(domino.struct.isValid('date'), true, '"date" validity succeeds');
});
test('test 7', function() {
  deepEqual(domino.struct.isValid('regexp'), true, '"regexp" validity succeeds');
});
test('test 8', function() {
  deepEqual(domino.struct.isValid('object'), true, '"object" validity succeeds');
});
test('test 9', function() {
  deepEqual(domino.struct.isValid('*'), true, '"*" validity succeeds');
});
test('test 10', function() {
  deepEqual(domino.struct.isValid('?string'), true, '"?string" validity succeeds');
});
test('test 11', function() {
  deepEqual(domino.struct.isValid('string|array'), true, '"string|array" validity succeeds');
});
test('test 12', function() {
  deepEqual(domino.struct.isValid('?string|array'), true, '"?string|array" validity succeeds');
});
test('test 13', function() {
  deepEqual(domino.struct.isValid('boolean'), true, '"boolean" validity succeeds');
});
test('test 14', function() {
  deepEqual(domino.struct.isValid({a: 'string', b: 'object'}), true, '{a: "string", b: "object"} validity succeeds');
});
test('test 15', function() {
  deepEqual(domino.struct.isValid({a: 'string', b: {a: 'string'}}), true, '{a: "string", b: {a: "string"}} validity succeeds');
});
test('test 16', function() {
  deepEqual(domino.struct.isValid({a: '?string|array', b: '?*'}), true, '{a: "?string|array", b: "?*"} validity succeeds');
});
test('test 17', function() {
  deepEqual(domino.struct.isValid('null'), false, '"null" invalidity succeeds');
});
test('test 18', function() {
  deepEqual(domino.struct.isValid('undefined'), false, '"undefined" invalidity succeeds');
});
test('test 19', function() {
  deepEqual(domino.struct.isValid('string?'), false, '"string?" invalidity succeeds');
});
test('test 20', function() {
  deepEqual(domino.struct.isValid('string|'), false, '"string|" invalidity succeeds');
});
test('test 21', function() {
  deepEqual(domino.struct.isValid('|string'), false, '"|string" invalidity succeeds');
});
test('test 22', function() {
  deepEqual(domino.struct.isValid('sstring'), false, '"sstring" invalidity succeeds');
});
test('test 23', function() {
  deepEqual(domino.struct.isValid(['string']), false, '["string"] invalidity succeeds');
});
test('test 24', function() {
  deepEqual(domino.struct.isValid({a: 'sstring'}), false, '{a: "sstring"} invalidity succeeds');
});
test('test 25', function() {
  deepEqual(domino.struct.isValid('string|?array'), false, '"string|?array" invalidity succeeds');
});
test('test 26', function() {
  deepEqual(domino.struct.isValid('?(string|array)'), false, '"?(string|array)" invalidity succeeds');
});

// domino.struct.check():
module('domino.struct.check()');
test('test 1', function() {
  deepEqual(domino.struct.check('boolean', true), true, '"boolean", true" succeeds');
});
test('test 2', function() {
  deepEqual(domino.struct.check('number', 42), true, '"number", 42" succeeds');
});
test('test 3', function() {
  deepEqual(domino.struct.check('string', 'abc'), true, '"string", "abc" succeeds');
});
test('test 4', function() {
  deepEqual(domino.struct.check('function', function() {}), true, '"function", function() {}" succeeds');
});
test('test 5', function() {
  deepEqual(domino.struct.check('array', [1, 2, 3]), true, '"array", [1, 2, 3]" succeeds');
});
test('test 6', function() {
  deepEqual(domino.struct.check('date', new Date()), true, '"date", new Date()" succeeds');
});
test('test 7', function() {
  deepEqual(domino.struct.check('regexp', /rhqq2/), true, '"regexp", /rhqq2/" succeeds');
});
test('test 8', function() {
  deepEqual(domino.struct.check('object', {a: 1, b: 2}), true, '"object", {a: 1, b: 2}" succeeds');
});
test('test 9', function() {
  deepEqual(domino.struct.check('*', '42'), true, '"*", "42" succeeds');
});
test('test 10', function() {
  deepEqual(domino.struct.check('?string', 'abc'), true, '"?string", "abc" succeeds');
});
test('test 11', function() {
  deepEqual(domino.struct.check('?string', null), true, '"?string", null succeeds');
});
test('test 12', function() {
  deepEqual(domino.struct.check('?string', undefined), true, '"?string", undefined succeeds');
});
test('test 13', function() {
  deepEqual(domino.struct.check('string|array', 'abc'), true, '"string|array", "abc" succeeds');
});
test('test 14', function() {
  deepEqual(domino.struct.check('string|array', [1, 2, 3]), true, '"string|array", [1, 2, 3] succeeds');
});
test('test 15', function() {
  deepEqual(domino.struct.check('?string|array', 'abc'), true, '"?string|array", "abc" succeeds');
});
test('test 16', function() {
  deepEqual(domino.struct.check('?string|array', [1, 2, 3]), true, '"?string|array", [1, 2, 3] succeeds');
});
test('test 17', function() {
  deepEqual(domino.struct.check('?string|array', null), true, '"?string|array", null succeeds');
});
test('test 18', function() {
  deepEqual(domino.struct.check({a: '?string|array', b: '?*'}, {b: 'def'}), true, '{a: "?string|array", b: "?*"}, {b: "def"} succeeds');
});
test('test 19', function() {
  deepEqual(domino.struct.check({a: 'string', b: 'object'}, {a: 'abc', b: {a: 1, b: 2}}), true, '{a: "string", b: "object"}, {a: "abc", b: {a: 1, b: 2}} succeeds');
});
test('test 20', function() {
  deepEqual(domino.struct.check({a: 'string', b: {a: 'string'}}, {a: 'abc', b: {a: 'def'}}), true, '{a: "string", b: {a: "string"}}, {a: "abc", b: {a: "def"}} succeeds');
});
test('test 21', function() {
  deepEqual(domino.struct.check({a: '?string|array', b: '?*'}, {a: null, b: 'def'}), true, '{a: "?string|array", b: "?*"}, {a: null, b: "def"} succeeds');
});
test('test 22', function() {
  deepEqual(domino.struct.check({a: '?string|array', b: '?*'}, {a: 'abc', b: 'def'}), true, '{a: "?string|array", b: "?*"}, {a: "abc", b: "def"} succeeds');
});
test('test 23', function() {
  deepEqual(domino.struct.check({a: '?string|array', b: '?*'}, {a: [1, 2, 3], b: 'def'}), true, '{a: "?string|array", b: "?*"}, {a: [1, 2, 3], b: "def"} succeeds');
});
test('test 24', function() {
  deepEqual(domino.struct.check('boolean', 42), false, '');
});
test('test 25', function() {
  deepEqual(domino.struct.check('number', 'abc'), false, '');
});
test('test 26', function() {
  deepEqual(domino.struct.check('string', function() {}), false, '');
});
test('test 27', function() {
  deepEqual(domino.struct.check('function', [1, 2, 3]), false, '');
});
test('test 28', function() {
  deepEqual(domino.struct.check('array', new Date()), false, '');
});
test('test 29', function() {
  deepEqual(domino.struct.check('date', /rhqq2/), false, '');
});
test('test 30', function() {
  deepEqual(domino.struct.check('regexp', {a: 1, b: 2}), false, '');
});
test('test 31', function() {
  deepEqual(domino.struct.check('object', true), false, '');
});
test('test 32', function() {
  deepEqual(domino.struct.check('*', null), false, '');
});
test('test 33', function() {
  deepEqual(domino.struct.check('string|array', null), false, '');
});
test('test 34', function() {
  deepEqual(domino.struct.check('?string', 42), false, '');
});
test('test 35', function() {
  deepEqual(domino.struct.check({a: 'string'}, {a: 'abc', b: '12'}), false, '');
});
test('test 36', function() {
  deepEqual(domino.struct.check({a: 'string', b: 'object'}, {a: 'abc', b: 42}), false, '');
});
test('test 37', function() {
  deepEqual(domino.struct.check({a: 'string', b: 'object'}, {b: {a: 1, b: 2}}), false, '');
});
test('test 38', function() {
  deepEqual(domino.struct.check({a: 'string', b: 'object'}, {a: 'abc'}), false, '');
});
test('test 39', function() {
  deepEqual(domino.struct.check({a: 'string', b: {a: 'string'}}, {a: 'abc', b: {a: 1, b: 2}}), false, '');
});
test('test 40', function() {
  deepEqual(domino.struct.check({a: 'string', b: {a: 'string'}}, {a: 'abc', b: 'def'}), false, '');
});
test('test 41', function() {
  deepEqual(domino.struct.check({a: '?string|array', b: '?*'}, 42), false, '');
});
test('test 42', function() {
  throws(
    function() {
      domino.struct.check('string|?array', 'abc');
    },
    /Error\: \[[^\]]*\] Invalid type/,
    'Invalid type 1 detected'
  );
});
test('test 43', function() {
  throws(
    function() {
      domino.struct.check({a: 'sstring'}, {a: 'abc', b: '12'});
    },
    /Error\: \[[^\]]*\] Invalid type/,
    'Deep invalid type 1 detected'
  );
});

// domino.struct.deepScalar():
module('domino.struct.deepScalar()');
test('test 1', function() {
  deepEqual(domino.struct.deepScalar('boolean'), true, '"boolean" succeeds');
});
test('test 2', function() {
  deepEqual(domino.struct.deepScalar('number'), true, '"number" succeeds');
});
test('test 3', function() {
  deepEqual(domino.struct.deepScalar('null'), true, '"null" succeeds');
});
test('test 4', function() {
  deepEqual(domino.struct.deepScalar('undefined'), true, '"undefined" succeeds');
});
test('test 5', function() {
  deepEqual(domino.struct.deepScalar('string'), true, '"string" succeeds');
});
test('test 6', function() {
  deepEqual(domino.struct.deepScalar('?string'), true, '"?string" succeeds');
});
test('test 7', function() {
  deepEqual(domino.struct.deepScalar('string|number'), true, '"string|number" succeeds');
});
test('test 8', function() {
  deepEqual(domino.struct.deepScalar('?string|number'), true, '"?string|number" succeeds');
});
test('test 9', function() {
  deepEqual(domino.struct.deepScalar({a: 'string'}), true, '"{a: string}" succeeds');
});
test('test 10', function() {
  deepEqual(domino.struct.deepScalar('object'), false, '"object" succeeds');
});
test('test 11', function() {
  deepEqual(domino.struct.deepScalar('array'), false, '"array" succeeds');
});
test('test 12', function() {
  deepEqual(domino.struct.deepScalar('*'), false, '"*" succeeds');
});
test('test 13', function() {
  deepEqual(domino.struct.deepScalar('date'), false, '"date" succeeds');
});
test('test 14', function() {
  deepEqual(domino.struct.deepScalar('regexp'), false, '"regexp" succeeds');
});
test('test 15', function() {
  deepEqual(domino.struct.deepScalar('?object'), false, '"?number" succeeds');
});
test('test 16', function() {
  deepEqual(domino.struct.deepScalar('object|number'), false, '"object|number" succeeds');
});
test('test 17', function() {
  deepEqual(domino.struct.deepScalar('?object|number'), false, '"?object|number" succeeds');
});
test('test 18', function() {
  deepEqual(domino.struct.deepScalar({a: 'object'}), false, '"{a: object}" succeeds');
});
test('test 19', function() {
  deepEqual(domino.struct.deepScalar('abcde'), false, '"abcde" succeeds');
});

// domino.utils.clone():
module('domino.utils.clone()');
test('test 1', function() {
  var o1 = {a: 1},
      o2 = domino.utils.clone(o1);

  o2.a = 2;
  notDeepEqual(o1, o2, 'Object succeeds');
});

// domino.utils.ajax():
module('domino.utils.ajax()');

// Ajax management
var dominoAjax = domino.utils.ajax;
function dominoToJqueryAjax() {
  domino.utils.ajax = $.ajax;
}
function dominoResetAjax() {
  domino.utils.ajax = dominoAjax;
}

asyncTest('Simple ajax call', function() {
  dominoToJqueryAjax();

  $.mockjax({
    url: '/toto/tutu',
    responseText: 'Hello world'
  });

  domino.utils.ajax({
    url: '/toto/tutu',
    dataType: 'text',
    success: function(data) {
      equal(data, 'Hello world', 'Response Text matches');
      start();
    }
  });

  dominoResetAjax();
});
