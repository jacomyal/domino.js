(function(ns, domino) {
  // Requires a namespace to be initialized:
  if (!ns)
    throw (new Error('The namespace is not valid.'));

  // Requires domino.js to be initialized:
  if (!domino)
    throw (new Error('domino.js is required to initialize the modules.'));

  /**
   * The most basic module: a button that will just dispatch an event when it is
   * clicked.
   *
   * @param   {?Object} options An object containing the specifications of the
   *                            module.
   *
   * Here is the list of options that are interpreted:
   *
   *   {?string}         htmlTag     The tag of the HTML element
   *                                 (default: 'button')
   *   {?string}         htmlContent The content of the HTML element
   *   {?string}         cssClass    The CSS class of the HTML element
   *   {?string}         cssId       The HTML id of the HTML element
   *   {?(array|string)} dispatch    The events to dispatch when clicked
   */
  ns.Button = function(options) {
    domino.module.call(this);

    var self = this,
        o = options || {},
        html = $('<' + (o['htmlTag'] || 'button') + '>' +
                   (o['htmlContent'] || '') +
                 '</' + (o['htmlTag'] || 'button') + '>');

    o['cssClass'] && html.addClass(o['cssClass']);
    o['cssId'] && html.attr('id', o['cssId']);

    html.click(function() {
      o['dispatch'] && self.dispatch(domino.utils.array(o['dispatch']));
    });

    this.html = html;
  };

  /**
   * A button which will represent a Boolean property. When clicked, it will
   * toggle the property, and when the property is updated, the button will be
   * toggled as well.
   *
   * @param   {?Object} options An object containing the specifications of the
   *                            module.
   *
   * Here is the list of options that are interpreted:
   *
   *   {?string}         htmlTag         The tag of the HTML element
   *                                     (default: 'button')
   *   {?string}         htmlContentOn   The content of the HTML element
   *                                     (state: on)
   *   {?string}         htmlContentOff  The content of the HTML element
   *                                     (state: off)
   *   {?string}         cssClassOn      The CSS class of the HTML element
   *                                     (state: on)
   *   {?string}         cssClassOff     The CSS class of the HTML element
   *                                     (state: off)
   *   {?string}         cssId           The HTML id of the HTML element
   *   {?(array|string)} dispatch        The events to dispatch when clicked
   *   {?string}         triggerProperty The name of the flag to represent
   *   {?(array|string)} triggerEvents   The events to listen from domino
   */
  ns.SwitchButton = function(options) {
    domino.module.call(this);

    var self = this,
        o = options || {},
        isOn = o['value'] !== undefined ?
                !!o['value'] :
                undefined,
        html = $('<' + (o['htmlTag'] || 'button') + '>' +
                 '</' + (o['htmlTag'] || 'button') + '>');

    o['cssId'] && html.attr('id', o['cssId']);

    html.click(function() {
      if (!o['triggerProperty'])
        return;

      var data = {};
      data[o['triggerProperty']] = !isOn;

      // Dispatch the event
      o['dispatch'] && self.dispatch(o['dispatch'], data);
    });

    domino.utils.array(o['triggerEvents']).forEach(function(eventName) {
      self.triggers[eventName] = function(event) {
        if (!o['triggerProperty'] || !this.get[o['triggerProperty']])
          return;

        // Check the current state of the flag:
        state = !!this.get[o['triggerProperty']]();
        if (state) {
          o['cssClassOn'] && html.attr('class', o['cssClassOn']);
          o['htmlContentOn'] && html.html(o['htmlContentOn']);
        }else {
          o['cssClassOff'] && html.attr('class', o['cssClassOff']);
          o['htmlContentOff'] && html.html(o['htmlContentOff']);
        }
      }
    });

    this.html = html;
  };
})((domino.modules = domino.modules || {}), domino);
