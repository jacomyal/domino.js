(function() {
  var _root = this;

  // Domino settings:
  domino.settings({
    verbose: false,
    strict: true
  });

  // Let's first deploy a "fake" server, to test our services:
  (function() {
    // Our data model:
    _root.servicesTestsData = {};

    // Replace domino ajax with jquery one
    domino.utils.ajax = $.ajax;

    // Reduce the response time:
    $.mockjaxSettings.responseTime = 10;

    // Setup mockjaxes
    $.mockjax({
      url: /\/(.+)/,
      urlParams: ['property'],
      type: 'GET',
      response: function(settings) {
        var p = settings.urlParams.property,
            o = {};

        o[p] = _root.servicesTestsData[p];
        this.responseText = o;
        _root.lastXHR = this;
      }
    });

    $.mockjax({
      url: /\/(.+)/,
      urlParams: ['property'],
      type: 'POST',
      contentType: 'application/json',
      response: function(settings) {
        var p = settings.urlParams.property,
            o = {};

        o[p] = _root.servicesTestsData[p] = settings.data.value;
        this.responseText = JSON.stringify(o);
        _root.lastXHR = this;
      }
    });
  })(this);

  // Services:
  QUnit.module('domino instance');
  QUnit.asyncTest('Services', function() {
    var tests = [
      {
        data: 'abc',
        expected: 'abc',
        label: 'GET call (with "success" and scope alteration)',
        params: {
          success: function(data) {
            this.prop_0 = data.prop_0;
          }
        }
      },
      {
        data: 'abc',
        expected: 'abc',
        label: 'GET call (with "success" and the "update" method)',
        params: {
          success: function(data) {
            this.update('prop_1', data.prop_1);
          }
        }
      },
      {
        data: 'abc',
        expected: { prop_2: 'abc' },
        label: 'GET call (with "setter")',
        params: {
          setter: 'prop_2'
        }
      },
      {
        data: { a: 'abc' },
        expected: 'abc',
        label: 'GET call (with "setter" and "path")',
        params: {
          setter: 'prop_3',
          path: 'prop_3.a'
        }
      },
      {
        data: 'abc',
        expected: 'def',
        label: 'POST call (with "success")',
        params: {
          type: 'POST',
          contentType: 'application/json',
          data: { value: 'def' },
          success: function(data) {
            this.prop_4 = data.prop_4;
          }
        }
      },
      {
        data: 'abc',
        expected: { prop_5: 'def' },
        label: 'POST call (with "setter")',
        params: {
          type: 'POST',
          contentType: 'application/json',
          data: { value: 'def' },
          setter: 'prop_5'
        }
      },
      {
        data: 'abc',
        expected: 'def',
        label: 'POST call (with "setter" and "path")',
        params: {
          type: 'POST',
          contentType: 'application/json',
          data: { value: { a: 'def' } },
          setter: 'prop_6',
          path: 'prop_6.a'
        }
      },
      {
        data: 'abc',
        expected: 'abc',
        label: 'Call with successfull "expect"',
        params: {
          expect: function(data) {
            return true;
          },
          success: function(data) {
            this.prop_7 = data.prop_7;
          },
          error: function() {
            this.prop_7 = 'def';
          }
        }
      },
      {
        data: 'abc',
        expected: 'def',
        label: 'Call with failed "expect"',
        params: {
          expect: function(data) {
            return false;
          },
          success: function(data) {
            this.prop_8 = data.prop_8;
          },
          error: function(message, xhr) {
            this.prop_8 = 'def';
          }
        }
      },
      {
        data: 'abc',
        expected: 'def',
        label: 'Dispatch an event with data',
        params: {
          type: 'POST',
          contentType: 'application/json',
          data: { value: 'def' },
          success: function(data) {
            this.dispatchEvent('update_prop_9', {
              prop_9: data.prop_9
            });
          }
        }
      }
    ];

    // Set global data:
    tests.forEach(function(obj, i) {
      _root.servicesTestsData['prop_' + i] = obj.data;
    });

    // Instanciate domino:
    var dGlobal = new domino({
      name: 'services',
      properties: tests.map(function(obj, i) {
        return {
          id: 'prop_' + i,
          dispatch: 'prop_' + i + '_updated',
          triggers: 'update_prop_' + i,
          type: '?*'
        };
      }),
      services: tests.map(function(obj, i) {
        var o = obj.params;

        o.id = 'service_' + i;
        o.url = '/prop_' + i;

        return o;
      })
    });

    dGlobal.addModule(function() {
      domino.module.call(this);

      this.triggers.events = tests.reduce(function(res, obj, i) {
        res['prop_' + i + '_updated'] = function(d) {
          QUnit.start();
          QUnit.deepEqual(d.get('prop_' + i), obj.expected, obj.label);
          if (i < tests.length - 1) {
            QUnit.stop();
            dGlobal.request('service_' + (i + 1));
          }
        };

        return res;
      }, {});
    });

    dGlobal.request('service_0');
  });

  QUnit.asyncTest('Services: "before"', function() {
    var usefulVar,
        domInst = new domino({
          services: [
            {
              id: 'beforeTest1',
              url: '/beforeTest1',
              type: 'POST',
              contentType: 'application/json',
              data: {
                value: 'beforeTest1'
              },
              before: function() {
                return true;
              }
            },
            {
              id: 'beforeTest2',
              url: '/beforeTest2',
              type: 'POST',
              contentType: 'application/json',
              data: {
                value: 'beforeTest2'
              },
              before: function() {
                return false;
              }
            },
            {
              id: 'beforeTest3',
              url: '/beforeTest3',
              before: function(_, xhr) {
                xhr.setRequestHeader('beforeTest3', 42);
              }
            }
          ]
        });

    _root.servicesTestsData.beforeTest1 = 'none';
    _root.servicesTestsData.beforeTest2 = 'none';

    setTimeout(function() {
      QUnit.start();
      QUnit.deepEqual(_root.servicesTestsData.beforeTest1, 'beforeTest1', '"before" returning true does nothing');
      QUnit.stop();

      setTimeout(function() {
        QUnit.start();
        QUnit.deepEqual(_root.servicesTestsData.beforeTest2, 'none', '"before" returning false cancels the call');
        QUnit.stop();

        setTimeout(function() {
          QUnit.start();
          QUnit.deepEqual(_root.lastXHR.headers.beforeTest3, 42, '"before" can modify the XHR');
        }, 50);
        domInst.request('beforeTest3');
      }, 50);
      domInst.request('beforeTest2');
    }, 50);
    domInst.request('beforeTest1');
  });
}).call(this);
