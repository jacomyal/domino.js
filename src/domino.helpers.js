'use strict';

var types = require('./domino.types.js');

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

module.exports = {
  clone: clone
};
