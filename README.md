domino.js - README
==================

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