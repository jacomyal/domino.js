var assert = require('assert'),
    domino = require('../../src/domino.core.js');

// Services tests are currently developed only for the browser environment:
if (typeof document !== 'object')
  return;

describe('Services', function() {
  var store = new domino({
    properties: {
      rows: {
        value: null,
        type: '?array',
        emit: 'rowsUpdated'
      }
    },
    services: {
      readAll: {
        url: '/data/',
        success: function(data) {
          store.update('rows', data.result);
        }
      },
      readRow: {
        url: '/data/:id',
        success: function(data) {
          store.update('rows', store.get('rows').map(function(row) {
            return row.id === data.result.id ? data.result : row;
          }));
        }
      },
      updateRow: {
        url: '/data/:id',
        type: 'POST',
        contentType: 'application/json',
        success: function(data) {
          store.update('rows', store.get('rows').map(function(row) {
            return row.id === data.result.id ? data.result : row;
          }));
        }
      },
      createRow: {
        url: '/data/',
        type: 'PUT',
        contentType: 'application/json',
        success: function(data) {
          store.update('rows', store.get('rows').concat([ data.result ]));
        }
      },
      deleteRow: {
        url: '/data/:id',
        contentType: 'application/json',
        success: function(data) {
          store.update('rows', store.get('rows').filter(function(row) {
            return row.id !== data.id;
          }));
        }
      },
    }
  });

  describe('Basic calls', function() {
    it('should update the "rows" property when calling "readAll"', function(done) {
      store.request('readAll', function() {
        setTimeout(function() {
          assert.deepEqual(store.get('rows'), []);
          done();
        }, 10);
      });
    });

    it('should solve the URL with ', function(done) {
      store.request('createRow', {
        data: { data: 'Lorem ipsum' },
        success: function() {
          setTimeout(function() {
            assert.deepEqual(store.get('rows'), [{ id: '1', data: 'Lorem ipsum' }]);
            done();
          }, 10);
        }
      });
    });
  });
});
