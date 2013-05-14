// Domino settings:
domino.settings({
  verbose: true,
  strict: true
});

function mod(property, d) {
  domino.module.call(this);
  var self = this;

  // The following array will store a new copy of the property value everytime
  // the property is updated.
  this.historic = [];

  this.triggers.properties[property.id] = function(event) {
    self.historic.push(this.get(property.id));
  }

  this.dispatch = function(value, event) {
    var a = d.getEvents(property.id),
        o = {};

    o[property.id] = value;
    this.dispatchEvent(event || a[0], o);
  }
}

function init(properties) {
  var m = {},
      d = new domino({
            properties: properties
          });

  // We initialize a module for each property:
  for (var k in properties)
    m[properties[k].id] = d.addModule(mod, [properties[k]]);

  // We return the instance and the modules:
  return {
    d: d,
    m: m
  };
}

// Properties:
module('domino instance');
test('Properties management', function() {
  var o;

  // Test 1
  o = init([{ id: 's', type: 'string', value: 'abc', triggers: 'updateS', dispatch: 'sUpdated'}]);

  // Here we simply update the value:
  o.m.s.dispatch('def');
  deepEqual(o.m.s.historic[o.m.s.historic.length-1], 'def', 'The string property has been successfully updated.');
  o.d.kill();

  // Test 2
  o = init([{ id: 's', type: 'string', value: 'abc', triggers: 'updateS', dispatch: 'sUpdated'}]);

  // Here we update the property, but with a different value, and we want to check that domino has triggered:
  o.m.s.dispatch('def');
  deepEqual(o.m.s.historic.length, 2, 'Updating the string property with a new value effectively triggers the events.');
  o.d.kill();

  // Test 3
  o = init([{ id: 's', type: 'string', value: 'abc', triggers: 'updateS', dispatch: 'sUpdated'}]);

  // Here we update the property, but with the same value, and we want to check that domino does not trigger:
  o.m.s.dispatch('abc');
  deepEqual(o.m.s.historic.length, 1, 'Updating the string property with the same value does not trigger the events.');
  o.d.kill();

  // Test 4
  o = init([{ id: 's', type: {a: 'number', b: '?number'}, value: {a: 1}, triggers: 'updateS', dispatch: 'sUpdated'}]);

  // Here we simply update the value:
  o.m.s.dispatch({a: 2, b: 1});
  deepEqual(o.m.s.historic[o.m.s.historic.length-1], {a: 2, b: 1}, 'The complex property ("deeply atomic") has been successfully updated.');
  o.d.kill();

  // Test 5
  o = init([{ id: 's', type: {a: 'number', b: '?number'}, value: {a: 1}, triggers: 'updateS', dispatch: 'sUpdated'}]);

  // Here we update the property, but with a different value, and we want to check that domino has triggered:
  o.m.s.dispatch({a: 2, b: 1});
  deepEqual(o.m.s.historic.length, 2, 'Updating the complex property ("deeply atomic") with a new value effectively triggers the events.');
  o.d.kill();

  // Test 6
  o = init([{ id: 's', type: {a: 'number', b: '?number'}, value: {a: 1}, triggers: 'updateS', dispatch: 'sUpdated'}]);

  // Here we update the property, but with the same value, and we want to check that domino does not trigger:
  o.m.s.dispatch({a: 1});
  deepEqual(o.m.s.historic.length, 1, 'Updating the complex property ("deeply atomic") with the same value does not trigger the events.');
  o.d.kill();

  // Test 7
  o = init([{ id: 's', type: 'object', value: {a: 1}, triggers: 'updateS', dispatch: 'sUpdated'}]);

  // Here we simply update the value:
  o.m.s.dispatch({a: 2, b: 1});
  deepEqual(o.m.s.historic[o.m.s.historic.length-1], {a: 2, b: 1}, 'The object property has been successfully updated.');
  o.d.kill();

  // Test 8
  o = init([{ id: 's', type: 'object', value: {a: 1}, triggers: 'updateS', dispatch: 'sUpdated'}]);

  // Here we update the property, but with a different value, and we want to check that domino has triggered:
  o.m.s.dispatch({a: 2, b: 1});
  deepEqual(o.m.s.historic.length, 2, 'Updating the object property with a new value effectively triggers the events.');
  o.d.kill();

  // Test 9
  o = init([{ id: 's', type: 'object', value: {a: 1}, triggers: 'updateS', dispatch: 'sUpdated'}]);

  // Here we update the property, but with the same value, and we want to check that domino triggers anyway ('object' typed):
  o.m.s.dispatch({a: 1});
  deepEqual(o.m.s.historic.length, 2, 'Updating the object property with the same value actually triggers the events.');
  o.d.kill();

  // Test 10
  o = init([{
    id: 's',
    type: 'string',
    value: '',
    triggers: 'updateS',
    dispatch: 'sUpdated',
    setter: function(v) {
      this.s = v.toLowerCase();
    }
  }]);

  o.m.s.dispatch('AbCdE');
  deepEqual(o.m.s.historic[o.m.s.historic.length-1], 'abcde', 'Basic setters overriding works well.');
  o.d.kill();

  // Test 11
  o = init([{
    id: 's',
    type: 'string',
    value: 'abc',
    triggers: 'updateS',
    dispatch: 'sUpdated',
    setter: function(v) {
      this.s = (this.s || '') + v;
    }
  }]);

  o.m.s.dispatch('def');
  deepEqual(o.m.s.historic[o.m.s.historic.length-1], 'abcdef', 'Setters overriding with current value reading works well.');
  o.d.kill();
});

