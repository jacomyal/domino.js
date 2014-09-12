# Domino - New version specifications draft

## Plan

### Concepts

* **controller**: the domino controller is the spine of the structure and is used to centralized data, dispatch event and register services and so on...
* **properties**: a piece of data stored by the controller.
* **types**: variables structural definition.
* **services**: a remote accessor of data. Services are used by a domino controller to fetch data from remote locations, typically through ajax.
* **facets**: functions reading a controller's properties to define views on the controller's data.

### React bootstrap

It should be painless and straightforward to plug React components into a controller's logic. A React mixin seems the best way to achieve this and the user should be able to access properties and choose to render when specific events are dispatched.

Bootsrapping the controller on a React component should only occur on top-level components so bottom-level ones keep abstract and separated from domino's logic to ensure reusability.

## API

### Instantiation

One should be able to indicate the following when instantiating a controller:

* **properties**
* **facets**
* **services**
* **listeners**
* **configuration**

```js
var controller = new domino(config[?object]);

// Example
var controller = new domino({
  properties: {
    firstname: 'string',
    lastname: {
      type: 'string',
      emit: 'arbitrary.event'
    }
  },
  facets: {
    fullname: function() {
      return this.get('firstname') + ' ' + this.get('lastname');
    },
    reverseFullname: {
      description: 'Retrieves the fullname backwards.',
      method: function() {
        return this.get('lastname') + ' ' + this.get('firstname');
      }
    }
  },
  services: {
    getData: '/cool/url/:var',
    postData: {
      url: '/other/cool/url',
      type: 'POST',
      success: function(data) {
        // do something with data
      }
    }
  },
  listeners: [
    {
      on: 'arbitrary.event',
      then: function() {
        // do something here
      }
    },
    {
      on: ['event1', 'event2'],
      then: function() {
        // do something here
      }
    }
  ],
  config: {
    log: {
      level: 'verbose'
    }
  }
})
```

### Properties

Properties are described thusly:

* **id** *string*: a unique identifier.
* **type** *?string* [`string`]: a variable type referring to an existing domino type.
* **value**: an initial value. If not specified and if the property is not indicated to be optional through the `?` type sigil, then the initial value should be something relevant like: `''` for a string.
* **emit** *?string|array*: events to be fired whenever the property is updated. Note that by default, a `propid.updated` event will be fired without having to specify it.
* **description** *?string*: an optional text describing the property for readability and help.

Lone scalar should mean **type**.

### Services

Properties are described thusly:

* **id** *string*: a unique identifier.
* **url** *string*: a url with possibly some variables and that will be called through ajax.
* **type** *?string* [`GET`]: HTTP verb.
* **success** *?function*: callback to be fired when data is retrieved. Take as arguments the results of the ajax call.
* **error** *?function*: callback to be fired when an error occured while retrieving data.
* **expect** *?function*: function used to validate received data.
* **emit** *?string|array*: events to be fired in case of success (with the ajax results as data).
* **property** *?string*: valid id of property to be updated by the service.
* **description** *?string*: an optional text describing the service for readability and help.

Need to find a way to make `contentType` and `dataType` less painful, plus maybe add a configuration item dealing with default behaviour.

Lone scalar should mean **url**.

### Listeners

Listeners are described thusly:

* **event** *string|array*: which event(s) should we listen?
* **callback** *function*: what to do when event is fired?
* **description** *?string*: an optional text describing the listener for readability and help.

Lone scalar should mean **callback**.

### Facets

Facets are described thusly:

* **id** *string*: a unique identifier.
* **callback**: a function taking no arguments and returning a view on properties.
* **description** *?string*: an optional text describing the facet for readability and help.

Lone scalar should mean **callback**.

### External registers

One should be able to register anything for a controller out the mere instantiation process. Those low-level methods should btw used by the instantiation to perform correctly.

```js
// Total register
controller.register(config[object]);

controller.register({
  properties: {
    myprop: 'string'
  },
  services: ...
});

// Plural register
controller.registerProperties(properties[object]);

controller.registerProperties({
  prop1: 'number',
  prop2: {
    type: 'string',
    value: 'Hello!'
  }
});

// Singular register
controller.registerProperty(name[string|object], description[?object]);

controller.registerProperty('myprop', {type: 'string', value: 'Hello!'});
controller.registerProperty({id: 'myprop', type: 'string', value: 'Hello!'});
```

### Event system

```js
// Firing events
controller.emit('event', data);
controller.emit('event1', 'event2', data);
controller.emit(['event1', 'event2'], data);

// Listening to events
controller.on('event', callback(e));
controller.on('event1', 'event2', callback(e));
controller.on(['event1', 'event2'], callback(e));

// Detaching listeners
controller.off('event', callback);

// Detaching every listerners on event?
controller.off('event');
```

### Binders

A simple way to create and remove batches of listeners. (Basic controller listeners should be a binder in that regard.).

Moreover, in binders callbacks, `this` should naturally refer to the controller.

```js
var binder = new controller.binder(config[object]);

// Example
var binder = new controller.binder([
  {
    on: 'event1',
    then: fn1
  },
  {
    on: 'event2',
    then: fn2
  }
]);

// Removing the binder
binder.remove();

// Reinstate
binder.place();

// A binder should extend the controller's event methods in a way
binder.on('event', fn);
binder.off('event', fn);
```

### Model access

```js
// Getting properties
controller.get(key[string]);
controller.get(keys[array]);

// Updating properties
controller.update(key[string], value[mixed]);
controller.update(specs[object]);

controller.update({
  prop1: 'this',
  prop2: 'that'
});

// Update events
controller.on('prop.updated', function(e) {
  // e.data.prop should contain the new value of prop
});
```

### Services

```js
// Using a service
controller.request(id[string], config[?object]);

// Example
controller.request('getData', {
  params: {},
  data: {}
});
```

### Help

Like for domino1, the new version should be able to print some useful information about the controller in the console.

```js
controller.help(which[?string]);

// Full help
controller.help();

// Targeted help
controller.help('properties');
```

### Extension

It should be possible to plug your own methods in domino or in one of the controller.

Example, when working with realtime, I like to be able to dispatch two events with a single method. (Examples to come).

### Configuration

Configuration should be attached to a controller instance and not to the global object as it used to be.

* **log**: relative to log.
* **services**: default behaviours for services.
* **events**: relative to events like the delimiter (`.`, `-`, `camelCase`).

### React mixin

```js
var MyComponent = React.createClass({
  mixins: [controller.mixin],
  renderOn: 'name.updated',

  renderItem: function(name) {
    return <li>{name}</li>;
  },
  render: function() {
    return <ul>{this.controller.get('names').map(this.renderItem);}</ul>;
  }
});
```

## Decisions to be made

1. What name for the controller's accessor property in a React component? (`this.store`, `this.controller`, plain `this.get(x)`)
2. What name for the function property in listeners configuration? (`fire`, `trigger`, `method`)
3. What name for registration? (`register`)
4. Should the user be able to use the controller logger?
5. If tiles were to be accepted, maybe the listeners part of the registers is no more coherent.

6. Should it be possible to add types in the controller constructor?
