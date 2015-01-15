'use strict';

var types = require('typology');

// Main forge
function forge(scope) {
  return {
    mixins: scope.state ? [scope.state.mixin] : [],
    getInitialState: function() {
      // Initializing state for convenience
      return {};
    },
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
      this.__eventListener = (function(e) {
        this.setState({event: e});
      }).bind(this);
    },

    componentDidMount: function() {
      // Quick exit
      if (!this.renderOn)
        return;

      // Binding event listeners
      (typeof this.renderOn === 'string' ?
        [this.renderOn] :
        this.renderOn).forEach(function(eventName) {
          scope.on(eventName, this.__eventListener);
        }, this);
    },

    componentWillUnmount: function() {
      // Quick exit
      if (!this.renderOn)
        return;

      // Unbinding event listeners
      (typeof this.renderOn === 'string' ?
        [this.renderOn] :
        this.renderOn).forEach(function(eventName) {
          scope.off(eventName, this.__eventListener);
        }, this);
    }
  };
}

// Exporting
module.exports = forge;
