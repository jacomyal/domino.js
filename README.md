domino.js - README
==================

There is a lot of functions given to *domino.js* through the initial configuration and the modules. One particularity of *domino.js* is that these methods are called in a specific scope, that contains safe accesses to different properties, and tools to display logs.

Also, for some type of functions, some other parameters or values can be added in the scope - and 

## Default scope :
 
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

 - **events** *(property)*
   * Returns the array of events that the `domino.js` instance listen to update the specified property.

 - **label** *(property)*
   * Returns the label of the specified property.

## Methods given to domino :

 - **Hacks** :
   * Parameters given through the scope : `(none)`
   * Function parameters :
     + `Object` event: The event that triggered the hack
   * Accepted scope alterations :
     + `Array<String>` this.dispatch will be dispatched
     + `Array<Object>` this.properties will be updated
   * Returns : *(not evaluated)*

 - **Triggers (in modules)** :
   * Parameters given through the scope : `(none)`
   * Function parameters :
     + `Object` The dispatched event
   * Accepted scope alterations : `(none)`
   * Returns : *(not evaluated)*

 - **Service "success"** :
   * Parameters given through the scope : `(none)`
   * Function parameters :
     + `Object` data: The data received from AJAX
   * Accepted scope alterations :
     + `Array<String>` this.dispatch will be dispatched
     + `Array<Object>` this.properties will be updated
   * Returns : *(not evaluated)*

 - **Service "error"** :
   * Parameters given through the scope : `(none)`
   * Function parameters :
     + `String` mes: The error message
     + `Object` xhr: The related XHR object
   * Accepted scope alterations :
     + `Array<String>` this.dispatch will be dispatched
     + `Array<Object>` this.properties will be updated
   * Returns : *(not evaluated)*

 - **Service "url"** :
   * Parameters given through the scope : `(none)`
   * Function parameters : `(none)`
   * Accepted scope alterations : `(none)`
   * Returns :
     + `String` The final URL

 - **Service "data"** :
   * Parameters given through the scope : `(none)`
   * Function parameters :
     + `?*` If indicated, the `data` given by the overridding parameters
   * Accepted scope alterations : `(none)`
   * Returns :
     + `*` The data given to AJAX

 - **Shortcuts** :
   * Parameters given through the scope : `(none)`
   * Function parameters : `(none)`
   * Accepted scope alterations : `(none)`
   * Returns :
     + `*` Anything you want, that's the point of the shortcuts

 - **Custom setters** :
   * Parameters given through the scope :
     + `*` this[property] contains the current value of the property
   * Function parameters :
     + `*` The new value, given to `.set(property, newValue)`
     + `*` Eventually other parameters, if you are using custom setters
   * Accepted scope alterations :
     + `*` this[property] contains the new value of the property
   * Returns :
     + `?Boolean` If you return a boolean value, the property will be updated and the related events dispatched only if the returned boolean is `true`

 - **Custom getters** :
   * Parameters given through the scope :
     + `*` this[property] contains the current value of the property
   * Function parameters :
     + `*` Eventually parameters, if you are using custom getters
   * Accepted scope alterations : `(none)`
   * Returns :
     + `*` The value you want to see returned through `.get(property)`