domino.js - README
==================

*domino.js* is a JavaScript library to manage interactions in dashboards. It has been especially designed for iteractive processes, to obtain quickly **maintainable** proofs of concepts.

The modele is pretty simple: First, you define your **properties**, and associate input and output events to each of them. Then, you instanciate your **modules**, through *domino.js*'s modules factory. Finally, when a module will dispatch an event, it will automatically update the related properties, and the modules that are listening to these properties' output events. So you never have to connect two modules by yourself.

It might be easier with an example. In the following one, we just declare a *boolean* property, named "flag", and bind two modules on it - one to update it, and one to know when it is updated:

```js
// First, let's instanciate domino.js:
var d = new domino({
  properties: [
    // We only declare one property, named "flag", that will contain a
    // boolean value:
    {
      id: 'flag',
      dispatch: 'flagUpdated',
      triggers: 'updateFlag'
    }
  ]
});

// Here is the module that will modify the value:
function emettorModule() {
  domino.module.call(this);

  // We add a method to update easily the value:
  this.updateFlag = function(newFlagValue) {
    this.dispatchEvent('updateFlag', {
      flag: !!newFlagValue
    });
  }
}

// Here is the module that receive the events when the flag is updated.
function receptorModule() {
  domino.module.call(this);

  // We add a trigger on the "flagUpdated" event, that will just display the
  // new value
  this.triggers.events['flagUpdated'] = function(event) {
    console.log('New flag value: '+event.data.get('flag'));
  };
}

// Finally, we have to instanciate our modules:
var emettor = d.addModule(emettorModule),
    receptor = d.addModule(receptorModule);

// Now, let's test it:
emettor.updateFlag(true);  // log: "New flag value: true"
emettor.updateFlag(false); // log: "New flag value: false"
```

But the most important feature of *domino.js* is the possibility to add arbitrarily **hacks**. Basically, you will bind a function to events. This function will be executed in its own scope, and can update properties, call AJAX services, and a lot more.

The following example is basically the same than the previous one. But instead of a *boolean*, our property is a *string*, and we do not want it to exceed 5 characters. So, we add a hack bound on the output event of our property, and that will check the length of our string, and troncate it if it is too long:

```js
// As previously, let's first instanciate domino.js:
var d = new domino({
  properties: [
    // We only declare one property, named "string", that will contain a string
    // value:
    {
      id: 'string',
      dispatch: 'stringUpdated',
      triggers: 'updateString'
    }
  ],
  hacks: [
    {
      triggers: 'stringUpdated',
      method: function() {
        var str = this.get('string');

        if (str.length > 5) {
          console.log('The string has been troncated!');
          this.string = str.substr(0,5);
        }
      }
    }
  ]
});

// Here is the module that will dispatch
function emettorModule() {
  domino.module.call(this);

  // We add a method to update easily the value:
  this.updateString = function(newStringValue) {
    this.dispatchEvent('updateString', {
      string: newStringValue
    });
  }
}

// Here is the module that receive the events when the string is updated.
function receptorModule() {
  domino.module.call(this);

  // We add a trigger on the "stringUpdated" event, that will just display the
  // new value
  this.triggers.events['stringUpdated'] = function(event) {
    console.log('New string value: '+event.data.get('string'));
  };
}

// Finally, we have to instanciate our modules:
var emettor = d.addModule(emettorModule),
    receptor = d.addModule(receptorModule);

// Now, let's test it:
emettor.updateString('abc');       // log: "New string value: abc"
emettor.updateString('abcdefghi'); // log: "New string value: abcdefghi"
                                   //      "The string has been troncated!"
                                   //      "New string value: abcde"
```

## Properties:

The minimal declaration of a property is just a unique string **id**. Here is the exhaustive list of all the other parameters you can add to describe your property:

 - `{?string}` **label**:
   * The label of the property (the ID by default)
 - `{?(string|object)}` **type**:
   * Indicated the type of the property. Use "?" to specify a nullable property, and "|" for multiple valid types.
 - `{?*}` **value**:
   * The initial value of the property (obviously, it has to match the type).
 - `{?function}` **setter**:
   * Overrides the default property setter.
 - `{?function}` **getter**:
   * Overrides the default property getter.
 - `{?(string|array)}` **triggers**:
   * The list of events that can modify the property. Can be an array or the list of events separated by spaces.
 - `{?(string|array)}` **dispatch**:
   * The list of events that must be triggered after modification of the property. Can be an array or the list of events separated by spaces.

Here is a more complete example on how to declare string:

```js
// [...] inside the properties declaration:
{
  id: 'stringLessThan5Chars',
  label: 'String less than 5 chars',
  triggers: 'updateStringLessThan5Chars',
  dispatch: ['stringLessThan5CharsUpdate', 'stringUpdated'],
  type: 'string',
  setter: function(val) {
    // First, we check the length of the new value:
    val = val.length>5 ?
      val.substr(0,5) :
      val;

    // If the value has not change, returning false will cancel the update of
    // this property, ie the output events ('stringLessThan5CharsUpdate' and
    // 'stringUpdated') will not be dispatched.
    if(val === this.get('stringLessThan5Chars'))
      return false;

    this.stringLessThan5Chars = val;
    return true;
  },
  // Here, since the setter will be used to set the initial value, the initial
  // value will be "abcde" and not "abcdefghi":
  value: 'abcdefghi'
}
// [...]
```

It basically makes the same thing than in the second example, but without the use of an hack. Also

## Modules:

// TODO

## Hacks:

// TODO

## Main loop: Inside *domino.js*:

// TODO

## Scopes management:

