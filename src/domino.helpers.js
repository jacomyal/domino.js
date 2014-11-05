'use strict';

var types = require('typology');

/**
 * This function returns a deep clone of an object. It will copy its scalar
 * attributes, and recursively clone its complex objects attributes.
 *
 * Example:
 * ********
 *  > var o1 = {
 *  >       a: {,
 *  >         b: 1
 *  >       }
 *  >     };
 *  >     o2 = clone(o1);
 *  >
 *  > o1.a.b = 2;
 *  > console.log(o2.a.b);
 *  will log 1.
 *
 * @param  {object} item The object to clone.
 * @return {object}      The clone.
 */
function clone(item) {
  if (!item)
    return item;

  var result,
      i,
      k,
      l;

  if (types.check(item, 'array')) {
    result = [];
    for (i = 0, l = item.length; i < l; i++)
      result.push(clone(item[i]));

  } else if (types.check(item, 'date')) {
    result = new Date(item.getTime());

  } else if (types.check(item, 'object')) {
    if (item.nodeType && typeof item.cloneNode === 'function')
      result = item;
    else if (!item.prototype) {
      result = {};
      for (i in item)
        result[i] = clone(item[i]);
    } else
      result = item;
  } else {
    result = item;
  }

  return result;
}

/**
 * This function takes any number of objects as arguments, copies from each
 * of these objects each pair key/value into a new object, and finally
 * returns this object.
 *
 * The arguments are parsed from the last one to the first one, such that
 * when several objects have keys in common, the "earliest" object wins.
 *
 * Example:
 * ********
 *  > var o1 = {
 *  >       a: 1,
 *  >       b: 2,
 *  >       c: '3'
 *  >     },
 *  >     o2 = {
 *  >       c: '4',
 *  >       d: [ 5 ]
 *  >     };
 *  > extend(o1, o2);
 *
 *  will return:
 *  > {
 *  >   a: 1,
 *  >   b: 2,
 *  >   c: '3',
 *  >   d: [ 5 ]
 *  > };
 *
 * @param  {object+} Any number of objects.
 * @return {object}  The merged object.
 */
function extend() {
  var i,
      k,
      res = {},
      l = arguments.length;

  for (i = l - 1; i >= 0; i--)
    for (k in arguments[i])
      res[k] = arguments[i][k];

  return res;
}

/**
 * This function will recursively browse an object (or array), and return a deep
 * clone of this object (or array), but with every scalar objects transformed
 * with a function given as argument.
 *
 * Example:
 * ********
 *  > var o = {
 *  >       a: 'toto',
 *  >       b: 123,
 *  >       c: {
 *  >         d: 'tata',
 *  >         d: 42
 *  >       }
 *  >     };
 *  > browse(o, function(s) {
 *  >   return typeof s === 'string' ? s.toUpperCase() : s;
 *  > });
 *
 *  will return:
 *  > {
 *  >   a: 'TOTO',
 *  >   b: 123,
 *  >   c: {
 *  >     d: 'TATA',
 *  >     d: 42
 *  >   }
 *  > };
 *
 * @param  {object}   item The object to browse.
 * @param  {function} fn   The function to transform scalars.
 * @return {object}        The transformed clone.
 */
function browse(item, fn) {
  var i,
      k,
      l,
      res = {};

  if (Array.isArray(item)) {
    res = [];
    for (i = 0, l = item.length; i < l; i++)
      res.push(browse(item[i], fn));

  } else if (item && typeof item === 'object') {
    res = {};
    for (k in item)
      res[k] = browse(item[k], fn);

  } else
    res = fn(item);

  return res;
}

module.exports = {
  clone: clone,
  extend: extend,
  browse: browse
};
