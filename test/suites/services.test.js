var assert = require('assert'),
    domino = require('../../src/domino.core.js');

// Services tests are currently developed only for the browser environment:
if (typeof document !== 'object')
  return;

describe('Services', function() {
  var controller = new domino({
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
          this.update('rows', data.result);
        }
      },
      readRow: {
        url: '/data/:id',
        success: function(data) {
          this.update('rows', this.get('rows').map(function(row) {
            return row.id === data.result.id ? data.result : row;
          }));
        }
      },
      updateRow: {
        url: '/data/:id',
        type: 'POST',
        contentType: 'application/json',
        success: function(data) {
          this.update('rows', this.get('rows').map(function(row) {
            return row.id === data.result.id ? data.result : row;
          }));
        }
      },
      createRow: {
        url: '/data/',
        type: 'PUT',
        contentType: 'application/json',
        success: function(data) {
          this.update('rows', this.get('rows').concat([ data.result ]));
        }
      },
      deleteRow: {
        url: '/data/:id',
        contentType: 'application/json',
        success: function(data) {
          this.update('rows', this.get('rows').filter(function(row) {
            return row.id !== data.id;
          }));
        }
      },
    }
  });

  describe('Basic calls', function() {
    it('should work with GET services calls', function(done) {
      controller.request('readAll', function() {
        setTimeout(function() {
          assert.deepEqual(controller.get('rows'), []);
          done();
        });
      });
    });

    it('should work with PUT services calls', function(done) {
      controller.request('createRow', {
        data: { data: 'Lorem ipsum' },
        success: function() {
          setTimeout(function() {
            assert.deepEqual(controller.get('rows'), [{ id: '1', data: 'Lorem ipsum' }]);
            done();
          });
        }
      });
    });

    it('should work with POST services calls (with URL solving)', function(done) {
      controller.request('updateRow', {
        id: '1',
        data: { data: 'Dolores sit amet' },
        success: function() {
          setTimeout(function() {
            assert.deepEqual(controller.get('rows'), [{ id: '1', data: 'Dolores sit amet' }]);
            done();
          });
        }
      });
    });
  });
});
