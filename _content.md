domino.js
=========

Current version: **v1.0**

*domino.js* is a JavaScript cascading controller for fast interactive Web interfaces prototyping, developped by [Alexis Jacomy](http://github.com/jacomyal) at [Linkfluence](http://github.com/linkfluence). It is released under the [MIT License](https://raw.github.com/jacomyal/domino.js/master/LICENSE.txt).

### How to use it:

To use it, clone the repository:

```
git clone git@github.com:jacomyal/domino.js.git
```

The latest minified version is available here:

[https://raw.github.com/jacomyal/domino.js/master/build/domino.min.js](https://raw.github.com/jacomyal/domino.js/master/build/domino.min.js)

You can also minify your own version:

 - First, download the [Google Closure Compiler](https://developers.google.com/closure/compiler/) and copy it to `build/compiler.jar`.
 - Then, use `make` and you will find the file `domino.min.js` in the `build` directory.

### Contributing:

You can contribute by submitting [issues tickets](http://github.com/jacomyal/domino.js/issues) and proposing [pull requests](http://github.com/jacomyal/domino.js/pulls).

<hr />

## Navigation:

 - [Introduction](#introduction)
 - [Properties](#properties)
 - [Modules](#modules)
 - [Hacks](#hacks)
 - [Services](#services)
 - [Main loop: Inside *domino.js*](#main_loop_inside_domino_js)
 - [Scopes management](#scopes_management)
 - [Logs and global settings](#logs_and_global_settings)
 - [Structures](#structures)

<hr />

<h2 id="introduction">Introduction <a href="#" class="right" title="Back to the top">(&uarr;)</a></h2>

***domino.js* is a JavaScript library to manage interactions in dashboards**. It has been especially designed for iterative processes, to obtain quickly **maintainable** proofs of concepts.

The concept is pretty simple:

 1. First, you define your **properties** (that describe your data as well as all the minor counts/flags that define the state of your interface), and associate input and output events to each of them.
 2. Then, you instanciate your **modules** (that basically define all the graphic components that display or make possible to modify the properties), through *domino.js*'s modules factory, that will take care of all the connecting part.
 3. Finally, when a module will dispatch an event, it will automatically update the related properties, and the modules that are listening to these properties' output events. **So you never have to connect two modules by yourself.**

But the most important feature of *domino.js* is probably the possibility to add arbitrarily **hacks**. A hack is just a function bound to one or more events. This function will be executed in its own scope, and can update properties, call AJAX services, dispatch other events, and a lot more. So basically, **it gives a strict and clear place to write all those sh\*tty features that were not considered in your original design.**

It might be easier with **examples**. In the following one, we just declare a *boolean* property, named "flag", and bind two modules on it - one to update it, and one to know when it is updated:

```js
// First, let's instanciate domino.js:
var d = new domino({
  properties: [
    // We only declare one property, named "flag", that will contain
    // a boolean value:
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
    // The method "dispatchEvent" from "domino.module" will trigger
    // the update in the domino.js instance. So, it will update the
    // value, and then check if anything is bound the any of the
    // output events, and trigger:
    this.dispatchEvent('updateFlag', {
      flag: !!newFlagValue
    });
  }
}

// Here is the module that receive the events when the flag is
// updated.
function receptorModule() {
  domino.module.call(this);

  // We add a trigger on the "flagUpdated" event, that will just
  // display the new value:
  this.triggers.events['flagUpdated'] = function(dominoInstance) {
    console.log('New flag value: '+dominoInstance.get('flag'));
  };
}

// Finally, we have to instanciate our modules:
var emettor = d.addModule(emettorModule),
    receptor = d.addModule(receptorModule);

// Now, let's test it:
emettor.updateFlag(true);  // log: "New flag value: true"
emettor.updateFlag(false); // log: "New flag value: false"
```

Now, the following example is basically the same than the previous one. But instead of a *boolean*, our property is a *string*, and we do not want it to exceed 5 characters. So, we add a **hack** bound on the output event of our property, and that will check the length of our string, and truncate it if it is too long:

```js
// As previously, let's first instanciate domino.js:
var d = new domino({
  properties: [
    // We only declare one property, named "string", that will
    // contain a string value:
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
          console.log('The string has been truncated!');
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

// Here is the module that receive the events when the string
// is updated.
function receptorModule() {
  domino.module.call(this);

  // We add a trigger on the "stringUpdated" event, that will
  // just display the new value:
  this.triggers.events['stringUpdated'] =
    function(dominoInstance) {
      console.log(
        'New string value: '+dominoInstance.get('string')
      );
    };
}

// Finally, we have to instanciate our modules:
var emettor = d.addModule(emettorModule),
    receptor = d.addModule(receptorModule);

// Now, let's test it:
emettor.updateString('abc');
  // log: "New string value: abc"
emettor.updateString('abcdefghi');
  // log: "New string value: abcdefghi"
  //      "The string has been truncated!"
  //      "New string value: abcde"
```

<h2 id="properties">Properties <a href="#" class="right" title="Back to the top">(&uarr;)</a></h2>

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
  // In this example, we associate two output events to the
  // property. It is often useful - for example if you have to
  // reinitialize some data or call a service when one on ten
  // different properties is updated:
  dispatch: ['stringLessThan5CharsUpdate', 'aStringIsUpdated'],
  type: 'string',
  setter: function(val) {
    // First, we check the length of the new value:
    val = val.length>5 ?
      val.substr(0,5) :
      val;

    // If the value has not changed, returning false will cancel
    // the update of this property, ie the output events
    // ('stringLessThan5CharsUpdate' and 'aStringIsUpdated') will
    // not be dispatched.
    if(val === this.get('stringLessThan5Chars'))
      return false;

    this.stringLessThan5Chars = val;
    return true;
  },
  // Here, since the setter will be used to set the initial value,
  // the initial value will be "abcde" and not "abcdefghi":
  value: 'abcdefghi'
}
// [...]
```

It basically makes the same thing as in the second example, but without the use of a hack.

<h2 id="modules">Modules <a href="#" class="right" title="Back to the top">(&uarr;)</a></h2>

Most of the time, the **modules** represent each graphic components - *buttons* to dispatch events, *checkboxes* to represent `boolean` properties, etc... Exactly as it is for the properties, designing your modules atomically is one of the best ways to keep your code *maintainable*.

Any module must extend the `domino.module` basic class. This class has just the methods to listen to and dispatch events, and empty objects that you will fill with your **triggers**. You can bind a trigger on an *event* or directly to a *property* (it will then be triggered any time the property is effectively updated).

Here is a quick and pratical example using jQuery, of a module corresponding to an HTML *checkbox*, and representing the boolean property "flag" from the first example:

```js
function Checkbox() {
  domino.module.call(this);

  var self = this,
      html = $('<fieldset>' +
                 '<input type="checkbox" id="flag" />' +
                 '<label for="flag">Flag</label>' +
               '</fieldset>');

  // When the checkbox is clicked, it will update the "flag" in
  // domino, and dispatch output events:
  html.find('input').change(function() {
    var data = {};
    data['flag'] = $(this).is(':checked');

    // Dispatch the event
    self.dispatchEvent('updateFlag', data);
  });

  // When the "flag" is updated, we update the state of the
  // checkbox ("self.triggers.properties['flag']" could have
  // been used as well):
  self.triggers.events['flagUpdated'] = function(dominoInstance) {
    html.find('input').attr(
      'checked',
      !dominoInstance.get('flag') ?
        'checked' :
        null
    );
  };

  this.html = html;
};
```

Once this module class is declared, if you want to add an instance to a DOM element, you just have to write:

```js
// with "d" our domino.js instance, and "dom" the DOM parent:
var myCheckbox = d.addModule(Checkbox);
myCheckbox.html.appendTo(dom);
```

And that's it, the module is here and connected. And you can even create two instances or more, and there will not be any conflict, and they will all stay synchronized, of course.

<h2 id="hacks">Hacks <a href="#" class="right" title="Back to the top">(&uarr;)</a></h2>

**Hacks** are useful to implement all those features that you can not predict in the definition of your projects - they actually are real *hacks*. Here are some examples of the kind of "features" that can be a disaster for your code, but are easily implementable with *domino.js*:

 - Restrict the max count of selected elements in a list to a specified number.
 - Hide some available values from a *select* module when another is updated.
 - Reset some properties when a *button* is clicked, and some other when another *button* is activated.
 - etc...

Let's consider the following practical case: You have three different flags (properties `flag1`, `flag2` and `flag3`), and you want to have the three values always stored in an array (property `list`).

```js
var d = new domino({
  properties: [
    {
      id: 'flag1',
      triggers: 'updateFlag1',
      dispatch: ['flag1Updated', 'flagUpdated']
    },
    {
      id: 'flag2',
      triggers: 'updateFlag2',
      dispatch: ['flag2Updated', 'flagUpdated']
    },
    {
      id: 'flag3',
      triggers: 'updateFlag3',
      dispatch: ['flag3Updated', 'flagUpdated']
    },
    {
      id: 'list',
      dispatch: 'listUpdated'
    }
  ],
  hacks: [
    {
      triggers: 'flagUpdated',
      method: function() {
        // Here you can refresh the list:
        this.list = [
          this.get('flag1'),
          this.get('flag2'),
          this.get('flag3')
        ];
      }
    }
  ]
});
```

And that's it: Any time one flag is updated, the list will automatically be refreshed, and the event "listUpdated" dispatched.

The different methods you can call from the hacks are described in the **[Scopes management](#scopes_management)** section.

<h2 id="services">Services <a href="#" class="right" title="Back to the top">(&uarr;)</a></h2>

*domino.js* provides an helper to interact with Web services. Basically, referencing a service will create a shortcut to call in an easy way you Web service.

Here is a basic example:

```js
var d = new domino({
  properties: [
    {
      id: 'theProperty',
      label: 'The Property',
      value: 42,
      type: 'number',
      triggers: 'updateTheProperty',
      dispatch: 'thePropertyUpdated'
    }
  ],
  services: [
    {
      id: 'getTheProperty',
      setter: 'theProperty',
      url: '/path/to/get/the/property'
    }
  ]
});
```

Then, executing `d.request('getTheProperty');` will make an GET call to the indicated URL, set the received data as `theProperty` value, and dispatch a `"thePropertyUpdated"` event.

### Shortcuts:

Also, to help manipulating services, it is possible to use **shortcuts** to avoid declare explicitely lots of things. Here is an example:

```js
var d = new domino({
  properties: [
    {
      id: 'prop1',
      label: 'Property 1',
      value: 42,
      type: 'number',
      triggers: 'updateProp1',
      dispatch: 'prop1Updated'
    },
    {
      id: 'prop2',
      label: 'Property 2',
      value: 42,
      type: 'number',
      triggers: 'updateProp2',
      dispatch: 'prop2Updated'
    }
  ],
  services: [
    {
      id: 'propN',
      setter: ':property',
      url: '/path/to/get/:property'
    }
  ]
});

// Let's update prop1
d.request('propN', {
  shortcuts: {
    property: 'prop1'
  }
});

// Now, let's update prop2
d.request('propN', {
  shortcuts: {
    property: 'prop2'
  }
});

// Finally, the following line will throw an error, since :property
// can not be resolved:
d.request('propN');
```

Here is how *domino.js* resolves shortcuts:

 - If there is a `shortcuts` object in the parameters given to the service when called, it will look if a value has been specified in it for the shortcut.
 - If not, it will check if there is a property named like the shortcut, and use its current value if it exists.
 - Then, if still not resolved, it will check if there is a shortcut declared in the instance with the same name, and use the returned value if it exists.
 - Finally, if the shortcut can not be resolved, then an error is thrown.

Here is an example with shortcuts declared directly in *domino.js* instance:

```js
var d = new domino({
  properties: [
    {
      id: 'prop',
      label: 'Property',
      value: 42,
      type: 'number',
      triggers: 'updateProp',
      dispatch: 'propUpdated'
    }
  ],
  services: [
    {
      id: 'prop',
      setter: 'prop',
      url: '/path/to/get/property?date=:date'
    }
  ],
  shortcuts: [
    {
      id: 'date',
      method: function(domino) {
        return (new Date()).toString();
      }
    }
  ]
});
```

In this last example, when the service 'prop' is called, the shortcut ':date' will be resolved as the current date.

### Service specifications:

Here is the list of attributes to precise a service:

 - `{string}` **id**:
   * The unique id of the service, used to specify which service to call.
 - `{string|function}` **url**:
   * The URL of the service. If a string, then any shortcut in it will be resolved. If a function, will be executed with the second argument given to `request`, and the returned string will also be resolved before the call.
 - `{?string}` **contentType**:
   * The AJAX query content-type.
 - `{?string}` **dataType**:
   * The AJAX query data-type.
 - `{?string}` **type**:
   * The AJAX call type (GET|POST|DELETE).
 - `{?(*|function)}` **data**:
   * The data sent in the AJAX call. Can be either an object or a function executed when `request` is called. Then, the object will be parsed, and shortcuts can be used in the first depth of the object.
 - `{?function}` **error**:
   * A function to execute if AJAX failed.
 - `{?function}` **before**:
   * A function to execute before calling AJAX.
 - `{?function}` **success**:
   * A function to execute if AJAX successed.
 - `{?string}` **setter**:
   * The name of a property. If the setter exists, then it will be called with the received data as parameter, or the value corresponding to the path, if specified. Shortcuts will be resolved.
 - `{?(string|array)}` **path**:
   * Indicates the path of the data to give to the setter, if specified (Example: `"a.b.c"`). Shortcuts will be resolved.
 - `{?(string|array)}` **events**:
   * The events to dispatch in case of success.

### Request specifications:

Finally, here is a precise description of the second argument (an **object** or `undefined`) given to the `request` method:

 - `{?boolean}` **abort**:
   * Indicates if the last call of the specified service has to be aborted if not ended.
 - `{?function}` **before**:
   * Overrides the original service "before" value.
 - `{?string}` **contentType**:
   * The contentType of the AJAX call.
 - `{?*}` **data**:
   * If the original service "data" attribute is not a function, then it will be overridden by this "data" value.
 - `{?string}` **dataType**:
   * The dataType of the AJAX call.
 - `{?function}` **error**:
   * Overrides the original service "error" value.
 - `{?array|string}` **events**:
   * Adds more events to dispatch when the "success" is called.
 - `{?object}` **params**:
   * The pairs (key/value) in this object will override the shortcuts.
 - `{?string}` **path**:
   * Overrides the original service "path" value.
 - `{?string}` **setter**:
   * Overrides the original service "setter" value.
 - `{?function}` **success**:
   * Overrides the original service "success" value.
 - `{?string}` **type**:
   * Overrides the AJAX call type (GET|POST|DELETE).

<h2 id="main_loop_inside_domino_js">Main loop: Inside <em>domino.js</em> <a href="#" class="right" title="Back to the top">(&uarr;)</a></h2>

The core function in *domino.js* manages the events chain.

Basically, when an event is dispatched from a module, it will trigger this loop. Then, the related properties will be updated, any module or hack listening to this event will be triggered - causing eventually new updates. After all these actions, new events are to be triggered. **So the loop we be called again**, but with all those new events instead of the one from the module, etc.

This same loop is also called as an output for services success and error function, and the global `update` method (accessible only through the *domino.js* instance itself).

Here is an example:

```
(module) -> updateProp -> event1 -> hack1 -> event3
                       -> event2 -> hack2 -> event4
```

Here, a module updates the property `prop` which dispatches events `event1` and `event2`. Hack `hack1` is triggered on `event1`, and hack `hack2` is triggered on `event2`. Finally, `hack1` dispatches `event3` and `hack2` dispatches `event4`.

The problem here is that, with a classic synchronous events management system, `event3` would be dispatched **before** `event2`, when it is expected to be triggered "later".

**The *domino.js*'s main loop resolves this issue** by executing the previous events chain as following:

```
(module) -> updateProp -> event1, event2 -> hack1, hack2 -> event3, event4
```

And even better: **when an event is about to be triggered twice or more, is is dispatched only once instead**.

For example, the following chain:

```
(module) -> updateProp -> event1 -> hack1 -> event3
                       -> event2 -> hack2 -> event3
```

... will become:

```
(module) -> updateProp -> event1, event2 -> hack1, hack2 -> event3
```

<h2 id="scopes_management">Scopes management <a href="#" class="right" title="Back to the top">(&uarr;)</a></h2>

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

 - **log** *(args...)*
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

 - **request** *(serviceId, options)*
   * Calls the specified service. Check the **Services** documentation to see which options you can use.

 - **dispatchEvent** *(eventType, data)*
   * Dispatches the specified event. Warning: Despite it works like `domino.EventDispatcher.dispatchEvent`, it is not the same implementation, and the event will be considered by the *domino.js* instance after the complete execution of your function.

 - **addModule** *(class, options)*
   * Instanciate the specified module, plugs all the event connections, and returns the module instance.

 - **update** *(\{String|Object\}, ?*)*
   * If the given parameter is an `Object`, then each *key/value* pair will set the *value* to the *key* property. If called with two arguments, then the first must be the property name, and the second one the new value.

**Important**: All the methods described (the default and the additional ones) are also available in the object returned by the *domino.js* constructor itself. Also, the default scope is always given as the **first** parameter to the modules constructors.

### Functions given to domino:

Here is the list of every types of functions you can give to *domino.js*, with the related specifications (what you can modify directly in the scope, which parameters are given, which additional methods are available):

 - **Hacks**:
   * Additional methods in the scope:
     + *request*
     + *dispatchEvent*
   * Parameters given through the scope: *(none)*
   * Function parameters:
     + [`Object`] The event that triggered the hack
   * Accepted scope modifications:
     + [`*`] this[property] will update *property*
   * Returns: *(not evaluated)*

 - **Triggers (in modules)**:
   * Additional methods in the scope: *(none)*
   * Parameters given through the scope: *(none)*
   * Function parameters:
     + [`Object`] The domino scope
     + [`Object`] The dispatched event
   * Accepted scope modifications: *(none)*
   * Returns: *(not evaluated)*

 - **Service "success"**:
   * Additional methods in the scope:
     + *request*
     + *dispatchEvent*
   * Parameters given through the scope: *(none)*
   * Function parameters:
     + [`Object`] The data received from AJAX
     + [`?Object`] The params given to the service when called
   * Accepted scope modifications:
     + [`*`] this[property] will update *property*
   * Returns: *(not evaluated)*

 - **Service "error"**:
   * Additional methods in the scope:
     + *request*
     + *dispatchEvent*
   * Parameters given through the scope: *(none)*
   * Function parameters:
     + [`String`] The error message
     + [`Object`] The related XHR object
     + [`?Object`] The params given to the service when called
   * Accepted scope modifications:
     + [`*`] this[property] will update *property*
   * Returns: *(not evaluated)*

 - **Service "before"**:
   * Additional methods in the scope:
     + *dispatchEvent*
   * Parameters given through the scope: *(none)*
   * Function parameters:
     + [`?Object`] The params given to the service when called
   * Accepted scope modifications:
     + [`*`] this[property] will update *property*
   * Returns: *(not evaluated)*

 - **Service "url"**:
   * Additional methods in the scope: *(none)*
   * Parameters given through the scope: *(none)*
   * Function parameters:
     + [`?Object`] The params given to the service when called
   * Accepted scope modifications: *(none)*
   * Returns:
     + [`String`] The final URL

 - **Service "data"**:
   * Additional methods in the scope: *(none)*
   * Parameters given through the scope: *(none)*
   * Function parameters:
     + [`?Object`] The params given to the service when called
   * Accepted scope modifications: *(none)*
   * Returns:
     + [`*`] The data sent through the AJAX call

 - **Shortcuts**:
   * Additional methods in the scope: *(none)*
   * Parameters given through the scope: *(none)*
   * Function parameters: *(none)*
   * Accepted scope modifications: *(none)*
   * Returns:
     + [`*`] Anything you want, that's the point of the shortcuts

 - **Custom setters**:
   * Additional methods in the scope: *(none)*
   * Parameters given through the scope:
     + [`*`] this[property] contains the current value of the property
   * Function parameters:
     + [`*`] The new value
   * Accepted scope modifications:
     + [`*`] this[property] contains the new value of the property
   * Returns:
     + [`?boolean`] If you return a boolean value, the property will be updated and the related events dispatched only if the returned boolean is `true`

 - **Custom getters**:
   * Additional methods in the scope: *(none)*
   * Parameters given through the scope:
     + [`*`] this[property] contains the current value of the property
   * Function parameters: *(none)*
   * Accepted scope modifications: *(none)*
   * Returns:
     + [`*`] The current value of the property

<h2 id="logs_and_global_settings">Logs and global settings <a href="#" class="right" title="Back to the top">(&uarr;)</a></h2>

The global method `domino.settings` is used to manage global *domino.js* settings. It works like most *jQuery* methods:

 - `domino.settings(setting)`: Will return the `setting` value if it exists, `undefined` otherwise.
 - `domino.settings(setting, value)`: Will set `value` in `setting` and return the global *domino* object.
 - `domino.settings(obj)`: Will set for each `{key, value}` in `obj` the value `value` in the setting `key`, and return the global *domino* object.

Here is the list of currently recognized global settings:

 - **strict**: If `true`, warnings are considered as errors (default: `false`).
 - **verbose**: If `true`, logs will be sent in `console.log` (default: `false`).
 - **shortcutPrefix**: Determines the shortcuts prefix (default: `":"`).
 - **displayTime**: If `true`, logs will be prefixed by the time since *domino.js* initialization, in milliseconds (default: `false`).
 - **clone**:
   + If `true`, getters return always clone of the values, and setters clone values before they actually update values, using the `domino.utils.clone()` method. It might decrease *domino.js* performances, but makes data manipulation safer. More precisely, when clone mode is activated, there is no properties update without the related events (default: `true`).

Also, *domino.js* provides its own functions to log, warn or throw errors:

 - `die(args...)` will concatenate the arguments casts as strings and throw the result as an error.
 - `log(args...)` will call `console.log(args...)` if the global setting `verbose` is true.
 - `warn(args...)` will call `die(args...)` if the global setting `strict` is true, `log(args...)` otherwise.

Finally, all the logs/warns/errors will be prefixed by the instance name if specified (the string `"domino"` otherwise).

<h2 id="structures">Structures <a href="#" class="right" title="Back to the top">(&uarr;)</a></h2>

*domino.js* provides its own helpers to manipulate some "Closure like" types in the `domino.struct` object. Since they can be more complex than simple string types, they are called **structures**.

Those structures are:

 - Basic types:
   * 'boolean', 'number', 'string', 'function', 'array', 'date', 'regexp', 'object', 'null', 'undefined', '*'
 - Optional types: **'?{type}'**
   * Example: `'?object'`, `'?array'`, etc...
 - Multi-types: **'{type1}|{type2}'**
   * Example: `'string|number'`, `'?array|object'`, etc...
 - Arrays: **[type]**
   * The array structure definition must be an array with exactly one value, which must be a valid structure descriptor. Then, any array containing only elements matching this structure is valid.
   * Examples:
     + `['boolean']`
     + `[{ obj1: { k1: 'number', k2: 'number' }, obj2: 'object', list: '?array' }]`
 - Complex structures: **{ key1: {type1}, key2: {type2} }**
   * Examples:
     + `{ a: 'number', b: 'number', total: '?number' }`
     + `{ obj1: { k1: 'number', k2: 'number' }, obj2: 'object' }`

Except for `'undefined'` and `'null'`, all the previously described structures are valid to characterize a property.

Here the list of the available functions to manipulate those structures:

 - **get(value)**: Returns the string structure of the value:

```js
domino.struct.get(null);      // 'null'
domino.struct.get(undefined); // 'undefined'
domino.struct.get(42);        // 'number'
domino.struct.get('toto');    // 'string'
domino.struct.get({a: 1});    // 'object'
domino.struct.get([1,2,3]);   // 'array'
```

 - **check(struct, value)**: Check if the value matches the specified structure:

```js
domino.struct.check({a: 'number'}, {a: 1}); // true
domino.struct.check('object', {a: 1});      // true
domino.struct.check('?object', {a: 1});     // true
domino.struct.check('*', {a: 1});           // true
domino.struct.check({a: '?number'}, {});    // true
domino.struct.check('*', {a: 1});           // true
domino.struct.check({a: 'number'}, {});     // false
domino.struct.check(['number'], []);        // true
domino.struct.check(['number'], [1]);       // true
domino.struct.check(['number'], [1, 2]);    // true
```

 - **isValid(struct)**: Indicates whether the structure is a valid property structure:

```js
domino.struct.isValid({a: 'number'});   // true
domino.struct.isValid([{a: 'number'}]); // true
domino.struct.isValid('object');        // true
domino.struct.isValid('?object');       // true
domino.struct.isValid('?object|array'); // true
domino.struct.isValid('?object|');      // false
domino.struct.isValid('undefined');     // false
domino.struct.isValid('null');          // false
```

 - **deepScalar(struct)**: Indicates whether the structure is deeply composed of scalar types. This helper is particularly useful to know if it is possible to easily compare two values of the structure (without any reference issue):

```js
domino.struct.deepScalar('number');        // true
domino.struct.deepScalar('?number');       // true
domino.struct.deepScalar(['?number']);     // true
domino.struct.deepScalar('string|number'); // true
domino.struct.deepScalar({a: 'number'});   // true
domino.struct.deepScalar([{a: 'number'}]); // true
domino.struct.deepScalar('object');        // false
domino.struct.deepScalar('?object');       // false
domino.struct.deepScalar('object|number'); // false
```