There is a lot of functions given to *domino.js* through the initial configuration and the modules. One particularity of *domino.js* is that these methods are called in a specific scope, that contains safe accesses to different properties, and tools to display logs.

Also, for some type of functions, some other parameters or values can be added in the scope - and some parameters can be added or modified directly in the scope - something like:

```js
this.anyProperty = 42;
```

### Default scope methods:

Here is the default methods that any of the functions you give to *domino.js* will find in its scope.
 
 - **get** *(property, args...)*
   * Returns the current value of the specified property. The additional parameters are given to the getter, if this one has been customly defined.

 - **expand** *(shortcutId)*
   * Execute the specified shortcut, and returns the result.

 - **dump** *(args...)*
   * If domino global setting `verbose` is true, will display the arguments in the console, with the `domino.js` instance name as prefix.

 - **warn** *(message)*
   * If domino global setting `strict` is true, will throw a "message" error, with the `domino.js` instance name as prefix. Else, if domino global setting `verbose` is true, will display "message" in the console, with the `domino.js` instance name as prefix.

 - **die** *(message)*
   * Throws a "message" error, with the `domino.js` instance name as prefix.

 - **getEvents** *(property)*
   * Returns the array of events that the `domino.js` instance listen to update the specified property.

 - **getLabel** *(property)*
   * Returns the label of the specified property.

### Additional methods:

Also, some functions you will give to *domino.js* will have access to some more methods, that can update properties or call AJAX services. Here is the list of thoses methods:
 
 - **set** *(property, value, args...)*
   * Update the property's value, and returns `true` if the property has effectively been updated, `false` else.

 - **call** *(serviceId, options)*
   * Calls the specified service. Check the **Services** documentation to see which options you can use.

 - **addModule** *(class, options)*
   * Instanciate the specified module, plugs all the event connections, and returns the module instance.

 - **update** *(\{Array|Object\})*
   * If the given parameter is an `Object`, then each pair *key/value* will set the *value* the the property *key*. If the parameter is an `Array`, it must contain objects matching *{property: String, value: *, parameters: ?Array}* (it's the only way to use update with additional parameters to the setters). After having updated the properties, this method will also dispatch the related events.

**Important**: All the methods described (the default and the additional ones) are also available in the object returned by the *domino.js* constructor itself. Also, the default scope is always given as the **first** parameter to the modules constructors.

### Methods given to domino:

Here is the list of every types of functions you can give to *domino.js*, with the related specifications (what you can modify directly in the scope, which parameters are given, which additional methods are available):

 - **Hacks**:
   * Additional methods in the scope:
     + *call*
   * Parameters given through the scope: *(none)*
   * Function parameters:
     + `Object` event: The event that triggered the hack
   * Accepted scope modifications:
     + `Array<String>` this.events will be dispatched
     + `*` this[property] will update *property*
   * Returns: *(not evaluated)*

 - **Triggers (in modules)**:
   * Additional methods in the scope: *(none)*
   * Parameters given through the scope: *(none)*
   * Function parameters:
     + `Object` The dispatched event
   * Accepted scope modifications: *(none)*
   * Returns: *(not evaluated)*

 - **Service "success"**:
   * Additional methods in the scope:
     + *call*
   * Parameters given through the scope: *(none)*
   * Function parameters:
     + `Object` data: The data received from AJAX
   * Accepted scope modifications:
     + `Array<String>` this.events will be dispatched
     + `*` this[property] will update *property*
   * Returns: *(not evaluated)*

 - **Service "error"**:
   * Additional methods in the scope:
     + *call*
   * Parameters given through the scope: *(none)*
   * Function parameters:
     + `String` mes: The error message
     + `Object` xhr: The related XHR object
   * Accepted scope modifications:
     + `Array<String>` this.events will be dispatched
     + `*` this[property] will update *property*
   * Returns: *(not evaluated)*

 - **Service "url"**:
   * Additional methods in the scope: *(none)*
   * Parameters given through the scope: *(none)*
   * Function parameters: *(none)*
   * Accepted scope modifications: *(none)*
   * Returns:
     + `String` The final URL

 - **Service "data"**:
   * Additional methods in the scope: *(none)*
   * Parameters given through the scope: *(none)*
   * Function parameters:
     + `?*` If specified, the `data` attribute given in the overridding parameters
   * Accepted scope modifications: *(none)*
   * Returns:
     + `*` The data given to AJAX

 - **Shortcuts**:
   * Additional methods in the scope: *(none)*
   * Parameters given through the scope: *(none)*
   * Function parameters: *(none)*
   * Accepted scope modifications: *(none)*
   * Returns:
     + `*` Anything you want, that's the point of the shortcuts

 - **Custom setters**:
   * Additional methods in the scope: *(none)*
   * Parameters given through the scope:
     + `*` this[property] contains the current value of the property
   * Function parameters:
     + `*` The new value, given to `.set(property, newValue)`
     + `*` Eventually other parameters, if you are using custom setters
   * Accepted scope modifications:
     + `*` this[property] contains the new value of the property
   * Returns:
     + `?Boolean` If you return a boolean value, the property will be updated and the related events dispatched only if the returned boolean is `true`

 - **Custom getters**:
   * Additional methods in the scope: *(none)*
   * Parameters given through the scope:
     + `*` this[property] contains the current value of the property
   * Function parameters:
     + `*` Eventually parameters, if you are using custom getters
   * Accepted scope modifications: *(none)*
   * Returns:
     + `*` The value you want to see returned through `.get(property)`

## Utils:

// TODO

## Logs and global settings:

// TODO