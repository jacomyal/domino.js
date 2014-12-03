# Omino projects specifications

## Controller instantiation

```js
var app = new domino({

  // Application initial state
  state: {
    primitive: 3,
    one: {
      subone: {
        hello: 'world'
      },
      subtwo: {
        colors: ['blue', 'yellow']
      }
    },
    two: {
      firstname: 'John',
      lastname: 'Dillinger'
    },
    setLater: null
  },

  // Custom Types
  types: {
    subtow: {
      colors: ['string']
    }
  },

  // Data validation
  validate: {
    primitive: 'primitive',
    one: {
      subone: 'object',
      subtwo: 'subtwo'
    },
    two: 'object',
    setLater: '?string'
  },

  // Bindings
  // ISSUE: pre-update hacking
  bindings: {
    event1: function(e) {
      // Act...
    }
  },

  // Services
  services: {
    getColor: {
      type: 'POST',
      url: '/color/:id'
    }
  },

  // Facets - need to change accessor, `.get` is no longer
  // practical here. `resolve`? back to `shortcut`?
  facets: {
    fullname: function() {
      return this.get('two', 'firstname') + ' ' + this.get('two', 'lastname');
    }
  },

  // Custom settings
  settings: {
    toJS: true,
    verbose: true
  }
});
```

## Typology mappings

```js
app.types.check(v, '?definedType');
```

## Emmett mappings

```js
app.on...
app.emit...
```

## Baobab mappings

```js
// The following are equals to the app's Baobab's ones
app.get
app.set
app.update
app.select
```

## React mixin

Same as current as top-level baobab one.
Stateful event mixin?
Refer the controller to `this.control` through the controller mixin.

## Steps

* Add baobab
* Drop properties-related items
* Integrate baobab
* Service integration
* Bindings
* Ensure kill is correctly done
