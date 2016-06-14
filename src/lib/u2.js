/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
TODO:
 - Fix handling of Slots that return arrays.
 - Add support for FOAM1 style dynamic functions?
 - Properly handle insertBefore_ of an element that's already been inserted?
 - Fix ExpressionSlot firing too many property change events
*/

foam.CLASS({
  package: 'foam.u2',
  name: 'EID',
  extends: 'Property',
  documentation: 'Describes a property used to store a DOM element id.',

  constants: {
    __ID__: [ 0 ],
    NEXT_ID: function() {
      return 'u2v' + this.__ID__[ 0 ]++;
    }
  },

  properties: [
    {
      name: 'factory',
      value: function() { return foam.u2.EID.NEXT_ID(); }
    },
    {
      name: 'transient',
      value: true
    },
    {
      name: 'hidden',
      value: true
    }
  ]
});

foam.CLASS({
  package: 'foam.u2',
  name: 'Entity',
  // TODO: Make both Entity and Element extend a common base-Model (Node?)

  documentation: 'Virtual-DOM Entity.',

  properties: [
    {
      name: 'name',
      // parser: seq(alphaChar, repeat0(wordChar)),
      // TODO(adamvy): This should be 'pattern' or 'regex', if those are ever
      // added.
      assertValue: function(nu) {
        if ( ! nu.match(/^[a-z#]\w*$/i) ) {
          throw new Error('Invalid Entity name: ' + nu);
        }
      }
    }
  ],

  methods: [
    function output(out) { out('&', this.name, ';'); }
  ]
});

foam.CLASS({
  package: 'foam.u2',
  name: 'DefaultValidator',

  documentation: 'Default Element validator.',

  methods: [
    function validateNodeName(name) {
      return true;
    },

    function validateClass(cls) {

    },

    function validateAttributeName(name) {

    },

    function validateAttributeValue(value) {

    },

    function validateStyleName(name) {

    },

    function validateStyleValue(value) {

    },

    function sanitizeText(text) {
      if ( ! text ) return text;
      text = text.toString();
      return text.replace(/[&<"']/g, function(m) {
        switch ( m ) {
          case '&': return '&amp;';
          case '<': return '&lt;';
          case '"': return '&quot;';
          default:  return '&#039';
        }
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'Element',

  documentation: 'Virtual-DOM Element. Root model for all U2 UI components.',

  requires: [
    'foam.u2.DefaultValidator',
    'foam.u2.ElementValue',
    'foam.u2.Entity'
  ],

  imports: [
    'elementValidator',
    'getElementById',
    'framed'
  ],

  topics: [
    'onload',
    'onunload',
    'ondestroy'
  ],

  constants: {
    DEFAULT_VALIDATOR: foam.u2.DefaultValidator.create(),

    // Initial State of an Element
    INITIAL: {
      output: function(out) {
        this.initE();
        this.output_(out);
        this.state = this.OUTPUT;
        return out;
      },
      load:          function() {
        this.error('Must output before loading.');
      },
      unload:        function() {
        this.error('Must output and load before unloading.');
      },
      remove:        function() { },
      destroy:       function() { },
      onSetCls:      function() { },
      onFocus:       function() { },
      onAddListener: function() { },
      onRemoveListener: function() { },
      onSetStyle:    function() { },
      onSetAttr:     function() { },
      onRemoveAttr:  function() { },
      onAddChildren: function() { },
      onInsertChildren: function() { },
      onReplaceChild: function() { },
      onRemoveChild: function() { },
      toString:      function() { return 'INITIAL'; }
    },

    // State of an Element after it has been output (to a String) but before it is loaded.
    // This should be only a brief transitory state, as the Element should be loaded
    // almost immediately after being output.  It is an error to try and mutate the Element
    // while in the OUTPUT state.
    OUTPUT: {
      output: function(out) {
        // Only warn because it could be useful for debugging.
        this.warn('Duplicate output.');
        return this.INITIAL.output.call(this, out);
      },
      load: function() {
        this.state = this.LOADED;
        for ( var i = 0 ; i < this.elListeners.length ; i++ ) {
          var l = this.elListeners[i];
          this.addEventListener_(l[0], l[1]);
        }

        this.visitChildren('load');
        if ( this.focused ) this.el().focus();
        // Allows you to take the DOM element and map it back to a
        // foam.u2.Element object.  This is expensive when building
        // lots of DOM since it adds an extra DOM call per Element.
        // But you could use it to cut down on the number of listeners
        // in something like a table view by doing per table listeners
        // rather than per-row listeners and in the event finding the right
        // U2 view by walking the DOM tree and checking e_.
        // This could save more time than the work spent here adding e_ to each
        // DOM element.
        // this.el().e_ = this;
      },
      unload: function() {
        this.state = this.UNLOADED;
        this.visitChildren('unload');
      },
      remove: function() { },
      destroy: function() { },
      onSetCls: function(cls, enabled) {
        throw new Error('Mutations not allowed in OUTPUT state.');
      },
      onFocus: function(cls, enabled) {
        throw new Error('Mutations not allowed in OUTPUT state.');
      },
      onAddListener: function(topic, listener) {
        throw new Error('Mutations not allowed in OUTPUT state.');
      },
      onRemoveListener: function(topic, listener) {
        throw new Error('Mutations not allowed in OUTPUT state.');
      },
      onSetStyle: function(key, value) {
        throw new Error('Mutations not allowed in OUTPUT state.');
      },
      onSetAttr: function(key, value) {
        throw new Error('Mutations not allowed in OUTPUT state.');
      },
      onRemoveAttr: function(key, value) {
        throw new Error('Mutations not allowed in OUTPUT state.');
      },
      onAddChildren: function(c) {
        throw new Error('Mutations not allowed in OUTPUT state.');
      },
      onInsertChildren: function() {
        throw new Error('Mutations not allowed in OUTPUT state.');
      },
      onReplaceChild: function() {
        throw new Error('Mutations not allowed in OUTPUT state.');
      },
      onRemoveChild: function() {
        throw new Error('Mutations not allowed in OUTPUT state.');
      },
      toString: function() { return 'OUTPUT'; }
    },

    // State of an Element after it has been loaded.
    // A Loaded Element should be visible in the DOM.
    LOADED: {
      output:        function(out) { this.warn('Duplicate output.'); },
      load:          function() { this.error('Duplicate load.'); },
      unload:        function() {
        var e = this.el();
        if ( e ) {
          e.remove();
        }
        this.state = this.UNLOADED;
        this.visitChildren('unload');
      },
      remove: function() { this.unload(); },
      destroy: function() { },
      onSetCls: function(cls, enabled) {
        var e = this.el();
        if ( ! e ) {
          this.warn('Missing Element: ', this.id);
          return;
        }

        e.classList[enabled ? 'add' : 'remove'](cls);
      },
      onFocus: function() {
        this.el().focus();
      },
      onAddListener: function(topic, listener) {
        this.addEventListener_(topic, listener);
      },
      onRemoveListener: function(topic, listener) {
        this.addRemoveListener_(topic, listener);
      },
      onSetStyle: function(key, value) {
        this.el().style[key] = value;
      },
      onSetAttr: function(key, value) {
        // 'value' doesn't work consistently with setAttribute()
        if ( key === 'value' ) {
          this.el().value = value;
        } else {
          this.el().setAttribute(key, value === true ? '' : value);
        }
      },
      onRemoveAttr: function(key, value) {
        this.el().removeAttribute(key);
      },
      onAddChildren: function() {
        var e = this.el();
        if ( ! e ) {
          this.warn('Missing Element: ', this.id);
          return;
        }
        var out = this.createOutputStream();
        for ( var i = 0 ; i < arguments.length ; i++ ) {
          out(arguments[i]);
        }
        e.insertAdjacentHTML('beforeend', out);
        for ( var i = 0 ; i < arguments.length ; i++ ) {
          arguments[i].load && arguments[i].load();
        }
      },
      onInsertChildren: function(children, reference, where) {
        var e = this.el();
        if ( ! e ) {
          this.warn('Missing Element: ', this.id);
          return;
        }
        var out = this.createOutputStream();
        for ( var i = 0 ; i < children.length ; i++ ) {
          out(children[i]);
        }
        reference.el().insertAdjacentHTML(where, out);
        for ( var i = 0 ; i < children.length ; i++ ) {
          children[i].load && children[i].load();
        }
      },
      onReplaceChild: function(oldE, newE) {
        var e = this.el();
        if ( ! e ) {
          this.warn('Missing Element: ', this.id);
          return;
        }
        var out = this.createOutputStream();
        out(newE);
        var n = this.__context__.document.createElement('div');
        n.innerHTML = out.toString();
        e.replaceChild(n.firstChild, oldE.el());
        newE.load && newE.load();
      },
      onRemoveChild: function(child, index) {
        if ( typeof child === 'string' ) {
          this.el().childNodes[index].remove();
        } else {
          child.remove();
        }
      },
      toString: function() { return 'LOADED'; }
    },

    // State of an Element after it has been removed from the DOM.
    // An unloaded Element can be re-added to the DOM.
    UNLOADED: {
      output: function() { },
      load: function() {
        this.state = this.LOADED;
        this.visitChildren('load');
      },
      unload:         function() { },
      remove:         function() { this.error('Remove after unload.'); },
      destroy:        function() { },
      onSetCls:       function() { },
      onFocus:        function() { },
      onAddListener:  function() { },
      onRemoveListener: function() { },
      onSetStyle:     function() { },
      onSetAttr:      function() { },
      onRemoveAttr:   function() { },
      onAddChildren:  function() { },
      onInsertChildren: function() { },
      onReplaceChild: function() { },
      onRemoveChild: function() { },
      toString:       function() { return 'UNLOADED'; }
    },

    // State of an Element after it has been destroyed.
    // A destroyed Element returns all resources and cannot be re-added to the DOM.
    // Not currently used.
    /*
    DESTROYED: {
      output:        function() { throw 'Attempt to output() destroyed Element.'; },
      load:          function() { throw 'Attempt to load() destroyed Element.'; },
      unload:        function() { throw 'Attempt to unload() destroyed Element.';},
      remove:        function() { debugger; this.error('Remove after destroy.'); },
      destroy:       function() { },
      onSetCls:      function() { },
      onFocus:       function() { },
      onAddListener: function() { },
      onRemoveListener: function() { },
      onSetStyle:    function() { },
      onSetAttr:     function() { },
      onRemoveAttr:  function() { },
      onAddChildren: function() { },
      onInsertChildren: function() { },
      onReplaceChild: function() { },
      toString:      function() { return 'DESTROYED'; }
    },
    */

    // TODO: Don't allow these as they lead to ambiguous markup.
    OPTIONAL_CLOSE_TAGS: {
      BODY: true,
      COLGROUP: true,
      DD: true,
      DT: true,
      HEAD: true,
      HTML: true,
      LI: true,
      OPTION: true,
      P: true,
      TBODY: true,
      TD: true,
      TFOOT: true,
      TH: true,
      THEAD: true,
      TR: true
    },

    // Element nodeName's that are self-closing.
    // Used to gernate valid HTML output.
    // Used by ElementParser for valid HTML parsing.
    ILLEGAL_CLOSE_TAGS: {
      area: true,
      base: true,
      basefont: true,
      br: true,
      col: true,
      frame: true,
      hr: true,
      img: true,
      input: true,
      isindex: true,
      link: true,
      meta: true,
      param: true
    }
  },

  properties: [
    {
      class: 'foam.u2.EID',
      // TODO: Move id management out of EIDProperty to Element so that
      // it can be more easily tied to lifecycle.
      name: 'id'
    },
    {
      name: 'state',
      factory: function() { return this.INITIAL; }
    },
    {
      name: 'parentNode'
    },
    {
      name: 'validator',
      getter: function() {
        return this.elementValidator$ ?
          this.elementValidator :
          this.DEFAULT_VALIDATOR;
      }
    },
    {
      name: 'nodeName',
      adapt: function(_, v) {
        // Convert to uppercase so that checks against OPTIONAL_CLOSE_TAGS
        // and ILLEGAL_CLOSE_TAGS work.
        return v.toUpperCase();
      },
      value: 'DIV'
    },
    {
      name: 'attributeMap',
      //documentation: 'Same information as attributes, but in map form for faster lookup',
      transient: true,
      factory: function() { return {}; }
    },
    {
      name: 'attributes',
      //documentation: 'Array of {name: ..., value: ...} attributes.',
      factory: function() { return []; },
      postSet: function(_, attrs) {
        this.attributeMap = {};
        for ( var i = 0 ; i < attrs.length ; i++ ) {
          this.attributeMap[attrs[i].name] = attrs[i];
        }
      }
    },
    {
      name: 'classes',
      //documentation: 'CSS classes assigned to this Element. Stored as a map of true values.',
      factory: function() { return {}; }
    },
    {
      name: 'css',
      //documentation: 'Styles added to this Element.',
      factory: function() { return {}; }
    },
    {
      name: 'childNodes',
      //documentation: 'Children of this Element.',
      factory: function() { return []; }
    },
    {
      name: 'elListeners',
      //documentation: 'DOM listeners of this Element.',
      factory: function() { return []; }
    },
    {
      name: 'children',
      //documentation: 'Virtual property of non-String childNodes.',
      transient: true,
      getter: function() {
        return this.childNodes.filter(function(c) {
          return typeof c !== 'string';
        });
      }
    },
    {
      class: 'Boolean',
      name: 'focused'
    },
    {
      name: 'outerHTML',
      transient: true,
      getter: function() {
        return this.output(this.createOutputStream()).toString();
      }
    },
    {
      name: 'innerHTML',
      transient: true,
      getter: function() {
        return this.outputInnerHTML(this.createOutputStream()).toString();
      }
    },
    {
      name: 'clickTarget_'
    }
  ],

  templates: [
    function CSS() {/*
      .foam-u2-Element-hidden {
        display: none !important;
      }
    */}
  ],

  methods: [
    function initE() {
      /* Template method for adding addtion element initialization just before Element is output(). */
    },

    function el() {
      /* Return this Element's real DOM element, if loaded. */
      return this.getElementById(this.id);
    },

    function E(opt_nodeName /* | DIV */) {
      /* Create a new Element */
      var Y = this.__subContext__;

      // ???: Is this needed / a good idea?
      if ( this.data && ! Y.data ) Y = Y.createSubContext({ data: this.data });

      // Some names have sub-Models registered for them.
      // Example 'input'
      var e = Y.elementForName(opt_nodeName);

      if ( ! e ) {
        e = foam.u2.Element.create(null, Y);
        if ( opt_nodeName ) e.nodeName = opt_nodeName;
      }

      return e;
    },

    function attrValue(opt_name, opt_event) {
      /* Convenience method for creating an ElementValue. */
      var args = { element: this };

      if ( opt_name  ) args.property = opt_name;
      if ( opt_event ) args.event    = opt_event;

      return this.ElementValue.create(args);
    },

    function myCls(opt_extra) {
      /*
        Constructs a default class name for this view, with an optional extra.
      // TODO: Braden, remove the trailing '-'.
        Without an extra, results in eg. 'foam-u2-Input-'.
        With an extra of "foo", results in 'foam-u2-Input-foo'.
      */
      var base = this.CSS_CLASS || foam.String.cssClassize(this.model_.id);
      if ( ! opt_extra ) opt_extra = '';
      return base.split(/ +/).map(function(c) { return c + '-' + opt_extra; }).join(' ');
    },


    //
    // Lifecycle
    //

    function output(/* OutputStream */ out) {
      /* Transitions to the OUTPUT state, outputting self to supplied OutputStream. */
      return this.state.output.call(this, out);
    },

    function load() {
      /* Transitions to the LOADED state, initializing DOM. */
      this.state.load.call(this);
      this.onload.pub();
    },

    function unload() {
      /* Transitions to the UNLOADED state, removing DOM. */
      this.state.unload.call(this);
      this.onunload.pub();
    },

    function destroy() {
      /* Transition to the DESTROYED state. Reserved for future use. */
      this.state.destroy.call(this);
      this.ondestroy.pub();
    },

    //
    // Dynamic Listeners
    //
    function dynamic() {
      var ret = this.__context__.dynamic.apply(this.__context__, arguments);
      this.on('unload', ret.destroy.bind(ret));
      return ret;
    },

    function dynamicFn() {
      var ret = this.__context__.dynamicFn.apply(this.__context__, arguments);
      this.on('unload', ret.destroy.bind(ret));
      return ret;
    },

    //
    // State
    //
    // The following methods are state-dependent, so just delegate to the current state object.

    function onSetAttr(key, value) {
      this.state.onSetAttr.call(this, key, value);
    },

    function onRemoveAttr(key) {
      this.state.onRemoveAttr.call(this, key);
    },

    function onAddChildren(/* vargs */) {
      this.state.onAddChildren.apply(this, arguments);
    },

    function onAddListener(topic, listener) {
      this.state.onAddListener.call(this, topic, listener);
    },

    function onRemoveListener(topic, listener) {
      this.state.onRemoveListener.call(this, topic, listener);
    },

    function onSetStyle(key, value) {
      this.state.onSetStyle.call(this, key, value);
    },

    function onSetCls(cls, add) {
      this.state.onSetCls.call(this, cls, add);
    },

    function onFocus() {
      this.state.onFocus.call(this);
    },

    function visitChildren(methodName) {
      /*
        Call the named method on all children.
        Typically used to transition state of all children at once.
        Ex.: this.visitChildren('load');
      */
      for ( var i = 0 ; i < this.childNodes.length ; i++ ) {
        var c = this.childNodes[i];
        c[methodName] && c[methodName].call(c);
      }
    },


    //
    // Focus
    //

    function focus() {
      this.focused = true;
      this.onFocus();
      return this;
    },

    function blur() {
      this.focused = false;
      return this;
    },


    //
    // Visibility
    //

    function show(opt_shown) {
      if ( opt_shown ) {
        this.removeCls('foam-u2-Element-hidden');
      } else {
        this.cssClass('foam-u2-Element-hidden');
      }
      return this;
    },

    function hide(opt_hidden) {
      return this.show(opt_hidden === undefined ? false : ! opt_hidden);
    },


    //
    // DOM Compatibility
    //
    // Methods with the same interface as the real DOM.

    function setAttribute(name, value) {
      /*
        Set an Element attribute or property.

        If this model has a property named 'name' which has 'attribute: true',
        then the property will be updated with value.
        Otherwise, the DOM attribute will be set.

        Value can be either a string, a Value, or an Object.
        If Value is undefined, null or false, the attribute will be removed.
      */
      var prop = this.cls_.getAxiomByName(name);

      if ( prop &&
           foam.core.Property.isInstance(prop) &&
           prop.attribute ) {
        if ( typeof value === 'string' ) {
          this[name] = prop.fromString(value);
        } else if ( foam.core.Slot.isInstance(value) ) {
          this.slot(name).follow(value);
        } else {
          this[name] = value;
        }
      } else {
        if ( value === undefined || value === null || value === false ) {
          this.removeAttribute(name);
          return;
        }

        if ( typeof value === 'function' ) {
          this.dynamicAttr_(name, value);
        } else if ( foam.core.Slot.isInstance(value) ) {
          this.valueAttr_(name, value);
        } else {
          var attr = this.getAttributeNode(name);

          if ( attr ) {
            attr.value = value;
          } else {
            attr = { name: name, value: value };
            this.attributes.push(attr);
            this.attributeMap[name] = attr;
          }

          this.onSetAttr(name, value);
        }
      }
    },

    function removeAttribute(name) {
      /* Remove attribute named 'name'. */
      for ( var i = 0 ; i < this.attributes.length ; i++ ) {
        if ( this.attributes[i].name === name ) {
          this.attributes.splice(i, 1);
          delete this.attributeMap[name];
          this.onRemoveAttr(name);
          return;
        }
      }
    },

    function getAttributeNode(name) {
      /* Get {name: ..., value: ...} attributeNode associated with 'name', if exists. */
      return this.attributeMap[name];
    },

    function getAttribute(name) {
      /* Get value associated with attribute 'name', or undefined if attribute not set. */
      var attr = this.getAttributeNode(name);
      return attr && attr.value;
    },

    function appendChild(c) {
      // TODO: finish implementation
      this.childNodes.push(c);
    },

    function removeChild(c) {
      /* Remove a Child node (String or Element). */
      for ( var i = 0 ; i < this.childNodes.length ; ++i ) {
        if ( this.childNodes[i] === c ) {
          this.childNodes.splice(i, 1);
          this.state.onRemoveChild.call(this, c, i);
          return;
        }
      }
    },

    function replaceChild(newE, oldE) {
      /* Replace current child oldE with newE. */
      for ( var i = 0 ; i < this.childNodes.length ; ++i ) {
        if ( this.childNodes[i] === oldE ) {
          this.childNodes[i] = newE;
          this.state.onReplaceChild.call(this, oldE, newE);
          oldE.unload && oldE.unload();
          return;
        }
      }
    },

    function insertBefore(child, reference) {
      /* Insert a single child before the reference element. */
      return this.insertAt_(child, reference, true);
    },

    function insertAfter(child, reference) {
      /* Insert a single child after the reference element. */
      return this.insertAt_(child, reference, false);
    },

    function remove() {
      /*
        Remove this Element from its parent Element.
        Will transition to UNLOADED state.
      */
      // TODO: remove from parent
      this.state.remove.call(this);
    },

    function addEventListener(topic, listener) {
      /* Add DOM listener. */
      this.elListeners.push([ topic, listener ]);
      this.onAddListener(topic, listener);
    },

    function removeEventListener(topic, listener) {
      /* Remove DOM listener. */
      for ( var i = 0 ; i < this.elListeners.length ; i++ ) {
        var l = this.elListeners[i];
        if ( l[0] === topic && l[1] === listener ) {
          this.elListeners.splice(i, 1);
          this.onRemoveListener(topic, listener);
          return;
        }
      }
    },


    //
    // Fluent Methods
    //
    // Methods which return 'this' so they can be chained.

    function setID(id) {
      /*
        Explicitly set Element's id.
        Normally id's are automatically assigned.
        Setting specific ID's hinders composability.
      */
      this.id = id;
      return this;
    },

    function entity(name) {
      this.add(this.Entity.create({ name: name }));
      return this;
    },

    function nbsp() {
      return this.entity('nbsp');
    },

    function cssClass(/* Value | String */ cls) {
      /* Add a CSS cls to this Element. */
      if ( typeof cls === 'function' ) {
        var lastValue = null;
        this.dynamicFn(cls, function(value) {
          this.cssClass_(lastValue, value);
          lastValue = value;
        }.bind(this));
      } else if ( foam.core.Slot.isInstance(cls) ) {
        var lastValue = null;
        var l = function() {
          var v = cls.get();
          this.cssClass_(lastValue, v);
          lastValue = v;
        }.bind(this);
        cls.sub(l);
        l();
      } else {
        this.cssClass_(null, cls);
      }
      return this;
    },

    function enableCls(cls, enabled, opt_negate) {
      /* Enable/disable a CSS class based on a boolean-ish dynamic value. */
      function negate(a, b) { return b ? ! a : a; }

      if ( typeof enabled === 'function' ) {
        var fn = enabled;
        this.dynamicFn(fn, function(value) {
          this.enableCls(cls, value, opt_negate);
        }.bind(this));
      } else if ( foam.core.Slot.isInstance(enabled) ) {
        var value = enabled;
        var l = function() {
          this.enableCls(cls, value.get(), opt_negate);
        }.bind(this);
        value.sub(l);
        l();
      } else {
        enabled = negate(enabled, opt_negate);
        var parts = cls.split(' ');
        for ( var i = 0 ; i < parts.length ; i++ ) {
          this.classes[parts[i]] = enabled;
          this.onSetCls(parts[i], enabled);
        }
      }
      return this;
    },

    function removeCls(cls) {
      /* Remove specified CSS class. */
      if ( cls ) {
        delete this.classes[cls];
        this.onSetCls(cls, false);
      }
      return this;
    },

    function on(topic, listener) {
      /* Shorter fluent version of addEventListener. Prefered method. */
      this.addEventListener(topic, listener);
      return this;
    },

    function attrs(map) {
      /* Set multiple attributes at once. */
      for ( var key in map ) this.setAttribute(key, map[key]);
      return this;
    },

    function style(map) {
      /*
        Set CSS styles.
        Map values can be Objects or dynamic Values.
      */
      for ( var key in map ) {
        var value = map[key];
        if ( typeof value === 'function' ) {
          this.dynamicStyle_(key, value);
        } else if ( foam.core.Slot.isInstance(value) ) {
          this.valueStyle_(key, value);
        } else {
          this.style_(key, value);
        }
      }
      return this;
    },

    function tag(opt_nodeName) {
      /* Create a new Element and add it as a child. Return this. */
      var c = this.E(opt_nodeName || 'br');
      this.add(c);
      return this;
    },

    function start(opt_nodeName) {
      /* Create a new Element and add it as a child. Return the child. */
      var c = this.E(opt_nodeName);
      this.add(c);
      return c;
    },

    function end() {
      /* Return this Element's parent. Used to terminate a start(). */
      return this.parentNode;
    },

    function add(/* vargs */) {
      /* Add Children to this Element. */
      var es = [];
      var Y = this.__subContext__;

      var mapper = function(c) { return c.toE ? c.toE(Y) : c; };

      for ( var i = 0 ; i < arguments.length ; i++ ) {
        var c = arguments[i];

        // Remove null values
        if ( c === undefined || c === null ) {
          // nop
        } else if ( Array.isArray(c) ) {
          es = es.concat(c.map(mapper));
        } else if ( c.toE ) {
          es.push(c.toE(Y));
        } else if ( typeof c === 'function' ) {
          throw new Error('Unsupported');

          // es.push((function() {
          //   var dyn = Y.E('span');
          //   var last = null;

          //   X.dynamicFn(this, function(e) {
          //     e = X.E('span').add(e);
          //     if ( last ) dyn.removeChild(last); //last.remove();
          //     dyn.add(last = e);
          //   });
          // })());
        } else if ( foam.core.Slot.isInstance(c) ) {
          var v = this.valueE_(c);
          if ( Array.isArray(v) ) {
            es = es.concat(v.map(mapper));
          } else {
            es.push(mapper(v));
          }
        } else {
          es.push(c);
        }
      }

      if ( es.length ) {
        for ( var i = 0 ; i < es.length ; i++ ) {
          if ( foam.u2.Element.isInstance(es[i]) ||
              this.Entity.isInstance(es[i]) ) {
            es[i].parentNode = this;
          } else {
            es[i] = this.sanitizeText(es[i]);
          }
        }

        this.childNodes.push.apply(this.childNodes, es);
        this.onAddChildren.apply(this, es);
      }

      return this;
    },

    function addBefore(reference/*, vargs */) {
      /* Add a variable number of children before the reference element. */
      var children = [];
      for ( var i = 1 ; i < arguments.length ; i++ ) {
        children.push(arguments[i]);
      }
      return this.insertAt_(children, reference, true);
    },

    function removeAllChildren() {
      /* Remove all of this Element's children. */
      while ( this.childNodes.length ) {
        this.removeChild(this.childNodes[0]);
      }
      return this;
    },

    function setChildren(value) {
      /** value -- a Value of an array of children which set this elements contents, replacing old children **/
      var l = function() {
        this.removeAllChildren();
        this.add.apply(this, value.get());
      }.bind(this);

      value.sub(l);
      l();

      return this;
    },


    //
    // Output Methods
    //

    function outputInnerHTML(out) {
      for ( var i = 0 ; i < this.childNodes.length ; i++ ) {
        out(this.childNodes[i]);
      }
      return out;
    },

    function createOutputStream() {
      /*
        Create an OutputStream.
        Suitable for providing to the output() method for
        serializing an Element hierarchy.
        Call toString() on the OutputStream to get output.
      */
      var self = this;
      var buf = [];
      var f = function templateOut(/* arguments */) {
        for ( var i = 0 ; i < arguments.length ; i++ ) {
          var o = arguments[i];
          if ( o === null || o === undefined ) {
            // NOP
          } else if ( typeof o === 'string' ) {
            buf.push(o);
          } else if ( typeof o === 'number' ) {
            buf.push(o);
          } else if ( foam.u2.Element.isInstance(o) ||
              self.Entity.isInstance(o) ) {
            o.output(f);
          } else if ( o === null || o === undefined ) {
            buf.push(o);
          }
        }
      };

      f.toString = function() {
        if ( buf.length === 0 ) return '';
        if ( buf.length > 1 ) buf = [ buf.join('') ];
        return buf[0];
      };

      return f;
    },

    function write(opt_X /* | GLOBAL */) {
      /* Write Element to document. For testing purposes. */
      opt_X = opt_X || foam.__context__;
      opt_X.document.body.insertAdjacentHTML('beforeend', this.outerHTML);
      this.load();
      return this;
    },

    function toString() {
      /* Converts Element to HTML String without transitioning state. */
      var s = this.createOutputStream();
      this.output_(s);
      return s.toString();
    },


    //
    // Validation and Sanitization
    //

    function validateNodeName(name) {
      return this.validator.validateNodeName(name);
    },

    function validateClass(cls) {
      return this.validator.validateClass(cls);
    },

    function validateAttributeName(name) {
      return this.validator.validateAttributeName(name);
    },

    function validateAttributeValue(value) {
      return this.validator.validateAttributeValue(value);
    },

    function validateStyleName(name) {
      return this.validator.validateStyleName(name);
    },

    function validateStyleValue(value) {
      return this.validator.validateStyleValue(value);
    },

    function sanitizeText(text) {
      return this.validator.sanitizeText(text);
    },


    //
    // Internal (DO NOT USE)
    //

    // (Element[], Element, Boolean)
    function insertAt_(children, reference, before) {
      var i = this.childNodes.indexOf(reference);

      if ( i === -1 ) {
        this.warn("Reference node isn't a child of this.");
        return this;
      }

      if ( ! Array.isArray(children) ) children = [ children ];

      var Y = this.__subContext__;
      children = children.map(function(e) { return e.toE ? e.toE(Y) : e; });

      var index = before ? i : (i + 1);
      this.childNodes.splice.apply(this.childNodes,
          [ index, 0 ].concat(children));
      this.state.onInsertChildren.call(
        this,
        children,
        reference,
        before ?
          'beforebegin' :
          'afterend');
      return this;
    },

    function cssClass_(oldClass, newClass) {
      /* Replace oldClass with newClass. Called by cls(). */
      if ( oldClass === newClass ) return;
      this.removeCls(oldClass);
      if ( newClass ) {
        this.classes[newClass] = true;
        this.onSetCls(newClass, true);
      }
    },

    function dynamicAttr_(key, fn) {
      /* Set an attribute based off of a dynamic function. */
      this.dynamicFn(fn, function(value) {
        this.setAttribute(key, value);
      }.bind(this));
    },

    function valueAttr_(key, value) {
      /* Set an attribute based off of a dynamic Value. */
      var l = function() {
        this.setAttribute(key, value.get());
      }.bind(this);
      value.sub(l);
      l();
    },

    function dynamicStyle_(key, fn) {
      /* Set a CSS style based off of a dynamic function. */
      this.dynamicFn(fn, function(value) {
        this.style_(key, value);
      }.bind(this));
    },

    function valueStyle_(key, v) {
      /* Set a CSS style based off of a dynamic Value. */
      var l = function(value) {
        this.style_(key, v.get());
      }.bind(this);
      v.sub(l);
      l();
    },

    function style_(key, value) {
      /* Set a CSS style based off of a literal value. */
      this.css[key] = value;
      this.onSetStyle(key, value);
      return this;
    },

    function valueE_(value) {
      /*
        Return an Element or an Array of Elements which are
        returned from the supplied dynamic Value.
        The Element(s) are replaced when the Value changes.
      */
      var self = this;

      function nextE() {
        var e = value.get();

        // Convert e or e[0] into a SPAN if needed,
        // So that it can be located later.
        if ( ! e ) {
          e = self.E('SPAN');
        } else if ( Array.isArray(e) ) {
          if ( e.length ) {
            if ( typeof e[0] === 'string' ) {
              e[0] = self.E('SPAN').add(e[0]);
            }
          } else {
            e = self.E('SPAN');
          }
        } else if ( ! foam.u2.Element.isInstance(e) ) {
          e = self.E('SPAN').add(e);
        }

        return e;
      }

      var e = nextE();
      var l = function() {
        var first = Array.isArray(e) ? e[0] : e;
        var e2 = nextE();
        self.insertBefore(e2, first);
        if ( Array.isArray(e) ) {
          for ( var i = 0 ; i < e.length ; i++ ) e[i].remove();
        } else {
          if ( e.state === e.LOADED ) e.remove();
        }
        e = e2;
      };
      var fl = this.framed(l);
      value.sub(fl);
      this.on('unload', function() { value.removeListener(fl); });
      return e;
    },

    function addEventListener_(topic, listener) {
      var foamtopic = topic.startsWith('on') ?
          'on' + topic :
          topic;
      this.sub(foamtopic, listener);
      this.el() && this.el().addEventListener(topic, listener);
    },

    function removeEventListener_(topic, listener) {
      if ( ! topic.startsWith('on') ) topic = 'on' + topic;
      this.unsub(topic, listener);
      this.el() && this.el().removeEventListener(topic, listener);
    },

    function output_(out) {
      /** Output the element without transitioning to the OUTPUT state. **/
      out('<', this.nodeName);
      if ( this.id ) out(' id="', this.id, '"');

      var first = true;
      for ( var key in this.classes ) {
        if ( ! this.classes[key] ) continue;
        if ( first ) {
          out(' class="');
          first = false;
        } else {
          out(' ');
        }
        out(key);
      }
      if ( ! first ) out('"');

      first = true;
      for ( var key in this.css ) {
        var value = this.css[key];

        if ( first ) {
          out(' style="');
          first = false;
        }
        out(key, ':', value, ';');
      }
      if ( ! first ) out('"');

      for ( var i = 0 ; i < this.attributes.length ; i++ ) {
        var attr  = this.attributes[i];
        var value = this.attributes[i].value;

        out(' ', attr.name);
        if ( value !== false ) out('="', value, '"');
      }

      if ( ! this.ILLEGAL_CLOSE_TAGS[this.nodeName] &&
          ( ! this.OPTIONAL_CLOSE_TAGS[this.nodeName] ||
          this.childNodes.length ) ) {
        out('>');
        this.outputInnerHTML(out);
        out('</', this.nodeName);
      }

      out('>');
    },


    //
    // Template Support
    //
    // Shorter versions of methods used by TemplateParser.
    //
    // !!! INTERNAL USE ONLY !!!

    function a() { return this.add.apply(this, arguments); },
    function c() { return this.cls.apply(this, arguments); },
    function d() { return this.enableCls.apply(this, arguments); },
    function e() { return this.end(); },
    function f(e) { return this.entity(e); },
    function g(opt_nodeName) { return this.tag(opt_nodeName); },
    function i(id) { return this.setID(id); },
    function n(nodeName) { this.nodeName = nodeName; return this; },
    function o(m) { for ( var k in m ) this.on(k, m[k]); return this; },
    function p(a) { a[0] = this; return this; },
    function s(opt_nodeName) { return this.start(opt_nodeName); },
    function t(as) { return this.attrs(as); },
    function x(m) {
      for ( var k in m ) this.__context__.set(k, m[k]);
      return this;
    },
    function y() { return this.style.apply(this, arguments); }
  ]
});

foam.CLASS({
  package: 'foam.u2',
  name: 'View',
  extends: 'foam.u2.Element',
  properties: [
    'data'
  ]
});

foam.__context__ = foam.__context__.createSubContext({
  E: function(name) {
    return foam.u2.Element.create({
      nodeName: name.toUpperCase()
    });
  },
  elementForName: function(name) { }
});
