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
    console.log(this, event);
    self.historic.push(this.get(property.id));
  }

  this.dispatch = function(value, event) {
    var a = d.getEvents(property.id),
        o = {};

    console.log(event, a[0]);
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
module('Properties management');
test('test 1', function() {
  var o = init([{ id: 's', type: 'string', value: 'abc', triggers: 'updateS', dispatch: 'sUpdated'}]);

  // Here we simply update the value:
  o.m.s.dispatch('def');
  deepEqual(o.m.s.historic[o.m.s.historic.length-1], 'def', 'The string property has been successfully updated!');
});
test('test 2', function() {
  var o = init([{ id: 's', type: 'string', value: 'abc', triggers: 'updateS', dispatch: 'sUpdated'}]);

  // Here we update the property, but with a different value, and we want to check that domino has triggered:
  o.m.s.dispatch('def');
  deepEqual(o.m.s.historic.length, 2, 'Updating the string property with a new value effectively triggers the events.');
});
test('test 3', function() {
  var o = init([{ id: 's', type: 'string', value: 'abc', triggers: 'updateS', dispatch: 'sUpdated'}]);

  // Here we update the property, but with the same value, and we want to check that domino does not trigger:
  o.m.s.dispatch('abc');
  deepEqual(o.m.s.historic.length, 1, 'Updating the string property with the same value does not trigger the events.');
});
test('test 4', function() {
  var o = init([{ id: 's', type: {a: 'number', b: '?number'}, value: {a: 1}, triggers: 'updateS', dispatch: 'sUpdated'}]);

  // Here we simply update the value:
  o.m.s.dispatch({a: 2, b: 1});
  deepEqual(o.m.s.historic[o.m.s.historic.length-1], {a: 2, b: 1}, 'The complex property has been successfully updated!');
});
test('test 5', function() {
  var o = init([{ id: 's', type: {a: 'number', b: '?number'}, value: {a: 1}, triggers: 'updateS', dispatch: 'sUpdated'}]);

  // Here we update the property, but with a different value, and we want to check that domino has triggered:
  o.m.s.dispatch({a: 2, b: 1});
  deepEqual(o.m.s.historic.length, 2, 'Updating the complex property with a new value effectively triggers the events.');
});
test('test 6', function() {
  var o = init([{ id: 's', type: {a: 'number', b: '?number'}, value: {a: 1}, triggers: 'updateS', dispatch: 'sUpdated'}]);

  // Here we update the property, but with the same value, and we want to check that domino does not trigger:
  o.m.s.dispatch({a: 1});
  deepEqual(o.m.s.historic.length, 1, 'Updating the complex property with the same value does not trigger the events.');
});