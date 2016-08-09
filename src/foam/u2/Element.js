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
 - Remove use of E() and replace with create-ing axiom to add same behaviour.
 - create 'inner' element which defaults to this. add() adds to inner to make
   creating borders simple
 - start('leftPanel') should work for locating pre-existing named spaces
 - start, tag, and add() should use standard helper method
 - Fix handling of Slots that return arrays.
 - Properly handle insertBefore_ of an element that's already been inserted?
*/

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

  axioms: [ foam.pattern.Singleton.create() ],

  documentation: 'Default Element validator.',

  methods: [
    function validateNodeName(name) {
      return true;
    },

    function validateClass(cls) {
      // TODO
    },

    function validateAttributeName(name) {
      // TODO
    },

    function validateAttributeValue(value) {
      // TODO
    },

    function validateStyleName(name) {
      // TODO
    },

    function validateStyleValue(value) {
      // TODO
    },

    function sanitizeText(text) {
      if ( ! text ) return text;
      text = text.toString();
      return text.replace(/[&<"']/g, function(m) {
        switch ( m ) {
          case '&': return '&amp;';
          case '<': return '&lt;';
          case '"': return '&quot;';
          case "'": return '&#039';
        }
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'ElementState',

  methods: [
    function output(out) {},
    function load() {},
    function unload() {},
    function remove() {},
    function destroy() {},
    function onSetCls() {},
    function onFocus() {},
    function onAddListener() {},
    function onRemoveListener() {},
    function onSetStyle() {},
    function onSetAttr() {},
    function onRemoveAttr() {},
    function onAddChildren() {},
    function onInsertChildren() {},
    function onReplaceChild() {},
    function onRemoveChild() {},
    function getBoundingClientRect() {
      return {
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        width: 0,
        height: 0
      };
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'UnloadedElementState',
  extends: 'foam.u2.ElementState',

  methods: [
    function output(out) {
      this.initE();
      this.state = this.OUTPUT;
      this.output_(out);
      return out;
    },
    function load() {
      this.error('Must output before loading.');
    },
    function unload() {
      this.error('Must output and load before unloading.');
    },
    function toString() { return 'UNLOADED'; }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'OutputElementState',
  extends: 'foam.u2.ElementState',

  methods: [
    function output(out) {
      // TODO: raise a real error
      this.warn('ERROR: Duplicate output.');
      return this.UNLOADED.output.call(this, out);
    },
    function load() {
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
    function unload() {
      this.state = this.UNLOADED;
      this.visitChildren('unload');
    },
    function error() {
      throw new Error('Mutations not allowed in OUTPUT state.');
    },
    function onSetCls(cls, enabled) { this.error(); },
    function onFocus(cls, enabled) { this.error(); },
    function onAddListener(topic, listener) { this.error(); },
    function onRemoveListener(topic, listener) { this.error(); },
    function onSetStyle(key, value) { this.error(); },
    function onSetAttr(key, value) { this.error(); },
    function onRemoveAttr(key, value) { this.error(); },
    function onAddChildren(c) { this.error(); },
    function onInsertChildren() { this.error(); },
    function onReplaceChild() { this.error(); },
    function onRemoveChild() { this.error(); },
    function toString() { return 'OUTPUT'; }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'LoadedElementState',
  extends: 'foam.u2.ElementState',

  methods: [
    function output(out) {
      this.warn('Duplicate output.');
      return this.UNLOADED.output.call(this, out);
    },
    function load() { this.error('Duplicate load.'); },
    function unload() {
      var e = this.el();
      if ( e ) {
        e.remove();
      }
      this.state = this.UNLOADED;
      this.visitChildren('unload');
    },
    function remove() { this.unload(); },
    function onSetCls(cls, enabled) {
      var e = this.el();
      if ( ! e ) {
        this.warn('Missing Element: ', this.id);
      } else {
        e.classList[enabled ? 'add' : 'remove'](cls);
      }
    },
    function onFocus() {
      this.el().focus();
    },
    function onAddListener(topic, listener) {
      this.addEventListener_(topic, listener);
    },
    function onRemoveListener(topic, listener) {
      this.addRemoveListener_(topic, listener);
    },
    function onSetStyle(key, value) {
      this.el().style[key] = value;
    },
    function onSetAttr(key, value) {
      // 'value' doesn't work consistently with setAttribute()
      if ( key === 'value' ) {
        this.el().value = value;
      } else {
        this.el().setAttribute(key, value === true ? '' : value);
      }
    },
    function onRemoveAttr(key, value) {
      this.el().removeAttribute(key);
    },
    function onAddChildren() {
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
    function onInsertChildren(children, reference, where) {
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
    function onReplaceChild(oldE, newE) {
      var e = this.el();
      if ( ! e ) {
        this.warn('Missing Element: ', this.id);
        return;
      }
      var out = this.createOutputStream();
      out(newE);
      // TODO: import document
      var n = this.__context__.document.createElement('div');
      n.innerHTML = out.toString();
      e.replaceChild(n.firstChild, oldE.el());
      newE.load && newE.load();
    },
    function onRemoveChild(child, index) {
      if ( typeof child === 'string' ) {
        this.el().childNodes[index].remove();
      } else {
        child.remove();
      }
    },
    function getBoundingClientRect() {
      return this.el().getBoundingClientRect();
    },
    function toString() { return 'LOADED'; }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'Element',

  // documentation: 'Virtual-DOM Element. Root model for all U2 UI components.',

  requires: [
    'foam.u2.DefaultValidator',
    'foam.u2.AttrSlot',
    'foam.u2.Entity'
  ],

  imports: [
    'document',
    'elementValidator',
    'framed',
    'getElementById'
  ],

  topics: [
    'onload',
    'onunload'
  ],

  constants: {
    DEFAULT_VALIDATOR: foam.u2.DefaultValidator.create(),

    // State of an Element after it has been output (to a String) but before it is loaded.
    // This should be only a brief transitory state, as the Element should be loaded
    // almost immediately after being output.  It is an error to try and mutate the Element
    // while in the OUTPUT state.
    OUTPUT: foam.u2.OutputElementState.create(),

    // State of an Element after it has been loaded.
    // A Loaded Element should be visible in the DOM.
    LOADED: foam.u2.LoadedElementState.create(),

    // State of an Element before it has been added to the DOM, or after it has
    // been removed from the DOM.
    // An unloaded Element can be (re-)added to the DOM.
    UNLOADED: foam.u2.UnloadedElementState.create(),

    // ???: Add DESTROYED State?

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
    // Used to generate valid HTML output.
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
    },

    __ID__: [ 0 ],

    NEXT_ID: function() {
      return 'v' + this.__ID__[ 0 ]++;
    }
  },

  properties: [
    {
      name: 'id',
      transient: true,
      factory: function() { return this.NEXT_ID(); }
    },
    {
      name: 'state',
      class: 'Proxy',
      of: 'foam.u2.ElementState',
      transient: true,
      delegates: foam.u2.ElementState.getOwnAxiomsByClass(foam.core.Method).
          map(function(m) { return m.name; }),
      factory: function() { return this.UNLOADED; },
      postSet: function(_, state) {
        if ( state === this.LOADED ) {
          this.onload.pub();
        } else if ( state === this.UNLOADED ) {
          this.onunload.pub();
        }
      }
    },
    {
      name: 'parentNode',
      transient: true
    },
    {
      class: 'Proxy',
      of: 'foam.u2.DefaultValidator',
      name: 'validator',
      factory: function() {
        return this.elementValidator$ ? this.elementValidator : this.DEFAULT_VALIDATOR;
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
      // documentation: 'Same information as "attributes", but in map form for faster lookup',
      transient: true,
      factory: function() { return {}; }
    },
    {
      name: 'attributes',
      // documentation: 'Array of {name: ..., value: ...} attributes.',
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
      // documentation: 'CSS classes assigned to this Element. Stored as a map of true values.',
      factory: function() { return {}; }
    },
    {
      name: 'css',
      // documentation: 'Styles added to this Element.',
      factory: function() { return {}; }
    },
    {
      name: 'childNodes',
      // documentation: 'Children of this Element.',
      factory: function() { return []; }
    },
    {
      name: 'elListeners',
      // documentation: 'DOM listeners of this Element.',
      factory: function() { return []; }
    },
    {
      name: 'children',
      // documentation: 'Virtual property of non-String childNodes.',
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
    },
    {
      name: '__subSubContext__',
      factory: function() { return this.__subContext__; }
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
      /*
        Template method for adding addtion element initialization
        just before Element is output().
      */
    },

    function el() {
      /* Return this Element's real DOM element, if loaded. */
      return this.getElementById(this.id);
    },

    function E(opt_nodeName) {
      return this.__subSubContext__.E(opt_nodeName);
    },

    // function XXXE(opt_nodeName /* | DIV */) {
    //   /* Create a new Element */
    //   var Y = this.__subContext__;
    //
    //   // ???: Is this needed / a good idea?
    //   if ( this.data && ! Y.data ) Y = Y.createSubContext({ data: this.data });
    //
    //   // Some names have sub-Models registered for them.
    //   // Example 'input'
    //   var e = Y.elementForName(opt_nodeName);
    //
    //   if ( ! e ) {
    //     e = foam.u2.Element.create(null, Y);
    //     if ( opt_nodeName ) e.nodeName = opt_nodeName;
    //   }
    //
    //   return e;
    // },

    function attrSlot(opt_name, opt_event) {
      /* Convenience method for creating an AttrSlot's. */
      var args = { element: this };

      if ( opt_name  ) args.property = opt_name;
      if ( opt_event ) args.event    = opt_event;

      return this.AttrSlot.create(args);
    },

    function myCls(opt_extra) {
      /*
        Constructs a default class name for this view, with an optional extra.
      // TODO: Braden, remove the trailing '-'.
        Without an extra, results in eg. 'foam-u2-Input-'.
        With an extra of "foo", results in 'foam-u2-Input-foo'.
      */
      var base = this.cls_.CSS_NAME || foam.String.cssClassize(this.cls_.id);

      if ( ! opt_extra ) opt_extra = '';

      return base.split(/ +/).
          map(function(c) { return c + '-' + opt_extra; }).
          join(' ');
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

      // TODO: type checking

      // handle slot binding, ex.: data$: ...,
      // Remove if we add a props() method
      if ( name.endsWith('$') ) {
        this[name] = value;
        return;
      }

      var prop = this.cls_.getAxiomByName(name);

      if ( prop &&
           foam.core.Property.isInstance(prop) &&
           prop.attribute )
      {
        if ( typeof value === 'string' ) {
          // TODO: remove check when all properties have fromString()
          this[name] = prop.fromString ? prop.fromString(value) : value;
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

        if ( foam.core.Slot.isInstance(value) ) {
          this.slotAttr_(name, value);
        } else {
          this.assert(
              typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || foam.Date.is(value),
              'Attribute value must be a primitive type.');

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
      /*
        Get {name: ..., value: ...} attributeNode associated
        with 'name', if exists.
      */
      return this.attributeMap[name];
    },

    function getAttribute(name) {
      // TODO: add support for other dynamic attributes also
      // TODO: don't lookup in real DOM if listener present
      if ( name === 'value' && this.el() ) {
        var value = this.el().value;
        var attr  = this.getAttributeNode(name);

        if ( attr ) {
          attr.value = value;
        } else {
          // TODO: add attribute
        }

        return value;
      }

      /*
        Get value associated with attribute 'name',
        or undefined if attribute not set.
      */
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

    function setNodeName(name) {
      this.nodeName = name;
      return this;
    },

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
      /* Create and add a named entity. Ex. .entity('gt') */
      this.add(this.Entity.create({ name: name }));
      return this;
    },

    function nbsp() {
      return this.entity('nbsp');
    },

    // Was renamed from cls() in FOAM1, current name seems
    // out of place.  Maybe renamed addClass().
    function cssClass(/* Slot | String */ cls) {
      /* Add a CSS cls to this Element. */
      if ( foam.core.Slot.isInstance(cls) ) {
        var lastValue = null;
        var l = function() {
          var v = cls.get();
          this.cssClass_(lastValue, v);
          lastValue = v;
        }.bind(this);
        cls.sub(l);
        l();
      } else if ( typeof cls === 'string' ) {
        this.cssClass_(null, cls);
      } else {
        this.error('cssClass type error. Must be Slot or String.');
      }

      return this;
    },

    function enableCls(cls, enabled, opt_negate) {
      /* Enable/disable a CSS class based on a boolean-ish dynamic value. */
      function negate(a, b) { return b ? ! a : a; }

      // TODO: add type checking
      if ( foam.core.Slot.isInstance(enabled) ) {
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
        if ( foam.core.Slot.isInstance(value) ) {
          this.slotStyle_(key, value);
        } else {
          this.style_(key, value);
        }
        // TODO: add type checking for this
      }

      return this;
    },

    function tag(spec, args) {
      /* Create a new Element and add it as a child. Return this. */
      return this.add(this.createChild_(spec, args));
    },

    function startContext(map) {
      var m = {};
      Object.assign(m, map);
      m.__oldAddContext__ = this.__subSubContext__;
      this.__subSubContext__ = this.__subSubContext__.createSubContext(m);
      return this;
    },

    function endContext() {
      this.__subSubContext__ = this.__subSubContext__.__oldAddContext__;
      return this;
    },

    function createChild_(spec, args) {
      if ( foam.u2.Element.isInstance(spec) ) return spec;

      if ( spec && spec.toE ) return spec.toE(this.__subSubContext__, args);

      return this.E(spec);
    },

    function start(spec, args) {
      /* Create a new Element and add it as a child. Return the child. */
      var c = this.createChild_(spec, args);
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
      var Y = this.__subSubContext__;
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
        } else if ( foam.core.Slot.isInstance(c) ) {
          var v = this.slotE_(c);
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

    function setChildren(slot) {
      /**
         slot -- a Slot of an array of children which set this element's
         contents, replacing old children
      **/
      var l = function() {
        this.removeAllChildren();
        this.add.apply(this, slot.get());
      }.bind(this);

      slot.sub(l);
      l();

      return this;
    },

    function repeat(s, e, f) {
      // TODO: support descending
      for ( var i = s ; i <= e ; i++ ) {
        f.call(this, i);
      }
      return this;
    },

    function call(f) {
      f.call(this);

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

    function write() {
      /* Write Element to document. */
      this.document.body.insertAdjacentHTML('beforeend', this.outerHTML);
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

      var Y = this.__subSubContext__;
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

    function slotAttr_(key, value) {
      /* Set an attribute based off of a dynamic Value. */
      var l = function() {
        this.setAttribute(key, value.get());
      }.bind(this);
      value.sub(l);
      l();
    },

    function slotStyle_(key, v) {
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

    // TODO: add same context capturing behviour to other slotXXX_() methods.
    function slotE_(slot) {
      /*
        Return an Element or an Array of Elements which are
        returned from the supplied dynamic Slot.
        The Element(s) are replaced when the Slot changes.
      */
      var self = this;
      var ctx  = this.__subSubContext__;

      function nextE() {
        // Run Slot in same subSubContext that it was created in.
        var oldCtx = self.__subSubContext__;
        self.__subSubContext__ = ctx;
        var e = slot.get();

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

        self.__subSubContext__ = oldCtx;

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

      var s = slot.sub(this.framed(l));
      this.on('unload', s.destroy.bind(s));

      return e;
    },

    // ???/TODO: What is this doing?
    function addEventListener_(topic, listener) {
      var foamtopic = topic.startsWith('on') ?
          'on' + topic :
          topic ;
      this.sub(foamtopic, listener);
      this.el() && this.el().addEventListener(topic, listener, false);
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
        var name  = attr.name;
        var value = attr.value;

        out(' ', name);
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
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'U2Context',

  exports: [
    'E',
    'registerElement',
    'elementForName'
  ],

  properties: [
    {
      name: 'elementMap',
      factory: function() { return {}; }
    }
  ],

  methods: [
    {
      class: 'foam.core.ContextMethod',
      name: 'E',
      code: function E(ctx, opt_nodeName) {
        var nodeName = (opt_nodeName || 'div').toUpperCase();

        return (
          ctx.elementForName(nodeName) || foam.u2.Element).
          create({nodeName: nodeName}, ctx);
      }
    },

    function registerElement(elClass, opt_elName) {
      var key = opt_elName || elClass.name;
      this.elementMap[key.toUpperCase()] = elClass;
    },

    function elementForName(nodeName) {
      if ( this.elementMap[nodeName] ) console.log('NODENAME: ', nodeName, this.elementMap[nodeName]);
      return this.elementMap[nodeName];
    }
  ]
});

foam.__context__ = foam.u2.U2Context.create().__subContext__;


foam.CLASS({
  refines: 'foam.core.Property',

  requires: [
    'foam.u2.PropertyView',
    'foam.u2.TextField'
  ],

  properties: [
    {
      // If true, this property is treated as a psedo-U2 attribute.
      name: 'attribute',
      value: false
    },
    {
      name: 'toPropertyE',
      value: function toPropertyE(X, args) {
        return this.TextField.create(args, X);
      }
    }
  ],

  methods: [
    function toE(X, args) {
      var e = this.toPropertyE(X, this);

      e.fromProperty && e.fromProperty(this);

      if ( X.data ) {
        e.data$ = X.data$.dot(this.name);
      }

      if ( args ) e.copyFrom(args);

      return e;
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Date',
  requires: [ 'foam.u2.DateView' ],
  properties: [
    [ 'toPropertyE', function(X, args) {
      return this.DateView.create(args, X);
    }]
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'View',
  extends: 'foam.u2.Element',

  exports: [ 'data' ],

  properties: [
    {
      name: 'data',
      attribute: true
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Action',

  requires: [
    'foam.u2.ActionView'
  ],

  methods: [
    function toE(X, args) {
      return X.lookup('foam.u2.ActionView').create({
        data$:  X.data$,
        action: this
      }, X).copyFrom(args || {});
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'CSS',

  properties: [
    {
      class: 'String',
      name: 'code'
    },
    {
      name: 'name',
      factory: function() { return 'CSS-' + this.$UID; }
    },
    {
      name: 'installedDocuments_',
      factory: function() { return new WeakMap(); }
    }
  ],

  methods: [
    function installInClass(cls) {
      // Install myself in this Window, if not already there.
      var oldCreate = cls.create;
      var axiom = this;

      cls.create = function(args, opt_parent) {
        // TODO: move this functionality somewhere reusable
        var X = opt_parent ?
          ( opt_parent.__subContext__ || opt_parent.__context__ || opt_parent ) :
          foam.__context__;

        // Install our own CSS, and then all parent models as well.
        if ( ! axiom.installedDocuments_.has(X.document) ) {
          X.installCSS(axiom.expandCSS(cls, axiom.code));
          axiom.installedDocuments_.set(X.document, true);
        }

        // Now call through to the original create.
        return oldCreate.call(this, args, X);
      };
    },

    function expandCSS(cls, text) {
      /* Performs expansion of the ^ shorthand on the CSS. */
      // TODO(braden): Parse and validate the CSS.
      // TODO(braden): Add the automatic prefixing once we have the parser.
      return text.replace(/\^/g,
          '.' + (cls.CSS_NAME || foam.String.cssClassize(cls.id)) + '-');
    }
  ]
});

// TODO: make a tableProperties property on AbstractClass

foam.CLASS({
  package: 'foam.u2',
  name: 'TableProperties',

  properties: [
    [ 'name', 'tableProperties' ],
    {
      name: 'properties',
      factory: function() {
        debugger;
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',
  properties: [
    {
      name: 'tableProperties',
      postSet: function(_, properties) {
        this.axioms_.push(foam.u2.TableProperties.create({properties: properties}));
      }
    }
  ]
});
