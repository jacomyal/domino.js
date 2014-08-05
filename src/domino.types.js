'use strict';

var k,
    className,

    classes = (
      'Boolean Number String Function Array Date RegExp Object'
    ).split(' '),
    class2type = {},
    nativeTypes = ['*'],
    customTypes = {};

// Fill types
for (k in classes) {
  className = classes[k];
  nativeTypes.push(className.toLowerCase());
  class2type['[object ' + className + ']'] = className.toLowerCase();
}

var types = {
  add: function(a1, a2) {
    var o,
        k,
        a,
        id,
        tmp,
        type;

    // Polymorphism:
    if (arguments.length === 1) {
      if (this.get(a1) === 'object') {
        o = a1;
        id = o.id;
        type = o.type;
      } else
        throw 'If types.add is called with one arguments, ' +
              'it has to be an object';
    } else if (arguments.length === 2) {
      if (typeof a1 !== 'string' || !a1)
        throw 'If types.add is called with more than one arguments, ' +
              'the first one must be the string id';
      else
        id = a1;

      type = a2;
    } else
      throw 'types.add has to be called with one or three arguments';

    if (this.get(id) !== 'string' || id.length === 0)
      throw 'A type requires an string id';

    if (customTypes[id] !== undefined && customTypes[id] !== 'proto')
      throw 'The type "' + id + '" already exists';

    if (~nativeTypes.indexOf(id))
      throw '"' + id + '" is a reserved type name';

    customTypes[id] = 1;

    // Check given prototypes:
    a = (o || {}).proto || [];
    a = Array.isArray(a) ? a : [a];
    tmp = {};
    for (k in a)
      if (customTypes[a[k]] === undefined) {
        customTypes[a[k]] = 1;
        tmp[a[k]] = 1;
      }

    if ((this.get(type) !== 'function') && !this.isValid(type))
      throw 'A type requires a valid "type" describing the type. ' +
            'It can be a valid type or a function that test if an object ' +
            'matches the type.';

    // Effectively add the type:
    customTypes[id] = (o === undefined) ?
      {
        id: id,
        type: type
      } :
      {};

    if (o !== undefined)
      for (k in o)
        customTypes[id][k] = o[k];

    // Delete prototypes:
    for (k in tmp)
      if (k !== id)
        delete customTypes[k];
  },
  has: function(key) {
    return !!customTypes[key];
  },
  get: function(obj) {
    return (obj === null || obj === undefined) ?
      String(obj) :
      class2type[Object.prototype.toString.call(obj)] || 'object';
  },
  check: function(type, obj) {
    var a,
        i,
        k,
        typeOf = this.get(obj);

    if (this.get(type) === 'string') {
      a = type.replace(/^\?/, '').split(/\|/);
      for (i in a)
        if (nativeTypes.indexOf(a[i]) < 0 && customTypes[a[i]] === undefined) {
          throw 'Invalid type';
          return false;
        }

      if (obj === null || obj === undefined)
        return !!type.match(/^\?/, '');
      else
        type = type.replace(/^\?/, '');

      for (i in a)
        if (customTypes[a[i]])
          if (
            (typeof customTypes[a[i]].type === 'function') ?
            (customTypes[a[i]].type(obj) === true) :
            this.check(customTypes[a[i]].type, obj, customTypes[a[i]])
          )
            return true;

      return !!(~a.indexOf('*') || ~a.indexOf(typeOf));
    } else if (this.get(type) === 'object') {
      if (typeOf !== 'object')
        return false;
      for (k in type)
        if (!this.check(type[k], obj[k]))
          return false;

      for (k in obj)
        if (type[k] === undefined)
          return false;

      return true;
    } else if (this.get(type) === 'array') {
      if (typeOf !== 'array')
        return false;

      if (type.length !== 1) {
        throw 'Invalid type';
      }

      for (k in obj)
        if (!this.check(type[0], obj[k]))
          return false;

      return true;
    } else
      return false;
  },
  isValid: function(type) {
    var a,
        k,
        i;

    if (this.get(type) === 'string') {
      a = type.replace(/^\?/, '').split(/\|/);
      for (i in a)
        if (nativeTypes.indexOf(a[i]) < 0 && customTypes[a[i]] === undefined)
          return false;
      return true;

    } else if (this.get(type) === 'object') {
      for (k in type)
        if (!this.isValid(type[k]))
          return false;
      return true;

    } else if (this.get(type) === 'array')
      return type.length === 1 ?
        this.isValid(type[0]) :
        false;
    else
      return false;
  }
};

// Add a type "type" to shortcut the isValid method:
types.add('type', function(v) {
  return types.isValid(v);
});

module.exports = types;
