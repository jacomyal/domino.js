'use strict';

var types = require('typology');

// Main forge
function forge(scope) {
  return {
    componentWillMount: function() {
      // Referencing the controller
      this[scope.settings('mixinControllerName')] = scope;

      // Quick exit
      if (!this.renderOn)
        return;

      // Checking validity of renderOn argument
      if (!types.check(this.renderOn, ['string']) &&
          !types.check(this.renderOn, 'string'))
        throw new Error('domino.mixin: the renderOn property expected ' +
                        'either a single event or an array of events but ' +
                        'received ', this.renderOn);

      // Referencing the controller listener
      this.__listener = (function() {
        this.forceUpdate();
      }).bind(this);
    },

    componentDidMount: function() {
      // Quick exit
      if (!this.renderOn)
        return;

      // Binding event listeners
      (typeof this.renderOn === 'string' ?
        [this.renderOn] :
        this.renderOn).forEach(function(event) {
          scope.on(event, this.__listener);
        }, this);
    },

    componentWillUnmount: function() {
      // Quick exit
      if (!this.renderOn)
        return;

      // Unbinding event listeners
      (typeof this.renderOn === 'string' ?
        [this.renderOn] :
        this.renderOn).forEach(function(event) {
          scope.off(event, this.__listener);
        }, this);
    }
  };
}

// Exporting
module.exports = forge;
