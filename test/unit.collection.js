// TODO: add relevant tests when code is done.
var domino = require('../src/domino.core.js');
domino.settings.verbose = false;

module.exports = {
  properties: require('./suites/properties.test.js'),
  services: require('./suites/services.test.js'),
  workflow: require('./suites/workflow.test.js'),
  helpers: require('./suites/helpers.test.js'),
  facets: require('./suites/facets.test.js'),
  api: require('./suites/api.test.js')
};
