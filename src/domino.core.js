;(function() {
  'use strict';

  var __root = this,
      __instances = {};

  __root.domino = function() {
    // Private properties:
    var _self = this,

        _stackFuture = [],
        _stackCurrents = [],

        _timeout,
        _executionLock,

        _data = {};

    function _addOrder(order, now) {
      // TODO:
      // Validate order's structure.

      _stackFuture.push(order);

      if (!_timeout && !_executionLock) {
        if (now)
          _execute();
        else
          _timeout = setTimeout(_execute, 0);
      }
    }

    function _execute() {
      if (_executionLock)
        throw 'The execution is not unlocked yet';

      // Set state
      _timeout = null;
      _executionLock = true;
      _stackCurrents = _stackFuture;
      _stackFuture = [];

      var order;
      while ((order = _stackCurrents.pop()))
        _executeOrder(order);

      // Update lock flag
      _executionLock = false;

      if (_stackFuture.length)
        _timeout = setTimeout(_execute, 0);
    }

    function _executeOrder(order) {
      if (!order || typeof order !== 'object')
        throw 'Wrong parameter';

      if (typeof order.type !== 'number')
        throw 'Order\'s type not specified';

      switch (order.type) {
        case 'update':
          _updateProperty(
            order.property,
            order.value
          );
          break;
        case 'request':
          _requestService(
            order.service,
            order.options
          );
          break;
        case 'trigger':
          _triggerEvent(
            order.event,
            order.data
          );
          break;
        default:
          throw 'Unknown order type "' + order.type + '"';
      }
    }

    // Data related functions:
    function _addProperty(options) {
      // TODO
    }
    function _updateProperty(property, value) {
      // TODO
    }
    function _getProperty(property) {
      // TODO
    }

    // Services related functions:
    function _addService(options) {
      // TODO
    }
    function _requestService(service, options) {
      // TODO
    }

    // Events related functions:
    function _triggerEvent(event, data) {
      // TODO
    }

  };
}).call(this);
