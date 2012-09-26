(function(domino) {
  'use strict';

  domino = domino || {};
  domino.test = domino.test || {};

  // domino.utils.array
  domino.test.utils_array = {
    method: 'utils.array',
    compare: function(a, b) {
      return !!a && !!b &&
        a.length === b.length &&
        !a.some(function(v, i) {
          return v !== b[i];
        });
    },
    tests: [
      {params: ['a'], value: ['a']},
      {params: [['a']], value: ['a']},
      {params: ['a b'], value: ['a', 'b']},
      {params: [['a', 'b']], value: ['a', 'b']},
      // Here, a closure is used because the returned object
      // in the array as to be the same than the one given as
      // parameter:
      (function() {
        var o = {a:1, b:2};
        return {
          params: [o],
          value: [o]
        };
      })()
    ]
  };

  // domino.utils.type.get
  domino.test.utils_type_get = {
    method: 'utils.type.get',
    tests: [
      {params: [true], value: 'boolean'},
      {params: [42], value: 'number'},
      {params: ['abc'], value: 'string'},
      {params: [function() {return 'bim';}], value: 'function'},
      {params: [[]], value: 'array'},
      {params: [new Date()], value: 'date'},
      {params: [/abc/], value: 'regexp'},
      {params: [{}], value: 'object'},
      {params: [null], value: 'null'},
      {params: [undefined], value: 'undefined'},
      {params: [], value: 'undefined'}
    ]
  };

  // domino.utils.type.isValid
  domino.test.utils_type_isValid = {
    method: 'utils.type.isValid',
    tests: [
      {params: ['boolean'], value: true},
      {params: ['number'], value: true},
      {params: ['string'], value: true},
      {params: ['function'], value: true},
      {params: ['array'], value: true},
      {params: ['date'], value: true},
      {params: ['regexp'], value: true},
      {params: ['object'], value: true},
      {params: ['*'], value: true},
      {params: ['?string'], value: true},
      {params: ['string|array'], value: true},
      {params: ['?string|array'], value: true},
      {params: [{a: 'string', b: 'object'}], value: true},
      {params: [{a: 'string', b: {a: 'string'}}], value: true},
      {params: [{a: '?string|array', b: '?*'}], value: true},
      {params: ['null'], value: false},
      {params: ['undefined'], value: false},
      {params: ['string?'], value: false},
      {params: ['string|'], value: false},
      {params: ['|string'], value: false},
      {params: ['sstring'], value: false},
      {params: [['string']], value: false},
      {params: [{a: 'sstring'}], value: false},
      {params: ['string|?array'], value: false},
      {params: ['?(string|array)'], value: false}
    ]
  };

  // domino.utils.type.check
  domino.test.utils_type_check = {
    method: 'utils.type.check',
    tests: [
      {params: ['boolean', true], value: true},
      {params: ['boolean', 42], value: false},
      {params: ['number', 42], value: true},
      {params: ['number', 'abc'], value: false},
      {params: ['string', 'abc'], value: true},
      {params: ['string', function() {return 'bim';}], value: false},
      {params: ['function', function() {return 'bim';}], value: true},
      {params: ['function', [1, 2, 3]], value: false},
      {params: ['array', [1, 2, 3]], value: true},
      {params: ['array', new Date()], value: false},
      {params: ['date', new Date()], value: true},
      {params: ['date', /rhqq2/], value: false},
      {params: ['regexp', /rhqq2/], value: true},
      {params: ['regexp', {a: 1, b: 2}], value: false},
      {params: ['object', {a: 1, b: 2}], value: true},
      {params: ['object', true], value: false},
      {params: ['*', '42'], value: true},
      {params: ['*', null], value: false},
      {params: ['?string', 'abc'], value: true},
      {params: ['?string', null], value: true},
      {params: ['?string', undefined], value: true},
      {params: ['?string', 42], value: false},
      {params: ['string|array', 'abc'], value: true},
      {params: ['string|array', [1, 2, 3]], value: true},
      {params: ['string|array', null], value: false},
      {params: ['string|?array', 'abc'], error: 'Error: [domino.global] Invalid type'},
      {params: ['?string|array', 'abc'], value: true},
      {params: ['?string|array', [1, 2, 3]], value: true},
      {params: ['?string|array', null], value: true},
      {params: [{a: 'string'}, {a: 'abc', b: '12'}], value: false},
      {params: [{a: 'sstring'}, {a: 'abc', b: '12'}], error: 'Error: [domino.global] Invalid type'},
      {params: [{a: 'string', b: 'object'}, {a: 'abc', b: {a: 1, b: 2}}], value: true},
      {params: [{a: 'string', b: 'object'}, {a: 'abc', b: 42}], value: false},
      {params: [{a: 'string', b: 'object'}, {b: {a: 1, b: 2}}], value: false},
      {params: [{a: 'string', b: 'object'}, {a: 'abc'}], value: false},
      {params: [{a: 'string', b: {a: 'string'}}, {a: 'abc', b: {a: 'def'}}], value: true},
      {params: [{a: 'string', b: {a: 'string'}}, {a: 'abc', b: {a: 1, b: 2}}], value: false},
      {params: [{a: 'string', b: {a: 'string'}}, {a: 'abc', b: 'def'}], value: false},
      {params: [{a: '?string|array', b: '?*'}, {b: 'def'}], value: true},
      {params: [{a: '?string|array', b: '?*'}, {a: null, b: 'def'}], value: true},
      {params: [{a: '?string|array', b: '?*'}, {a: 'abc', b: 'def'}], value: true},
      {params: [{a: '?string|array', b: '?*'}, {a: [1, 2, 3], b: 'def'}], value: true},
      {params: [{a: '?string|array', b: '?*'}, 42], value: false}
    ]
  };

  domino.launchTests = function() {
    var k, i, failed, successed, passed;
    var method, tests, pkg, res;

    console.log('[Start tests]');

    for (k in domino.test) {
      pkg = window;
      method = domino.test[k].method.split('.').reduce(function(o, s) {
        pkg = o;
        return o[s] || {};
      }, domino);
      tests = domino.test[k].tests;

      failed = 0;
      successed = 0;
      passed = tests.length;

      console.log('  [Testing "domino.' + domino.test[k].method + '"]');

      for (i in tests) {
        try {
          res = method.apply(pkg, tests[i].params);
          if (
            domino.test[k].compare ?
              domino.test[k].compare(res, tests[i].value) :
              res === tests[i].value
          ) {
            successed++;
          } else {
            failed++;
            console.log(
              '    -> [case ' + i + '] Method returned "', res, '" ' +
              'instead of "', tests[i].value, '" ' +
              'with params "', tests[i].params, '".'
            );
          }
        } catch (e) {
          if (tests[i].error) {
            if (tests[i].error === e.toString())
              successed++;
            else {
              failed++;
              console.log(
                '    -> [case ' + i + '] Method returned error "', e, '" ' +
                'with params "', tests[i].params, '" instead of "', tests[i].error, '".'
              );
            }
          } else {
            failed++;
            console.log(
              '    -> [case ' + i + '] Method returned error "', e, '" ' +
              'with params "', tests[i].params, '".'
            );
          }
        }
      }

      console.log('  [Testing "domino.' + domino.test[k].method + '" ended]');
      console.log('    Success: ' + successed);
      console.log('    Fails:   ' + failed);
      console.log('    Total:   ' + passed);
    }
  };
})(domino);
