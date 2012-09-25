(function(domino) {
  'use strict';

  domino = domino || {};
  domino.test = domino.test || {};

  // domino.utils.type.isValid
  domino.test.utils_type_isValid = {
    pkg: domino.utils.type,
    method: 'isValid',
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
      {params: [{a:'string', b:'object'}], value: true},
      {params: [{a:'string', b:{a:'string'}}], value: true},
      {params: [{a:'?string|array', b:'?*'}], value: true},
      {params: ['string?'], value: false},
      {params: ['string|'], value: false},
      {params: ['|string'], value: false},
      {params: ['sstring'], value: false},
      {params: [['string']], value: false},
      {params: [{a:'sstring'}], value: false},
      {params: ['string|?array'], value: false},
      {params: ['?(string|array)'], value: false}
    ]
  };

  // domino.utils.type.check
  domino.test.utils_type_check = {
    pkg: domino.utils.type,
    method: 'check',
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
      {params: ['regexp', {a:1, b:2}], value: false},
      {params: ['object', {a:1, b:2}], value: true},
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
      {params: ['?string|array', 'abc'], value: true},
      {params: ['?string|array', [1, 2, 3]], value: true},
      {params: ['?string|array', null], value: true},
      {params: [{a:'string', b:'object'}, {a:'abc', b:{a:1, b:2}}], value: true},
      {params: [{a:'string', b:'object'}, {a:'abc', b:42}], value: false},
      {params: [{a:'string', b:'object'}, {b:{a: 1, b:2}}], value: false},
      {params: [{a:'string', b:'object'}, {a:'abc'}], value: false},
      {params: [{a:'string', b:{a:'string'}}, {a:'abc', b:{a: 'def'}}], value: true},
      {params: [{a:'string', b:{a:'string'}}, {a:'abc', b:{a: 1, b: 2}}], value: false},
      {params: [{a:'string', b:{a:'string'}}, {a:'abc', b:'def'}], value: false},
      {params: [{a:'?string|array', b:'?*'}, {b:'def'}], value: true},
      {params: [{a:'?string|array', b:'?*'}, {a:null, b:'def'}], value: true},
      {params: [{a:'?string|array', b:'?*'}, {a:'abc', b:'def'}], value: true},
      {params: [{a:'?string|array', b:'?*'}, {a:[1, 2, 3], b:'def'}], value: true},
      {params: [{a:'?string|array', b:'?*'}, 42], value: false}
    ]
  };

  domino.launchTests = function() {
    var k, i, failed, successed, passed;
    var method, tests, pkg, res;

    console.log('[Start tests]');

    for (k in domino.test) {
      pkg = domino.test[k].pkg;
      method = pkg[domino.test[k].method];
      tests = domino.test[k].tests;

      failed = 0;
      successed = 0;
      passed = tests.length;

      console.log('  [Testing "' + domino.test[k].method + '"]');

      for (i in tests) {
        res = method.apply(pkg, tests[i].params);
        if (res === tests[i].value) {
          successed ++;
        } else {
          failed ++;
          console.log(
            '    -> [case ' + i + '] Method returned "' + res + '" ' +
            'instead of "' + tests[i].value + '" ' +
            'with params "' + tests[i].params + '".'
          );
        }
      }

      console.log('    ' + successed + ' successes');
      console.log('    ' + failed + ' fails');
      console.log('    on ' + passed + ' tests');
    }
  };
})(domino);