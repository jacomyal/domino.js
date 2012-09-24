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
   *   {?string}         htmlTag         The tag of the HTML element
   *                                     (default: 'span')
   *   {?string}         cssClass        The CSS class of the HTML element
   *   {?string}         cssId           The HTML id of the HTML element
   *   {?(array|string)} dispatch        The events to dispatch when clicked
   *   {?string}         triggerProperty The name of the flag to represent
   *   {?(array|string)} triggerEvents   The events to listen from domino
   */
  ns.Text = function(options) {
    domino.module.call(this);

    var self = this,
        o = options || {},
        html = $('<' + (o['htmlTag'] || 'span') + '>' +
                 '</' + (o['htmlTag'] || 'span') + '>');

    o['cssClass'] && html.addClass(o['cssClass']);
    o['cssId'] && html.attr('id', o['cssId']);

    function update(event) {
      if (!o['triggerProperty'] || !event.data.get[o['triggerProperty']])
        return;

      html.text(
        o['triggerProperty'] + ': ' +
        event.data.get[o['triggerProperty']]()
      );
    }

    domino.utils.array(o['triggerEvents']).forEach(function(eventName) {
      self.triggers.events[eventName] = update;
    });

    if (o['triggerProperty'])
      self.triggers.properties[o['triggerProperty']] = update;

    this.html = html;
  };

  /**
   * The second most basic module: a button that will just dispatch an event
   * when it is clicked.
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
      o['dispatch'] && self.dispatchEvent(domino.utils.array(o['dispatch']));
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
        isOn,
        html = $('<' + (o['htmlTag'] || 'button') + '>' +
                 '</' + (o['htmlTag'] || 'button') + '>');

    o['cssId'] && html.attr('id', o['cssId']);

    html.click(function() {
      if (!o['triggerProperty'])
        return;

      var data = {};
      data[o['triggerProperty']] = !isOn;

      // Dispatch the event
      o['dispatch'] && self.dispatchEvent(o['dispatch'], data);
    });

    function update(event) {
      if (!o['triggerProperty'] || !event.data.get[o['triggerProperty']])
        return;

      // Check the current state of the flag:
      isOn = !!event.data.get[o['triggerProperty']]();
      if (isOn) {
        o['cssClassOn'] && html.attr('class', o['cssClassOn']);
        o['htmlContentOn'] && html.html(o['htmlContentOn']);
      }else {
        o['cssClassOff'] && html.attr('class', o['cssClassOff']);
        o['htmlContentOff'] && html.html(o['htmlContentOff']);
      }
    }

    domino.utils.array(o['triggerEvents']).forEach(function(eventName) {
      self.triggers.events[eventName] = update;
    });

    if (o['triggerProperty'])
      self.triggers.properties[o['triggerProperty']] = update;

    this.html = html;
  };

  /**
   * A button which will represent a multiple choice property. When clicked, it
   * will update the property, and when the property is updated, the module
   * will be updated as well.
   *
   * @param   {?Object} options An object containing the specifications of the
   *                            module.
   *
   * Here is the list of options that are interpreted:
   *
   *   {(array|string)}  values          The array of the values, or the name
   *                                     of the property that contains the
   *                                     values
   *   {?string}         cssClass        The CSS class of the HTML element
   *   {?string}         htmlTag         The tag of the HTML element
   *   {?string}         cssId           The HTML id of the HTML element
   *   {?(array|string)} dispatch        The events to dispatch when clicked
   *   {?string}         triggerProperty The name of the string property to
   *                                     represent
   *   {?(array|string)} triggerEvents   The events to listen from domino
   */
  ns.Select = function(options) {
    domino.module.call(this);

    var self = this,
        o = options || {},
        selected,
        values,
        html = $('<select></select>');

    o['cssClass'] && html.addClass(o['cssClass']);
    o['cssId'] && html.attr('id', o['cssId']);

    if (o['values'] && domino.utils.type.get(o['values']) === 'array') {
      values = o['values'];
      html.append(values.map(function(v) {
        return typeof v === 'string' ?
          '<option value="' + v + '">' + v + '</option>' :
          '<option value="' + v.id + '">' + (v.label || v.id) + '</option>';
      }));
    }

    html.change(function() {
      if (!o['triggerProperty'])
        return;

      var data = {};
      data[o['triggerProperty']] = $(this).val();

      // Dispatch the event
      o['dispatch'] && self.dispatchEvent(o['dispatch'], data);
    });

    function updateSelection(event) {
      if (!o['triggerProperty'] || !event.data.get[o['triggerProperty']])
        return;

      selected = event.data.get[o['triggerProperty']]();
      html.val(selected);
    }

    function updateList(event) {
      if (typeof o['values'] !== 'string')
        return;

      values = event.data.get[o['values']]();
      html.empty().append(values.map(function(v) {
        return typeof v === 'string' ?
          '<option value="' + v + '">' + v + '</option>' :
          '<option value="' + v.id + '">' + (v.label || v.id) + '</option>';
      })).val(selected);
    }

    domino.utils.array(o['triggerEvents']).forEach(function(eventName) {
      self.triggers.events[eventName] = update;
    });

    if (o['triggerProperty'])
      self.triggers.properties[o['triggerProperty']] = updateSelection;

    if (typeof o['values'] === 'string')
      self.triggers.properties[o['values']] = updateList;

    this.html = html;
  };
})((domino.modules = domino.modules || {}), domino);
