var assert = require('assert'),
    domino = require('../../src/domino.core.js'),
    Typology = require('typology'),
    types = domino.types;

describe('API', function() {
  describe('Constructor', function() {
    it('should not throw an error and return a new instance', function() {
      var controller = new domino();
    });

    it('should throw a relevant error when "options" argument is not valid', function() {
      assert.throws(
        function() { new domino({ properties: { myProp: 123 } }); },
        /Wrong type/
      );
    });

    it('should register an instance under its given name', function() {
      var controller = new domino({ name: 'API.constructor.test1' });
      assert(controller === domino.instances('API.constructor.test1'));
    });

    it('should throw if the name already exists or if the name is not a string', function() {
      var controller = new domino({ name: 'API.constructor.test2' });
      assert.throws(function() {
        new domino({ name: 'API.constructor.test2' });
      });
      assert.throws(function() {
        new domino({ name: 123 });
      });
    });

    it('should have all its public methods', function() {
      var controller = new domino();
      assert(types.check(controller.register, 'function'));
      assert(types.check(controller.registerFacet, 'function'));
      assert(types.check(controller.registerFacets, 'function'));
      assert(types.check(controller.registerProperty, 'function'));
      assert(types.check(controller.registerProperties, 'function'));
      assert(types.check(controller.update, 'function'));
      assert(types.check(controller.get, 'function'));
      assert(types.check(controller.child, 'function'));
      assert(types.check(controller.on, 'function'));
      assert(types.check(controller.off, 'function'));
      assert(types.check(controller.emit, 'function'));
      assert(types.check(controller.settings, 'function'));
      assert(types.check(controller.debug, 'function'));
      assert(types.check(controller.info, 'function'));
      assert(types.check(controller.warn, 'function'));
      assert(types.check(controller.die, 'function'));
    });

    it('should register properties and facets given in arrays', function() {
      var controller = new domino({
        properties: [
          { id: 'p1', type: 'string', value: 'abc' },
          { id: 'p2', type: 'number', value: 123 }
        ],
        facets: [
          { id: 'f1', get: function() { return 'def'; } },
          { id: 'f2', get: function() { return 456; } }
        ]
      });

      assert(controller.get('p1') === 'abc');
      assert(controller.get('p2') === 123);
      assert(controller.get('f1') === 'def');
      assert(controller.get('f2') === 456);
    });

    it('should register properties and facets given in objects', function() {
      var controller = new domino({
        properties: {
          p1: { type: 'string', value: 'abc' },
          p2: { type: 'number', value: 123 }
        },
        facets: {
          f1: { get: function() { return 'def'; } },
          f2: function() { return 456; }
        }
      });

      assert(controller.get('p1') === 'abc');
      assert(controller.get('p2') === 123);
      assert(controller.get('f1') === 'def');
      assert(controller.get('f2') === 456);
    });

    it('should bind listeners given as bindings to the controller', function(done) {
      var count1 = 0,
          controller = new domino({
            bindings: {
              myEvent1: function() {
                count1++;
                controller.emit('myEvent2');
              },
              myEvent2: function() {
                count1++;
              }
            }
          });

      controller.emit('myEvent1');
      setTimeout(function() {
        assert(count1 === 2);
        done();
      }, 0);
    });

    it('should be possible to declare custom types at instantiation.', function() {
      var controller = new domino({
        types: {
          weird: function(v) {
            return v === 'weird';
          }
        }
      });

      assert(controller.types instanceof Typology);
      assert(controller.types.isValid('weird'));
      assert(controller.types.check('weird', 'weird'));
    });
  });

  describe('#.kill', function() {
    it('should free the related name', function() {
      var controller = new domino({ name: 'API.kill.test1' });
      controller.kill();

      // Create a new controller with the same name:
      new domino({ name: 'API.kill.test1' });
    });
  });

  describe('#.settings', function() {
    it('should heritate from the domino.settings object', function() {
      var controller = new domino();
      assert(controller.settings('mySetting') === undefined);

      domino.settings.mySetting = 'globalValue';
      assert(controller.settings('mySetting') === 'globalValue');

      controller.settings('mySetting', 'instanceValue');
      assert(controller.settings('mySetting') === 'instanceValue');

      controller.settings('mySetting', undefined);
      assert(controller.settings('mySetting') === 'globalValue');
    });
  });

  describe('#.register', function() {
    it('should register properties and facets given in arrays', function() {
      var controller = new domino();

      controller.register({
        properties: [
          { id: 'p1', type: 'string', value: 'abc' },
          { id: 'p2', type: 'number', value: 123 }
        ],
        facets: [
          { id: 'f1', get: function() { return 'def'; } },
          { id: 'f2', get: function() { return 456; } }
        ]
      });

      assert(controller.get('p1') === 'abc');
      assert(controller.get('p2') === 123);
      assert(controller.get('f1') === 'def');
      assert(controller.get('f2') === 456);
    });

    it('should register properties and facets given in objects', function() {
      var controller = new domino();

      controller.register({
        properties: {
          p1: { type: 'string', value: 'abc' },
          p2: { type: 'number', value: 123 }
        },
        facets: {
          f1: { get: function() { return 'def'; } },
          f2: function() { return 456; }
        }
      });

      assert(controller.get('p1') === 'abc');
      assert(controller.get('p2') === 123);
      assert(controller.get('f1') === 'def');
      assert(controller.get('f2') === 456);
    });

    // Test services for browser only:
    if (typeof document === 'object')
      it('should register services given in arrays', function(done) {
        var controller = new domino();

        controller.register({
          services:  [
            { id: 's1', url: '/ping/:data' },
            { id: 's2', url: '/ping/:data' }
          ]
        });

        controller
          .request('s1', { data: 'test1' })
          .done(function(data) {
            assert(data.data === 'test1');
            this
              .request('s1', { data: 'test2' })
              .done(function(data) {
                assert(data.data === 'test2');
                done();
              });
          });
      });

    // Test services for browser only:
    if (typeof document === 'object')
      it('should register services given in objects', function(done) {
        var controller = new domino();

        controller.register({
          services: {
            s1: { url: '/ping/:data' },
            s2: { url: '/ping/:data' }
          }
        });

        controller
          .request('s1', { data: 'test1' })
          .done(function(data) {
            assert(data.data === 'test1');
            this
              .request('s1', { data: 'test2' })
              .done(function(data) {
                assert(data.data === 'test2');
                done();
              });
          });
      });
  });

  describe('Emmett\'s methods', function() {
    it('#on should bind the handler, and execute it when #emit is called', function(done) {
      var controller = new domino();

      controller.on('myEvent', function(e) {
        done();
      });

      controller.emit('myEvent');
    });

    it('#off should unbind the handler, and prevent it to be called when #emit is called', function(done) {
      var controller = new domino(),
          count = 0,
          handler = function(e) {
            count++;
          };

      controller.on('myEvent', handler);
      controller.off('myEvent', handler);
      controller.emit('myEvent');

      setTimeout(function() {
        assert(count === 0);
        done();
      }, 30);
    });

    it('should send the data of the event', function(done) {
      var controller = new domino();

      controller.on('myEvent', function(e) {
        assert(e.data === 'myData');
        done();
      });

      controller.emit('myEvent', 'myData');
    });

    it('should bind the handlers to the controller', function(done) {
      var controller = new domino({
        facets: {
          myFacet: function() { return 'bim'; }
        }
      });

      controller.on('myEvent', function() {
        assert(this.get('myFacet'), 'bim');
        done();
      });

      controller.emit('myEvent');
    });

    it('should execute the handler only once when using #once', function(done) {
      var controller = new domino({
        properties: {
          myProp: {
            type: 'number',
            value: 0
          }
        }
      });

      controller.once('myEvent', function() {
        this.update('myProp', this.get('myProp') + 1);
      });

      setTimeout(function() {
        assert.equal(controller.get('myProp'), 1);
        done();
      }, 0);

      controller.emit('myEvent');
      controller.emit('myEvent');
      controller.go();
    });
  });
});