test('Shortcuts management', function() {
  // Test 1:
  var d = new domino({
    shortcuts: [
      {
        id: 'a',
        method: function() {
          return 'ahah';
        }
      }
    ]
  });

  deepEqual(d.expand('a'), 'ahah', 'The shortcut expanding works.');
  d.kill();

  // Test 2:
  var d = new domino({
    shortcuts: [
      {
        id: 'a',
        method: function() {
          return 'ahah' + this.expand('b');
        }
      },
      {
        id: 'b',
        method: function() {
          return 'ohoh';
        }
      }
    ]
  });

  deepEqual(d.expand('a'), 'ahahohoh', 'The recursive shortcut expanding works.');
  d.kill();

  // Test 3:
  var d = new domino({
    properties: [
      {
        id: 'a',
        type: 'string',
        value: 'property'
      }
    ],
    shortcuts: [
      {
        id: 'a',
        method: function() {
          return 'shortcut';
        }
      }
    ]
  });

  deepEqual(d.expand('a', {a: 'custom'}), 'custom', 'Priorities: Custom objects are resolved before properties and shortcuts.');
  deepEqual(d.expand('a'), 'property', 'Priorities: Properties are resolved before shortcuts.');
  d.kill();
});

test('Properties cloning', function() {
  // Test 1:
  (function() {
    var d = new domino({
      properties: [
        {
          id: 'o',
          type: 'object',
          value: {
            a: 1,
            b: 2,
            c: 3
          }
        }
      ]
    });

    d.settings('clone', false);
    var o1 = d.get('o');

    d.update('o', o1);

    var o2 = d.get('o');
    o1.a = 42;

    deepEqual(o1, o2, 'Not cloning properties work.');
    d.kill();
  })();

  // Test 2:
  (function() {
    var d = new domino({
      properties: [
        {
          id: 'o',
          type: 'object',
          value: {
            a: 1,
            b: 2,
            c: 3
          }
        }
      ]
    });

    d.settings('clone', true);
    var o1 = d.get('o');

    d.update('o', o1);

    var o2 = d.get('o');
    o1.a = 42;

    notDeepEqual(o1, o2, 'Cloning properties works.');
    d.kill();
  })();

  // Test 3:
  (function() {
    var d = new domino({
      properties: [
        {
          id: 'o',
          type: 'object',
          clone: false,
          value: {
            a: 1,
            b: 2,
            c: 3
          }
        }
      ]
    });

    d.settings('clone', true);
    var o1 = d.get('o');

    d.update('o', o1);

    var o2 = d.get('o');
    o1.a = 42;

    deepEqual(o1, o2, 'Not cloning properties work (overriden in the property).');
    d.kill();
  })();

  // Test 4:
  (function() {
    var d = new domino({
      properties: [
        {
          id: 'o',
          type: 'object',
          clone: true,
          value: {
            a: 1,
            b: 2,
            c: 3
          }
        }
      ]
    });

    d.settings('clone', false);
    var o1 = d.get('o');

    d.update('o', o1);

    var o2 = d.get('o');
    o1.a = 42;

    notDeepEqual(o1, o2, 'Cloning properties works (overriden in the property).');
    d.kill();
  })();
});
