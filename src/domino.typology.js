'use strict';

var Typology = require('typology');

// Orders
var orderTypes = {
  update: {
    type: 'string',
    property: 'string',
    value: '*'
  },
  emit: {
    type: 'string',
    events: 'string|array',
    data: '?*'
  }
};

// Exporting the custom typology
module.exports = new Typology({
  'domino.events': function(val) {
    return typeof val === 'string' || this.check(val, ['string']);
  },
  'domino.name': function(val) {
    return typeof val === 'string' &&
           !!val.match(/^[a-zA-Z_$-][a-zA-Z_$0-9-]*$/);
  },
  'domino.property': function(obj) {
    return this.check(obj, {
      id: 'domino.name',
      type: '?type',
      description: '?string',
      namespace: '?domino.name',
      emit: '?domino.events',
      value: '?*'
    }) && (!obj.type || this.check(obj.value, obj.type));
  },
  'domino.facet': {
    id: 'domino.name',
    description: '?string',
    namespace: '?domino.name',
    get: 'function'
  },
  'domino.service': function(obj) {
    return (
      this.check(obj, 'object') &&
      this.check(obj.id, 'domino.name') &&
      this.check(obj.url, 'string')
    );
  },
  'domino.order': function(obj) {
    return (
      this.check(obj, 'object') &&
      this.check(obj.type, 'string') &&
      this.check(obj, orderTypes[obj.type])
    );
  }
});
