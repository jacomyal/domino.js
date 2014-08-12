'use strict';

var styles =
      ('chrome' in global) ||
      ('navigator' in global) &&
      navigator.userAgent.match(/firefox/i),
    expand =
      styles ||
      typeof window === 'undefined' &&
      typeof global !== 'undefined',
    colors = {
      debug: '#000099',
      info: '#009900',
      warn: '#FF1500',
      die: '#FF0000'
    };

// Log override
function logger(color, method) {
  var args = [(styles ? '%c' : '') + '[domino]'];

  if (styles)
    args.push('color:' + color);

  args = args.concat(Array.prototype.slice.call(arguments, 2));

  console[method].apply(
    console,
    expand ?
      args :
      [args.map(function(v) { return '' + v; }).join(' ')]
  );
}

module.exports = {
  debug: function() {
    logger.apply(null, [colors.debug, 'log'].concat(
      Array.prototype.slice.call(arguments, 0)
    ));
  },
  info: function() {
    logger.apply(null, [colors.info, 'log'].concat(
      Array.prototype.slice.call(arguments, 0)
    ));
  },
  warn: function() {
    logger.apply(null, [colors.warn, 'warn'].concat(
      Array.prototype.slice.call(arguments, 0)
    ));
  },
  die: function() {
    logger.apply(null, [colors.die, 'error'].concat(
      Array.prototype.slice.call(arguments, 0)
    ));
  }
};
