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
      readRow: {
        url: '/data/:id'
      },
      readAll: {
        url: '/data/',
        success: function(data) {
          this.update('rows', data.result);
        }
      },
      updateRow: {
        url: '/data/:id',
        type: 'POST',
        data: { data: ':message' },
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
        type: 'DELETE',
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

    it('should work with POST services calls (with URL and data solving)', function(done) {
      controller.request('updateRow', {
        id: '1',
        message: 'Dolores sit amet',
        success: function() {
          setTimeout(function() {
            assert.deepEqual(controller.get('rows'), [{ id: '1', data: 'Dolores sit amet' }]);
            done();
          });
        }
      });
    });

    it('should work with DELETE services calls (with URL solving)', function(done) {
      controller.request('deleteRow', {
        id: '1',
        success: function() {
          setTimeout(function() {
            assert.deepEqual(controller.get('rows'), []);
            done();
          });
        }
      });
    });

    it('should work with the "then" method (when success)', function(done) {
      controller.request('createRow', {data: {data: 'Lorem ipsum'}})
        .then(
          function(data) {
            assert(this instanceof domino);

            setTimeout(function() {
              assert.deepEqual(controller.get('rows'), [{ id: '2', data: 'Lorem ipsum' }]);
              done();
            });
          },
          function(djxhr, status, error) {
            throw new Error('Unexpected error.');
          }
        );
    });

    it('should work with the "then" method (when error)', function(done) {
      controller.request('readRow', {id: '1'})
        .then(
          function(data) {
            throw new Error('Unexpected success.');
          },
          function(djxhr, status, error) {
            assert(djxhr instanceof XMLHttpRequest);
            assert(status === 'error');
            assert(error === 'Row not found');
            assert(this instanceof domino);
            done();
          }
        );
    });

    it('should work with the "done" method', function(done) {
      controller.request('readRow', {id: '2'})
        .done(function(data) {
          assert(data.result.data === 'Lorem ipsum');
          assert(this instanceof domino);
          done();
        });
    });

    it('should work with the "fail" method', function(done) {
      controller.request('readRow', {id: '1'})
        .fail(function(djxhr, status, error) {
          assert(djxhr instanceof XMLHttpRequest);
          assert(status === 'error');
          assert(error === 'Row not found');
          assert(this instanceof domino);
          done();
        });
    });
  });
});
