/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
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

foam.ENUM({
  package: 'foam.u2',
  name: 'ControllerMode',

  documentation: 'CRUD controller modes: CREATE/VIEW/EDIT.',

  values: [
    { name: 'CREATE', label: 'Create' },
    { name: 'VIEW',   label: 'View'   },
    { name: 'EDIT',   label: 'Edit'   }
  ]
});

foam.ENUM({
  package: 'foam.u2',
  name: 'DisplayMode',

  documentation: 'View display mode; how or if a view is displayed.',

  values: [
    { name: 'RW',       label: 'Read-Write' },
    { name: 'DISABLED', label: 'Disabled'   },
    { name: 'RO',       label: 'Read-Only'  },
    { name: 'HIDDEN',   label: 'Hidden'     }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'Entity',

  documentation: `
    Virtual-DOM Entity.
    // TODO: Make both Entity and Element extend a common base-Model (Node?)
  `,

  properties: [
    {
      name: 'name',
      documentation: `
        // parser: seq(alphaChar, repeat0(wordChar)),
        // TODO(adamvy): This should be 'pattern' or 'regex', if those are ever
        // added.
      `,
      assertValue: function(nu) {
        if ( ! nu.match(/^[a-z#]\w*$/i) ) {
          throw new Error('Invalid Entity name: ' + nu);
        }
      }
    }
  ],

  methods: [
    function output(out) { out('&', this.name, ';'); },
    function toE() { return this; }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'CSS',

  documentation: 'Axiom to install CSS.',

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
      factory: function() { return new WeakMap(); },
      transient: true
    }
  ],

  methods: [
    function installInClass(cls) {
      // Install myself in this Window, if not already there.
      var oldCreate = cls.create;
      var axiom     = this;

      cls.create = function(args, opt_parent) {
        // TODO: move this functionality somewhere reusable
        var X = opt_parent ?
          ( opt_parent.__subContext__ || opt_parent.__context__ || opt_parent ) :
          foam.__context__;

        // Install our own CSS, and then all parent models as well.
        if ( X.document && ! axiom.installedDocuments_.has(X.document) ) {
          X.installCSS(axiom.expandCSS(this, axiom.code), cls.id);
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
      var base = '.' + foam.String.cssClassize(cls.id);
      return text.replace(/\^(.)/g, function(match, next) {
        var c = next.charCodeAt(0);
        // Check if the next character is an uppercase or lowercase letter,
        // number, - or _. If so, add a - because this is a modified string.
        // If not, there's no extra -.
        if ( (65 <= c && c <= 90) || (97 <= c && c <= 122) ||
            (48 <= c && c <= 57) || c === 45 || c === 95 ) {
          return base + '-' + next;
        }

        return base + next;
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'DefaultValidator',

  documentation: 'Default Element validator.',

  axioms: [ foam.pattern.Singleton.create() ],

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

  documentation: `
    Current lifecycle state of an Element.
    // TODO: Do we want the following method?
    // function detach() {},
  `,

  methods: [
    function output(out) {},
    function load() {},
    function unload() {},
    function onRemove() {},
    function onSetClass() {},
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

  documentation: 'State of an unloaded Element.',

  methods: [
    function output(out) {
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
  name: 'InitialElementState',
  extends: 'foam.u2.UnloadedElementState',

  documentation: 'Initial state of a newly created Element.',

  methods: [
    function output(out) {
      this.initE();
      return this.SUPER(out);
    },
    function toString() { return 'INITIAL'; }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'OutputElementState',
  extends: 'foam.u2.ElementState',

  documentation: 'State of Element after it has been output to DOM, but not yet loaded.',

  methods: [
    function output(out) {
      // TODO: raise a real error
      this.warn('ERROR: Duplicate output.');
      return this.UNLOADED.output.call(this, out);
    },
    function load() {
      if ( this.hasOwnProperty('elListeners') ) {
        var ls = this.elListeners;
        for ( var i = 0 ; i < ls.length ; i+=2 ) {
          this.addEventListener_(ls[i], ls[i+1]);
        }
      }

      this.visitChildren('load');
      this.state = this.LOADED;
      if ( this.tabIndex ) this.setAttribute('tabindex', this.tabIndex);
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
    function onSetClass(cls, enabled) { this.error(); },
    function onFocus(cls, enabled) { this.error(); },
    function onAddListener(topic, listener) { this.error(); },
    function onRemoveListener(topic, listener) { this.error(); },
    function onSetStyle(key, value) { this.error(); },
    function onSetAttr(key, value) { this.error(); },
    function onRemoveAttr(key) { this.error(); },
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

  documentation: 'State of an Element after it has been output to the DOM and loaded.',

  methods: [
    function output(out) {
      this.warn('Duplicate output.');
      return this.UNLOADED.output.call(this, out);
    },
    function load() { this.error('Duplicate load.'); },
    function unload() {
      if ( ! this.parentNode || this.parentNode.state === this.LOADED ) {
        var e = this.el();
        if ( e ) e.remove();
      }

      this.state = this.UNLOADED;
      this.visitChildren('unload');
    },
    function onRemove() { this.unload(); },
    function onSetClass(cls, enabled) {
      var e = this.el();
      if ( e ) {
        e.classList[enabled ? 'add' : 'remove'](cls);
      } else {
        this.warn('Missing Element: ', this.id);
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
      if ( this.PSEDO_ATTRIBUTES[key] ) {
        this.el()[key] = value;
      } else {
        this.el().setAttribute(key, value === true ? '' : value);
      }
    },
    function onRemoveAttr(key) {
      if ( this.PSEDO_ATTRIBUTES[key] ) {
        this.el()[key] = '';
      } else {
        this.el().removeAttribute(key);
      }
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

      // EXPERIMENTAL:
      // TODO(kgr): This causes some elements to get stuck in OUTPUT state
      // forever. It can be resurrected if that problem is fixed.
      // Load (mostly adding listeners) on the next frame
      // to allow the HTML to be shown more quickly.
      // this.__context__.window.setTimeout(function() {
      for ( var i = 0 ; i < children.length ; i++ ) {
        children[i].load && children[i].load();
      }
      // }, 33);
    },
    function onReplaceChild(oldE, newE) {
      var e = this.el();
      if ( ! e ) {
        this.warn('Missing Element: ', this.id);
        return;
      }
      var out = this.createOutputStream();
      out(newE);
      oldE.el().outerHTML = out.toString();
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
  name: 'RenderSink',
  implements: [ 'foam.dao.Sink' ],
  axioms: [
    {
      class: 'foam.box.Remote',
      clientClass: 'foam.dao.ClientSink'
    }
  ],
  properties: [
    {
      class: 'Function',
      name: 'addRow'
    },
    {
      class: 'Function',
      name: 'cleanup'
    },
    'dao',
    {
      class: 'Int',
      name: 'batch'
    }
  ],
  methods: [
    function put(obj, s) {
      this.reset();
    },
    function remove(obj, s) {
      this.reset();
    },
    function reset() {
      this.paint();
    }
  ],
  listeners: [
    {
      name: 'paint',
      isMerged: 100,
      code: function() {
        var batch = ++this.batch;
        var self = this;
        this.dao.select().then(function(a) {
          // Check if this is a stale render
          if ( self.batch !== batch ) return;

          var objs = a.array;
          self.cleanup();
          for ( var i = 0 ; i < objs.length ; i++ ) {
            self.addRow(objs[i]);
          }
        });
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.u2',
  name: 'Element',

  documentation: `
    Virtual-DOM Element. Root model for all U2 UI components.

    To insert a U2 Element into a regular DOM element, either:

    el.innerHTML = view.outerHTML;
    view.load();

    Or use a foam tag in your markup:

    <foam class="com.acme.mypackage.MyView"></foam>

    // TODO: Decide if we want this or not:
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
  `,

  requires: [
    'foam.u2.AttrSlot',
    'foam.u2.DefaultValidator',
    'foam.u2.Entity',
    'foam.u2.ViewSpec'
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

  constants: [
    {
      name: 'CSS_CLASSNAME_PATTERN',
      factory: function() { return /^[a-z_-][a-z\d_-]*$/i; }
    },
    {
      documentation: `
        Psedo-attributes don't work consistently with setAttribute() so need to
        be set on the real DOM element directly.
      `,
      name: 'PSEDO_ATTRIBUTES',
      value: {
        value: true,
        checked: true
      }
    },

    {
      name: 'DEFAULT_VALIDATOR',
      factory: function() { return foam.u2.DefaultValidator.create(); }
    },

    {
      documentation: `
        State of an Element after it has been output (to a String) but before it
        is loaded. This should be only a brief transitory state, as the Element
        should be loaded almost immediately after being output. It is an error
        to try and mutate the Element while in the OUTPUT state.
      `,
      name: 'OUTPUT',
      factory: function() { return foam.u2.OutputElementState.create(); }
    },

    {
      documentation: `
        State of an Element after it has been loaded.
        A Loaded Element should be visible in the DOM.
      `,
      name: 'LOADED',
      factory: function() { return foam.u2.LoadedElementState.create(); }
    },

    {
      documentation: `
        State of an Element after it has been removed from the DOM.
        An unloaded Element can be readded to the DOM.
      `,
      name: 'UNLOADED',
      factory: function() { return foam.u2.UnloadedElementState.create(); }
    },

    {
      documentation: `
        Initial state of an Element before it has been added to the DOM.
      `,
      name: 'INITIAL',
      factory: function() { return foam.u2.InitialElementState.create(); }
    },

    // ???: Add DESTROYED State?

    {
      documentation: `TODO: Don't allow these as they lead to ambiguous markup.`,
      name: 'OPTIONAL_CLOSE_TAGS',
      value: {
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
      }
    },

    {
      documentation: `
        Element nodeName's that are self-closing.
        Used to generate valid HTML output.
        Used by ElementParser for valid HTML parsing.
      `,
      name: 'ILLEGAL_CLOSE_TAGS',
      value: {
        AREA: true,
        BASE: true,
        BASEFONT: true,
        BR: true,
        COL: true,
        FRAME: true,
        HR: true,
        IMG: true,
        INPUT: true,
        ISINDEX: true,
        LINK: true,
        META: true,
        PARAM: true
      }
    },

    {
      name: '__ID__',
      value: [ 0 ]
    },

    {
      name: 'NEXT_ID',
      value: function() {
        return 'v' + this.__ID__[ 0 ]++;
      }
    },

    {
      documentation: `Keys which respond to keydown but not keypress`,
      name: 'KEYPRESS_CODES',
      value: { 8: true, 13: true, 27: true, 33: true, 34: true, 37: true, 38: true, 39: true, 40: true }
    },

    {
      name: 'NAMED_CODES',
      value: {
        '13': 'enter',
        '37': 'left',
        '38': 'up',
        '39': 'right',
        '40': 'down'
      }
    },
  ],

  css: `
    /*
     We hide Elements by adding this style rather than setting
     'display: none' directly because then when we re-show the
     Element we don't need to remember it's desired 'display' value.
    */
    .foam-u2-Element-hidden {
      display: none !important;
    }
  `,

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
      topics: [],
      delegates: foam.u2.ElementState.getOwnAxiomsByClass(foam.core.Method).
          map(function(m) { return m.name; }),
      factory: function() { return this.INITIAL; },
      postSet: function(oldState, state) {
        if ( state === this.LOADED ) {
          this.pub('onload');
        } else if ( state === this.UNLOADED ) {
          this.pub('onunload');
        }
      }
    },
    {
      name: 'content',
      preSet: function(o, n) {
        // Prevent setting to 'this', which wouldn't change the behaviour.
        return n === this ? null : n ;
      }
    },
    {
      name: 'parentNode',
      transient: true
    },
    {
      class: 'Boolean',
      name: 'shown',
      value: true,
      postSet: function(o, n) {
        if ( o === n ) return;
        if ( n ) {
          this.removeClass('foam-u2-Element-hidden');
        } else {
          this.addClass('foam-u2-Element-hidden');
        }
      }
    },
    {
      class: 'Proxy',
      of: 'foam.u2.DefaultValidator',
      name: 'validator',
      topics: [],
      factory: function() {
        return this.elementValidator$ ? this.elementValidator : this.DEFAULT_VALIDATOR;
      }
    },
    {
      name: 'nodeName',
      adapt: function(_, v) {
        // Convert to uppercase so that checks against OPTIONAL_CLOSE_TAGS
        // and ILLEGAL_CLOSE_TAGS work.
        return foam.String.toUpperCase(v);
      },
      value: 'DIV'
    },
    {
      name: 'attributeMap',
      documentation: 'Same information as "attributes", but in map form for faster lookup',
      transient: true,
      factory: function() { return {}; }
    },
    {
      name: 'attributes',
      documentation: 'Array of {name: ..., value: ...} attributes.',
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
      documentation: 'CSS classes assigned to this Element. Stored as a map of true values.',
      factory: function() { return {}; }
    },
    {
      name: 'css',
      documentation: 'Styles added to this Element.',
      factory: function() { return {}; }
    },
    {
      name: 'childNodes',
      documentation: 'Children of this Element.',
      factory: function() { return []; }
    },
    {
      name: 'elListeners',
      documentation: 'DOM listeners of this Element. Stored as topic then listener.',
      factory: function() { return []; }
    },
    {
      name: 'children',
      documentation: 'Virtual property of non-String childNodes.',
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
      hidden: true,
      getter: function() {
        return this.output(this.createOutputStream()).toString();
      }
    },
    {
      name: 'innerHTML',
      transient: true,
      hidden: true,
      getter: function() {
        return this.outputInnerHTML(this.createOutputStream()).toString();
      }
    },
    {
      name: 'scrollHeight',
    },
    {
      class: 'Int',
      name: 'tabIndex',
    },
    {
      name: 'clickTarget_'
    },
    {
      name: '__subSubContext__',
      factory: function() { return this.__subContext__; }
    },
    'keyMap_'
  ],

  methods: [
    function init() {
      this.onDetach(this.visitChildren.bind(this, 'detach'));
    },

    function initE() {
      /*
        Template method for adding addtion element initialization
        just before Element is output().
      */
      this.initKeyboardShortcuts();
    },

    function observeScrollHeight() {
      // TODO: This should be handled by an onsub event when someone subscribes to
      // scroll height changes.
      var self = this;
      var observer = new MutationObserver(function(mutations) {
        self.scrollHeight = self.el().scrollHeight;
      });
      var config = { attributes: true, childList: true, characterData: true };

      this.onload.sub(function(s) {
        observer.observe(self.el(), config);
      });
      this.onunload.sub(function(s) {
        observer.disconnect()
      });
      return this;
    },

    function evtToCharCode(evt) {
      /* Maps an event keycode to a string */
      var s = '';
      if ( evt.altKey   ) s += 'alt-';
      if ( evt.ctrlKey  ) s += 'ctrl-';
      if ( evt.shiftKey && evt.type === 'keydown' ) s += 'shift-';
      if ( evt.metaKey  ) s += 'meta-';
      s += evt.type === 'keydown' ?
          this.NAMED_CODES[evt.which] || String.fromCharCode(evt.which) :
          String.fromCharCode(evt.charCode);
      return s;
    },

    function initKeyMap_(keyMap, cls) {
      var count = 0;

      var as = cls.getAxiomsByClass(foam.core.Action);

      for ( var i = 0 ; i < as.length ; i++ ) {
        var a = as[i];

        for ( var j = 0 ; a.keyboardShortcuts && j < a.keyboardShortcuts.length ; j++, count++ ) {
          var key = a.keyboardShortcuts[j];

          // First, lookup named codes, then convert numbers to char codes,
          // otherwise, assume we have a single character string treated as
          // a character to be recognized.
          if ( this.NAMED_CODES[key] ) {
            key = this.NAMED_CODES[key];
          } else if ( typeof key === 'number' ) {
            key = String.fromCharCode(key);
          }

          keyMap[key] = a.maybeCall.bind(a, this.__subContext__, this);
          /*
          keyMap[key] = opt_value ?
            function() { a.maybeCall(this.__subContext__, opt_value.get()); } :
            a.maybeCall.bind(action, self.X, self) ;
          */
        }
      }

      return count;
    },

    function initKeyboardShortcuts() {
      /* Initializes keyboard shortcuts. */
      var keyMap = {}
      var count = this.initKeyMap_(keyMap, this.cls_);

      //      if ( this.of ) count += this.initKeyMap_(keyMap, this.of);

      if ( count ) {
        this.keyMap_ = keyMap;
        var target = this.parentNode || this;

        // Ensure that target is focusable, and therefore will capture keydown
        // and keypress events.
        target.tabIndex = target.tabIndex || 1;

        target.on('keydown',  this.onKeyboardShortcut);
        target.on('keypress', this.onKeyboardShortcut);
      }
    },

    function el() {
      /* Return this Element's real DOM element, if loaded. */
      return this.getElementById(this.id);
    },

    function findChildForEvent(e) {
      var src  = e.srcElement;
      var el   = this.el();
      var cMap = {};
      var cs   = this.children;

      if ( ! el ) return;

      for ( var i = 0 ; i < cs.length ; i++ ) {
        var c = cs[i];
        cMap[c.id] = c;
      }

      while ( src !== el ) {
        var c = cMap[src.id];
        if ( c ) return c;
        src = src.parentElement;
      }
    },

    function E(opt_nodeName) {
      return this.__subSubContext__.E(opt_nodeName);
    },

    function attrSlot(opt_name, opt_event) {
      /* Convenience method for creating an AttrSlot's. */
      var args = { element: this };

      if ( opt_name  ) args.property = opt_name;
      if ( opt_event ) args.event    = opt_event;

      return this.AttrSlot.create(args);
    },

    function myCls(opt_extra) {
      console.warn('Deprecated use of Element.myCls(). Use myClass() instead.');
      return this.myClass(opt_extra);
    },

    function myClass(opt_extra) {
      // Use hasOwnProperty so that class doesn't inherit CSS classname
      // from ancestor FOAM class.
      var f = this.cls_.hasOwnProperty('myClass_') && this.cls_.myClass_;

      if ( ! f ) {
        var base = this.cls_.hasOwnProperty('CSS_CLASS') ?
          this.cls_.CSS_CLASS.split(/ +/) :
          foam.String.cssClassize(this.cls_.id).split(/ +/) ;

        f = this.cls_.myClass_ = foam.Function.memoize1(function(e) {
          return base.map(function(c) { return c + (e ? '-' + e : ''); }).join(' ');
        });
      }

      return f(opt_extra);
    },

    function visitChildren(methodName) {
      /*
        Call the named method on all children.
        Typically used to transition state of all children at once.
        Ex.: this.visitChildren('load');
      */
      var cs = this.childNodes;
      for ( var i = 0 ; i < cs.length ; i++ ) {
        var c = cs[i];
        c[methodName] && c[methodName].call(c);
      }
    },

    function focus() {
      this.focused = true;
      this.onFocus();
      return this;
    },

    function blur() {
      this.focused = false;
      return this;
    },

    function show(opt_shown) {
      if ( opt_shown === undefined ) {
        this.shown = true;
      } else if ( foam.core.Slot.isInstance(opt_shown) ) {
        this.shown$.follow(opt_shown);
      } else {
        this.shown = !! opt_shown;
      }

      return this;
    },

    function hide(opt_hidden) {
      return this.show(
          opt_hidden === undefined              ? false :
          foam.core.Slot.isInstance(opt_hidden) ? opt_hidden.map(function(s) { return ! s; }) :
          ! opt_hidden);
    },

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

      if ( name === 'tabindex' ) this.tabIndex = parseInt(value);

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
          foam.assert(
              typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || foam.Date.isInstance(value),
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
      if ( this.PSEDO_ATTRIBUTES[name] && this.el() ) {
        var value = this.el()[name];
        var attr  = this.getAttributeNode(name);

        if ( attr ) {
          attr[name] = value;
        } else {
          attr = { name: name, value: value };
          this.attributes.push(attr);
          this.attributeMap[name] = attr;
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
      var cs = this.childNodes;
      for ( var i = 0 ; i < cs.length ; ++i ) {
        if ( cs[i] === c ) {
          cs.splice(i, 1);
          this.state.onRemoveChild.call(this, c, i);
          return;
        }
      }
    },

    function replaceChild(newE, oldE) {
      /* Replace current child oldE with newE. */
      var cs = this.childNodes;
      for ( var i = 0 ; i < cs.length ; ++i ) {
        if ( cs[i] === oldE ) {
          cs[i] = newE;
          newE.parentNode = this;
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
      this.onRemove();

      if ( this.parentNode ) {
        var cs = this.parentNode.childNodes;
        for ( var i = 0 ; i < cs.length ; i++ ) {
          if ( cs[i] === this ) {
            cs.splice(i, 1);
            return;
          }
        }
        this.parentNode = undefined;
      }
    },

    function addEventListener(topic, listener) {
      /* Add DOM listener. */
      this.elListeners.push(topic, listener);
      this.onAddListener(topic, listener);
    },

    function removeEventListener(topic, listener) {
      /* Remove DOM listener. */
      var ls = this.elListeners;
      for ( var i = 0 ; i < ls.length ; i+=2 ) {
        var t = ls[i], l = ls[i+1];
        if ( t === topic && l === listener ) {
          ls.splice(i, 2);
          this.onRemoveListener(topic, listener);
          return;
        }
      }
    },

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

    function cssClass(cls) {
      return this.addClass(cls);
    },

    function addClass(cls) { /* Slot | String */
      /* Add a CSS cls to this Element. */
      var self = this;
      if ( foam.core.Slot.isInstance(cls) ) {
        var lastValue = null;
        var l = function() {
          var v = cls.get();
          self.addClass_(lastValue, v);
          lastValue = v;
        };
        cls.sub(l);
        l();
      } else if ( typeof cls === 'string' ) {
        this.addClass_(null, cls);
      } else {
        this.error('cssClass type error. Must be Slot or String.');
      }

      return this;
    },

    function enableCls(cls, enabled, opt_negate) {
      console.warn('Deprecated use of Element.enableCls(). Use enableClass() instead.');
      return this.enableClass(cls, enabled, opt_negate);
    },

    function enableClass(cls, enabled, opt_negate) {
      /* Enable/disable a CSS class based on a boolean-ish dynamic value. */
      function negate(a, b) { return b ? ! a : a; }

      // TODO: add type checking
      if ( foam.core.Slot.isInstance(enabled) ) {
        var self = this;
        var value = enabled;
        var l = function() { self.enableClass(cls, value.get(), opt_negate); };
        value.sub(l);
        l();
      } else {
        enabled = negate(enabled, opt_negate);
        var parts = cls.split(' ');
        for ( var i = 0 ; i < parts.length ; i++ ) {
          this.classes[parts[i]] = enabled;
          this.onSetClass(parts[i], enabled);
        }
      }
      return this;
    },

    function removeCls(cls) {
      console.warn('Deprecated use of Element.removeCls(). Use removeClass() instead.');
      return this.removeClass(cls);
    },

    function removeClass(cls) {
      /* Remove specified CSS class. */
      if ( cls ) {
        delete this.classes[cls];
        this.onSetClass(cls, false);
      }
      return this;
    },

    function on(topic, listener) {
      /* Shorter fluent version of addEventListener. Prefered method. */
      this.addEventListener(topic, listener);
      return this;
    },

    function attr(key, value) {
      this.setAttribute(key, value);
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

    function tag(spec, args, slot) {
      /* Create a new Element and add it as a child. Return this. */
      var c = this.createChild_(spec, args);
      this.add(c);
      if ( slot ) slot.set(c);
      return this;
    },

    function br() {
      return this.tag('br');
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
      return foam.u2.ViewSpec.createView(spec, args, this, this.__subSubContext__);
    },

    function start(spec, args, slot) {
      /* Create a new Element and add it as a child. Return the child. */
      var c = this.createChild_(spec, args);
      this.add(c);
      if ( slot ) slot.set(c);
      return c;
    },

    function end() {
      /* Return this Element's parent. Used to terminate a start(). */
      return this.parentNode;
    },

    function add() {
      if ( this.content ) {
        this.content.add_(arguments, this);
      } else {
        this.add_(arguments, this);
      }
      return this;
    },

    function toE() {
      return this;
    },

    function add_(cs, parentNode) {
      /* Add Children to this Element. */
      var es = [];
      var Y = this.__subSubContext__;

      for ( var i = 0 ; i < cs.length ; i++ ) {
        var c = cs[i];

        // Remove null values
        if ( c === undefined || c === null ) {
          // nop
        } else if ( Array.isArray(c) ) {
          for ( var j = 0 ; j < c.length ; j++ ) {
            var v = c[j];
            es.push(v.toE ? v.toE(null, Y) : v);
          }
        } else if ( c.toE ) {
          var e = c.toE(null, Y);
          if ( foam.core.Slot.isInstance(e) ) {
            e = this.slotE_(e);
          }
          es.push(e);
        } else if ( typeof c === 'function' ) {
          throw new Error('Unsupported');
        } else if ( foam.core.Slot.isInstance(c) ) {
          var v = this.slotE_(c);
          if ( Array.isArray(v) ) {
            for ( var j = 0 ; j < v.length ; j++ ) {
              var u = v[j];
              es.push(u.toE ? u.toE(null, Y) : u);
            }
          } else {
            es.push(v.toE ? v.toE(null, Y) : v);
          }
        } else {
          es.push(c);
        }
      }

      if ( es.length ) {
        for ( var i = 0 ; i < es.length ; i++ ) {
          if ( foam.u2.Element.isInstance(es[i]) ) {
            es[i].parentNode = parentNode;
          } else if ( es[i].cls_ && es[i].cls_.id === 'foam.u2.Entity' ) {
            // NOP
          } else {
            es[i] = this.sanitizeText(es[i]);
          }
        }

        this.childNodes.push.apply(this.childNodes, es);
        this.onAddChildren.apply(this, es);
      }

      return this;
    },

    function addBefore(reference) { /*, vargs */
      /* Add a variable number of children before the reference element. */
      var children = [];
      for ( var i = 1 ; i < arguments.length ; i++ ) {
        children.push(arguments[i]);
      }
      return this.insertAt_(children, reference, true);
    },

    function removeAllChildren() {
      /* Remove all of this Element's children. */
      var cs = this.childNodes;
      while ( cs.length ) {
        this.removeChild(cs[0]);
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

    function daoSlot(dao, sink) {
      var slot = foam.dao.DAOSlot.create({
        dao: dao,
        sink: sink
      });

      this.onDetach(slot);

      return slot;
    },

    /**
     * Given a DAO and a function that maps from a record in that DAO to an
     * Element, call the function with each record as an argument and add the
     * returned elements to the view.
     * Will update the view whenever the contents of the DAO change.
     * @param {DAO<T>} dao The DAO to use as a data source
     * @param {T -> Element} f A function to be called on each record in the DAO. Should
     * return an Element that represents the view of the record passed to it.
     * @param {Boolean} update True if you'd like changes to each record to be put to
     * the DAO
     */
    function select(dao, f, update) {
      var es   = {};
      var self = this;

      var listener = foam.u2.RenderSink.create({
        dao: dao,
        addRow: function(o) {
          if ( update ) o = o.clone();

          self.startContext({data: o});

          var e = f.call(self, o);

          if ( update ) {
            o.propertyChange.sub(function(_,__,prop,slot) {
              dao.put(o.clone());
            });
          }

          self.endContext();

          if ( es[o.id] ) {
            self.replaceChild(es[o.id], e);
          } else {
            self.add(e);
          }
          es[o.id] = e;
        },
        cleanup: function() {
          for ( var key in es ) {
            es[key].remove();
          }

          es = {};
        }
      }, this);

      listener = foam.dao.MergedResetSink.create({
        delegate: listener
      }, this);

      this.onDetach(dao.listen(listener));
      listener.delegate.paint();

      return this;
    },

    function call(f, args) {
      f.apply(this, args);

      return this;
    },

    function callOn(obj, f, args) {
      obj[f].apply(obj, [this].concat(args));
      return this;
    },

    function callIf(bool, f, args) {
      if ( bool ) f.apply(this, args);

      return this;
    },

    function forEach(a, f) {
      for ( var i = 0 ; i < a.length ; i++ ) {
        f.call(this, a[i], i);
      }

      return this;
    },

    function outputInnerHTML(out) {
      var cs = this.childNodes;
      for ( var i = 0 ; i < cs.length ; i++ ) {
        out(cs[i]);
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
      var Element = foam.u2.Element;
      var Entity  = self.Entity;
      var f = function templateOut(/* arguments */) {
        for ( var i = 0 ; i < arguments.length ; i++ ) {
          var o = arguments[i];
          if ( o === null || o === undefined ) {
            // NOP
          } else if ( typeof o === 'string' ) {
            buf.push(o);
          } else if ( typeof o === 'number' ) {
            buf.push(o);
          } else if ( Element.isInstance(o) || Entity.isInstance(o) ) {
            o.output(f);
          } else if ( o === null || o === undefined ) {
            buf.push(o);
          }
        }
      };

      f.toString = function() {
        if ( buf.length === 0 ) return '';
        if ( buf.length > 1 ) return buf.join('');
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
      return this.cls_.id + '(nodeName=' + this.nodeName + ', state=' + this.state + ')';
      /* Converts Element to HTML String without transitioning state. */
      /*
        TODO: put this somewhere useful for debugging
      var s = this.createOutputStream();
      this.output_(s);
      return s.toString();
      */
    },

    function insertAt_(children, reference, before) {
      // (Element[], Element, Boolean)

      var i = this.childNodes.indexOf(reference);

      if ( i === -1 ) {
        this.warn("Reference node isn't a child of this.");
        return this;
      }

      if ( ! Array.isArray(children) ) children = [ children ];

      var Y = this.__subSubContext__;
      children = children.map(function(e) {
        e = e.toE ? e.toE(null, Y) : e;
        e.parentNode = this;
        return e;
      }.bind(this));

      var index = before ? i : (i + 1);
      this.childNodes.splice.apply(this.childNodes,
          [ index, 0 ].concat(children));

      this.state.onInsertChildren.call(
        this,
        children,
        reference,
        before ? 'beforebegin' : 'afterend');

      return this;
    },

    function addClass_(oldClass, newClass) {
      /* Replace oldClass with newClass. Called by cls(). */
      if ( oldClass === newClass ) return;
      this.removeClass(oldClass);
      if ( newClass ) {
        if ( ! this.CSS_CLASSNAME_PATTERN.test(newClass) ) {
          console.log('!!!!!!!!!!!!!!!!!!! Invalid CSS ClassName: ', newClass);
          throw "Invalid CSS classname";
        }
        this.classes[newClass] = true;
        this.onSetClass(newClass, true);
      }
    },

    function slotAttr_(key, value) {
      /* Set an attribute based off of a dynamic Value. */
      var self = this;
      var l = function() { self.setAttribute(key, value.get()); };
      value.sub(l);
      l();
    },

    function slotStyle_(key, v) {
      /* Set a CSS style based off of a dynamic Value. */
      var self = this;
      var l = function(value) { self.style_(key, v.get()); };
      v.sub(l);
      l();
    },

    function style_(key, value) {
      /* Set a CSS style based off of a literal value. */
      this.css[key] = value;
      this.onSetStyle(key, value);
      return this;
    },

    function slotE_(slot) {
      // TODO: add same context capturing behviour to other slotXXX_() methods.
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
        if ( e === undefined || e === null || e === '' ) {
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
        if ( self.state !== self.LOADED ) {
          s && s.detach();
          return;
        }
        var first = Array.isArray(e) ? e[0] : e;
        var tmp = self.E();
        self.insertBefore(tmp, first);
        if ( Array.isArray(e) ) {
          for ( var i = 0 ; i < e.length ; i++ ) { e[i].remove(); e[i].detach(); }
        } else {
          if ( e.state === e.LOADED ) { e.remove(); e.detach(); }
        }
        var e2 = nextE();
        self.insertBefore(e2, tmp);
        tmp.remove();
        e = e2;
      };

      var s = slot.sub(this.framed(l));
      this.onDetach(s);

      return e;
    },

    function addEventListener_(topic, listener) {
      var el = this.el();
      el && el.addEventListener(topic, listener, false);
    },

    function removeEventListener_(topic, listener) {
      this.el() && this.el().removeEventListener(topic, listener);
    },

    function output_(out) {
      /** Output the element without transitioning to the OUTPUT state. **/
      out('<', this.nodeName);
      if ( this.id !== null ) out(' id="', this.id, '"');

      var first = true;
      if ( this.hasOwnProperty('classes') ) {
        var cs = this.classes;
        for ( var key in cs ) {
          if ( ! cs[key] ) continue;
          if ( first ) {
            out(' class="');
            first = false;
          } else {
            out(' ');
          }
          out(key);
        }
        if ( ! first ) out('"');
      }

      if ( this.hasOwnProperty('css') ) {
        first = true;
        var cs = this.css;
        for ( var key in cs ) {
          var value = cs[key];

          if ( first ) {
            out(' style="');
            first = false;
          }
          out(key, ':', value, ';');
        }
        if ( ! first ) out('"');
      }

      if ( this.hasOwnProperty('attributes') ) {
        var as = this.attributes;
        for ( var i = 0 ; i < as.length ; i++ ) {
          var attr  = as[i];
          var name  = attr.name;
          var value = attr.value;

          out(' ', name);
          if ( value !== false ) out('="', foam.String.isInstance(value) ? value.replace(/"/g, '&quot;') : value, '"');
        }
      }

      if ( ! this.ILLEGAL_CLOSE_TAGS[this.nodeName] ) {
        var hasChildren = this.hasOwnProperty('childNodes') && this.childNodes.length;
        if ( hasChildren || ! this.OPTIONAL_CLOSE_TAGS[this.nodeName] ) {
          out('>');
          if ( hasChildren ) this.outputInnerHTML(out);
          out('</', this.nodeName);
        }
      }

      out('>');
    }
  ],

  listeners: [
    {
      name: 'onKeyboardShortcut',
      documentation: function() {/*
          Automatic mapping of keyboard events to $$DOC{ref:'Action'} trigger.
          To handle keyboard shortcuts, create and attach $$DOC{ref:'Action',usePlural:true}
          to your $$DOC{ref:'foam.ui.View'}.
      */},
      code: function(evt) {
        if ( evt.type === 'keydown' && ! this.KEYPRESS_CODES[evt.which] ) return;
        var action = this.keyMap_[this.evtToCharCode(evt)];
        if ( action ) {
          action();
          evt.preventDefault();
          evt.stopPropagation();
        }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'U2Context',

  documentation: 'Context which includes U2 functionality.',

  exports: [
    'E',
    'registerElement',
    'elementForName'
  ],

  properties: [
    {
      name: 'elementMap',
      documentation: 'Map of registered Elements.',
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
      /* Register a View class against an abstract node name. */
      var key = opt_elName || elClass.name;
      this.elementMap[key.toUpperCase()] = elClass;
    },

    function elementForName(nodeName) {
      /* Find an Element Class for the specified node name. */
      return this.elementMap[nodeName];
    }
  ]
});

foam.SCRIPT({
  id: 'foam.u2.U2ContextScript',
  requires: [
    'foam.u2.U2Context',
  ],
  flags: ['web'],
  code: function() {
    foam.__context__ = foam.u2.U2Context.create().__subContext__;
  }
});

foam.CLASS({
  refines: 'foam.core.FObject',
  methods: [
    function toE(args, X) {
      return foam.u2.ViewSpec.createView(
        { class: 'foam.u2.DetailView', showActions: true, data: this },
        args, this, X);
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Slot',
  methods: [
    function toE() { return this; }
  ]
});


foam.CLASS({
  refines: 'foam.core.ExpressionSlot',
  methods: [
    function toE() { return this; }
  ]
});


foam.CLASS({
  refines: 'foam.core.Property',

  requires: [
    'foam.u2.TextField'
  ],

  properties: [
    {
      // If true, this property is treated as a psedo-U2 attribute.
      name: 'attribute',
      value: false
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'view',
      value: { class: 'foam.u2.TextField' }
    },
    {
      class: 'Enum',
      of: 'foam.u2.Visibility',
      name: 'visibility',
      value: 'RW'
    }
  ],

  methods: [
    function toE(args, X) {
      var e = foam.u2.ViewSpec.createView(this.view, args, this, X);

      e.fromProperty && e.fromProperty(this);

      if ( X.data$ && ! ( args && ( args.data || args.data$ ) ) ) {
        e.data$ = X.data$.dot(this.name);
      }

      // e could be a Slot, so check if addClass exists
      e.addClass && e.addClass('property-' + this.name);

      return e;
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.String',
  properties: [
    {
      class: 'Int',
      name: 'displayWidth',
      expression: function(width) { return width; }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.StringArray',
  properties: [
    [ 'view', { class: 'foam.u2.view.StringArrayView' } ]
  ]
});


foam.CLASS({
  refines: 'foam.core.Date',
  requires: [ 'foam.u2.DateView' ],
  properties: [
    [ 'view', { class: 'foam.u2.DateView' } ]
  ]
});


foam.CLASS({
  refines: 'foam.core.DateTime',
  requires: [ 'foam.u2.DateTimeView' ],
  properties: [
    [ 'view', { class: 'foam.u2.DateTimeView' } ]
  ]
});


foam.CLASS({
  refines: 'foam.core.Time',
  requires: [ 'foam.u2.TimeView' ],
  properties: [
    [ 'view', { class: 'foam.u2.TimeView' } ]
  ]
});


foam.CLASS({
  refines: 'foam.core.Float',
  requires: [ 'foam.u2.FloatView' ],
  properties: [
    [ 'displayWidth', 12 ],
    [ 'view', { class: 'foam.u2.FloatView' } ]
  ]
});


foam.CLASS({
  refines: 'foam.core.Int',
  requires: [ 'foam.u2.IntView' ],
  properties: [
    [ 'displayWidth', 10 ],
    [ 'view', { class: 'foam.u2.IntView' } ]
  ]
});


foam.CLASS({
  refines: 'foam.core.Currency',
  requires: [ 'foam.u2.CurrencyView' ],
  properties: [
    [ 'displayWidth', 15 ],
    [ 'view', { class: 'foam.u2.CurrencyView' } ]
  ]
});


foam.CLASS({
  refines: 'foam.core.Boolean',
  requires: [ 'foam.u2.CheckBox' ],
  properties: [
    [ 'view', { class: 'foam.u2.CheckBox' } ],
  ]
});


foam.CLASS({
  refines: 'foam.core.Color',
  properties: [
    {
      name: 'view',
      value: {
        class: 'foam.u2.view.DualView',
        viewa: 'foam.u2.TextField',
        viewb: { class: 'foam.u2.view.ColorPicker', onKey: true }
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.FObjectProperty',
  properties: [
    {
      name: 'view',
      value: { class: 'foam.u2.DetailView' },
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.FObjectArray',
  properties: [
    {
      name: 'view',
      value: { class: 'foam.u2.view.FObjectArrayView' },
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Class',
  properties: [
    [ 'view', { class: 'foam.u2.ClassView' } ]
  ]
});


foam.CLASS({
  refines: 'foam.core.Reference',
  properties: [
    {
      name: 'view',
      value: {
        class: 'foam.u2.view.ReferenceView'
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Enum',
  properties: [
    [ 'view',          { class: 'foam.u2.EnumView' } ],
    [ 'tableCellView', function(obj) { return this.get(obj).label; } ]
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'ControllerViewTrait',

  documentation: 'Trait for adding a ControllerMode controllerMode Property.',

  exports: [ 'controllerMode' ],

  properties: [
    {
      class: 'Enum',
      of: 'foam.u2.ControllerMode',
      name: 'controllerMode'
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'View',
  extends: 'foam.u2.Element',

  documentation: `
    A View is an Element used to display data.
    // TODO: Should the following be properties?
    /*
    {
      type: 'Boolean',
      name: 'showValidation',
      documentation: 'Set to false if you want to ignore any ' +
          '$$DOC{ref:"Property.validate"} calls. On by default.',
      defaultValue: true
    },
    {
      type: 'String',
      name: 'validationError_',
      documentation: 'The actual error message. Null or the empty string ' +
          'when there is no error.',
    }
    */
  `,

  exports: [ 'data' ],

  properties: [
    {
      class: 'Enum',
      of: 'foam.u2.ControllerMode',
      name: 'controllerMode',
      factory: function() { return this.__context__.controllerMode || foam.u2.ControllerMode.CREATE; }
    },
    {
      name: 'data',
      attribute: true
    },
    {
      class: 'Enum',
      of: 'foam.u2.Visibility',
      name: 'visibility',
      postSet: function() { this.updateMode_(this.mode); },
      attribute: true,
      value: 'RW'
    },
    {
      class: 'Enum',
      of: 'foam.u2.DisplayMode',
      name: 'mode',
      attribute: true,
      postSet: function(_, mode) { this.updateMode_(mode); },
      expression: function(visibility, controllerMode) {
        if ( visibility === foam.u2.Visibility.RO ) {
          return foam.u2.DisplayMode.RO;
        }

        if ( visibility === foam.u2.Visibility.DISABLED ) {
          return foam.u2.DisplayMode.DISABLED;
        }

        if ( visibility === foam.u2.Visibility.FINAL &&
             controllerMode !== foam.u2.ControllerMode.CREATE ) {
          return foam.u2.DisplayMode.RO;
        }

        return controllerMode === foam.u2.ControllerMode.VIEW ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.RW ;
      },
      attribute: true
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.updateMode_(this.mode);
    },

    function updateMode_() {
      // Template method, to be implemented in sub-models
    },

    function fromProperty(p) {
      this.visibility = p.visibility;
    }
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'Controller',
  extends: 'foam.u2.Element',

  documentation: 'A Controller is an Element which exports itself as "data".',

  exports: [ 'as data' ]
});


foam.CLASS({
  refines: 'foam.core.Action',

  requires: [
    'foam.u2.ActionView'
  ],

  methods: [
    function toE(args, X) {
      var view = foam.u2.ViewSpec.createView(
        { class: 'foam.u2.ActionView', action: this }, args, this, X);

      if ( X.data$ && ! ( args && ( args.data || args.data$ ) ) ) {
        view.data$ = X.data$;
      }

      return view;
    }
  ]
});

foam.CLASS({
  package: 'foam.u2',
  name: 'TableColumns',

  documentation: 'Axiom for storing Table Columns information in Class. Unlike most Axioms, doesn\'t modify the Class, but is just used to store information.',

  properties: [
    [ 'name', 'tableColumns' ],
    'columns'
  ]
});


foam.CLASS({
  package: 'foam.u2',
  name: 'SearchColumns',

  documentation: 'Axiom for storing Table Search Columns information in Class. Unlike most Axioms, doesn\'t modify the Class, but is just used to store information.',

  properties: [
    [ 'name', 'searchColumns' ],
    'columns'
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',

  properties: [
    {
      class: 'String',
      name: 'css',
      postSet: function(_, code) {
        this.axioms_.push(foam.u2.CSS.create({code: code}));
      }
    },
    {
      documentation: `
        // TODO: remove when all code ported
      `,
      name: 'tableProperties',
      setter: function(_, ps) {
        console.warn("Deprecated use of tableProperties. Use 'tableColumns' instead.");
        this.tableColumns = ps;
      }
    },
    {
      name: 'tableColumns',
      postSet: function(_, cs) {
        this.axioms_.push(foam.u2.TableColumns.create({columns: cs}));
      }
    },
    {
      name: 'searchColumns',
      postSet: function(_, cs) {
        this.axioms_.push(foam.u2.SearchColumns.create({columns: cs}));
      }
    }
  ]
});
