/**
 * Here are some drafts on how creating a module for domino would look like. I
 * still do not have any strong enough idea yet.
 *
 * Also, I do not like the word controller. It is long to write, and it is
 * something that domino users will have to write a lot.
 *
 * Any thought on that?
 */
var myModule = function() {
  // First idea:
  // ***********
  //
  // Here, the bindings are just made with the emitter nature of the controller,
  // and we communicate with the controller directly via its public methods.
  //
  // PROBLEM: In this case, there is no way I think to know which functions have
  // been bound from the module, so I cannot unbind them when the module is
  // killed. Which is actually a pretty big issue...
  var controller = this.controller;
  function update(data) {
    controller.update('data', data);
  }
  controller.on('dataUpdated', function() {
    // Here, this is not the myModule instance, which is why we referenced
    // this.controller into controller.
    refresh(controller.get('data'));
  });




  // Second idea:
  // ************
  //
  // Here, the bindings are faked through a on() method added by the controller
  // before calling myModule constructor. Upgoing communication works as
  // previously.
  //
  // PROBLEM: Here, my problem is the naming. this.on would suggest that we
  // listen to the module instance, which is wrong. Also, it looks like we are
  // using the domino.emitter class, which is also wrong...
  function update(data) {
    controller.update('data', data);
  }
  this.on('dataUpdated', function() {
    // Here, since this is not emitter.on, we can tell domino to call this
    // function with the instance module for scope. So, no need to reference the
    // controller from outside.
    refresh(this.controller.get('data'));
  });




  // Third idea:
  // ************
  //
  // Here, it works a bit as in the original domino. I still do not like the on
  // naming, but since on is not a function here, it does not look too much like
  // the domino.emitter naming, so it's okay.
  //
  // My biggest issue here is that I do not like to put some handlers in an
  // object and let them be bound later. It is not very functional, while this
  // new domino is supposed to be more functional than the previous one.
  function update(data) {
    controller.update('data', data);
  }
  this.on.dataUpdated = function() {
    // Here, since this is not emitter.on, we can tell domino to call this
    // function with the instance module for scope. So, no need to reference the
    // controller from outside.
    refresh(this.controller.get('data'));
  };
};
