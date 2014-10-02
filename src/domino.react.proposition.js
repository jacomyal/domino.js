'use strict';

var types = require('typology');

// Main forge
function forge(scope) {
  return {
    componentWillMount: function() {

      // Checking validity of renderOn argument
      // NOTE: this is not currently possible to check this with typology
      // with a single call
      if (!types.check(this.renderOn, ['string']) &&
          !types.check(this.renderOn, 'string'))
        throw new Error('MESSAGE_TO_BE_DECIDED');

      // Referencing the controller
      this[scope.settings('TO_BE_DECIDED')] = scope;

      // Referencing the controller listener
      this.__listener = (function() {
        this.forceUpdate();
      }).bind(this);
    },
    componentDidMount: function() {

      // Binding event listeners
      (typeof this.renderOn === 'string' ?
        [this.renderOn] :
        this.renderOn).forEach(function(event) {
          scope.on(event, this.__listener);
        });
    },
    componentWillUnmount: function() {

      // Unbinding event listeners
      (typeof this.renderOn === 'string' ?
        [this.renderOn] :
        this.renderOn).forEach(function(event) {
          scope.off(event, this.__listener);
        });
    }
  }
}

// Exporting
module.exports = forge;
