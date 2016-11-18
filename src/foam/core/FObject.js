/*
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

/**
  FObject is the root of FOAM's class hierarchy.

  We define FObject twice, first as a LIB to install all of
  the static/class methods in the top-level FObject class,
  then with a CLASS below to define methods on the FObject
  prototype.

  For details on how FObject fits in to the FOAM class system,
  see the documentation in the top of Boot.js
 */
foam.LIB({
  name: 'foam.core.FObject',

  documentation: 'Root prototype for all classes.',

  constants: {
    // Each class has a prototype object which is the prototype of all
    // instances of the class. A classes prototype extends its parent
    // classes prototype.
    prototype: {},

    // Each class has a map of Axioms added to the class.
    // Map keys are the name of the axiom.
    // The classes axiomMap_'s extends its parent's axiomMap_.
    axiomMap_: {},

    // Each class has a map of "private" variables for use by
    // axioms. Storing internal data in private_ instead of on the
    // class directly avoids name conflicts with public features of
    // the class.
    private_:  { axiomCache: {} }
  },

  methods: [
    /**
      Create a new instance of this class.
      Configured from values taken from 'args', if supplifed.
    */
    function create(args, opt_parent) {
      var obj = Object.create(this.prototype);

      // Properties have their values stored in instance_ instead
      // of on the object directly. This lets us defineProperty on
      // the object itself so that we can add extra behaviour
      // to properties (things like preSet, postSet, firing property-
      // change events, etc.).
      obj.instance_ = {};

      // initArgs() is the standard argument extraction method.
      obj.initArgs(args, opt_parent);

      // init(), if defined, is called when object is created.
      // This is where class specific initialization code should
      // be put (not in initArgs).
      obj.init();

      return obj;
    },

    /**
      Internal method to create a subclass of this class.
      Is called from Model.buildClass().
    */
    function createSubClass_() {
      // When called this first time it just returns 'this',
      // which is foam.core.FObject. This is so that the existing
      // FObject LIB can be reused/extended into a class as part
      // of the bootstrap process.
      // When this version is first called it replaces itself with
      // the real version (below), which is then used for all
      // remaining non-FObject classes.

      foam.core.FObject.createSubClass_ = function() {
        var cls = Object.create(this);

        cls.prototype = Object.create(this.prototype);
        cls.axiomMap_ = Object.create(this.axiomMap_);
        cls.private_  = { axiomCache: {} };

        return cls;
      };

      return this;
    },

    /**
      Install Axioms into the class and prototype.
      Invalidate the axiom-cache, used by getAxiomsByName().

      FUTURE: Wait for first object to be created before creating prototype.
      Currently it installs axioms into the protoype immediately, but in should
      wait until the first object is created. This will provide
      better startup performance.
    */
    function installAxioms(axs) {
      this.private_.axiomCache = {};

      // We install in two passes to avoid ordering issues from Axioms which
      // need to access other axioms, like ids: and exports:.

      for ( var i = 0 ; i < axs.length ; i++ ) {
        var a = axs[i];

        // Store the destination class in the Axiom. Used by describe().
        // Store source class on a clone of 'a' so that the Axiom can be
        // reused without corrupting the sourceCls_.
        a.sourceCls_ = this;

        this.axiomMap_[a.name] = a;
      }

      for ( var i = 0 ; i < axs.length ; i++ ) {
        var a = axs[i];

        a.installInClass && a.installInClass(this);
        a.installInProto && a.installInProto(this.prototype);

        if ( a.name ) {
          this.pubsub_ && this.pubsub_.pub('installAxiom', a.name, a);
        }
      }
    },

    function installAxiom(a) {
      this.installAxioms([a]);
    },

    function installConstant(key, value) {
      var cName = foam.String.constantize(key);
      var prev  = this[cName];

      // Detect constant name collisions
      if ( prev && prev.name !== key ) {
        throw 'Class constant conflict: ' +
          this.id + '.' + cName + ' from: ' + key + ' and ' + prev.name;
      }

      this.prototype[cName] = this[cName] = value;
    },

    /**
      Determine if an object is an instance of this class
      or one of its sub-classes.
    */
    function isInstance(o) {
      return !! ( o && o.cls_ && this.isSubClass(o.cls_) );
    },

    /**
      Determine if a class is either this class, a sub-class, or
      if it implements this class (directly or indirectly).
    */
    function isSubClass(c) {
      if ( ! c || ! c.id ) return false;

      // Optimize most common case and avoid creating cache
      if ( this === foam.core.FObject ) return true;

      var cache = this.private_.isSubClassCache ||
        ( this.private_.isSubClassCache = {} );

      if ( cache[c.id] === undefined ) {
        cache[c.id] = ( c === this.prototype.cls_ ) ||
          ( c.getAxiomByName && !! c.getAxiomByName('implements_' + this.id) ) ||
          this.isSubClass(c.__proto__);
      }

      return cache[c.id];
    },

    /** Find an axiom by the specified name from either this class or an ancestor. */
    function getAxiomByName(name) {
      return this.axiomMap_[name];
    },

    /** Find an axiom by the specified name from an ancestor. */
    function getSuperAxiomByName(name) {
      return this.axiomMap_.__proto__[name];
    },

    /**
      Returns all axioms defined on this class or its parent classes
      that are instances of the specified class.
    */
    function getAxiomsByClass(cls) {
      // FUTURE: Add efficient support for:
      //    .where() .orderBy() .groupBy()
      var as = this.private_.axiomCache[cls.id];
      if ( ! as ) {
        as = [];
        for ( var key in this.axiomMap_ ) {
          var a = this.axiomMap_[key];
          if ( cls.isInstance(a) ) as.push(a);
        }
        this.private_.axiomCache[cls.id] = as;
      }

      return as;
    },

    /**
      Returns all axioms defined on this class
      that are instances of the specified class.
    */
    function getOwnAxiomsByClass(cls) {
      return this.getAxiomsByClass(cls).filter(function(a) {
        return this.hasOwnAxiom(a.name);
      }.bind(this));
    },

    /**
      Return true if an axiom named "name" is defined on this class
      directly, regardless of what parent classes define.
    */
    function hasOwnAxiom(name) {
      return Object.hasOwnProperty.call(this.axiomMap_, name);
    },

    /** Returns all axioms defined on this class. */
    function getOwnAxioms() {
      return this.getAxioms().filter(function(a) {
        return this.hasOwnAxiom(a.name);
      }.bind(this));
    },

    /** Returns all axioms defined on this class or its parent classes. */
    function getAxioms() {
      // The full axiom list is stored in the regular cache with '' as a key.
      var as = this.private_.axiomCache[''];
      if ( ! as ) {
        as = [];
        for ( var key in this.axiomMap_ ) as.push(this.axiomMap_[key]);
        this.private_.axiomCache[''] = as;
      }
      return as;
    },

    // NOP, is replaced if debug.js is loaded
    function validate() { },

    function toString() { return this.name + 'Class'; },

    /**
      Temporary Bootstrap Implementation

      This is a temporary version of installModel.
      When the bootstrap is finished, it will be replaced by a
      version that only knows how to install axioms.

      It is easier to start with hard-coded method and property
      support because Axioms need methods to install themselves
      and Property Axioms themselves have properties.

      However, once we've bootstrapped proper Property and Method
      Axioms, we can remove this support and just install Axioms.
    */
    function installModel(m) {
      if ( m.methods ) {
        for ( var i = 0 ; i < m.methods.length ; i++ ) {
          var a = m.methods[i];
          if ( typeof a === 'function' ) {
            m.methods[i] = a = { name: a.name, code: a };
          }

          if ( foam.core.Method ) {
            console.assert(a.cls_ !== foam.core.Method,
              'Method', a.name, 'on', m.name,
              'has already been upgraded to a Method');

            a = foam.core.Method.create(a);
            this.installAxiom(a);
          } else {
            this.prototype[a.name] = a.code;
          }
        }
      }

      /*
        Properties can be defined using three formats:
        1. Short-form String: Ex.: 'firstName' or 'sex'
        2. Medium-form Array: Ex.: [ 'firstName', 'John' ] or [ 'sex', 'Male' ]
           The first element of the array is the name and the second is the
           default value.
        3. Long-form JSON: Ex.: [ name: 'firstName', value: 'John' ] or
           { class: 'String', name: 'sex', value: 'Male' }
           The long-form supports many options, but only 'name' is mandatory.
       */
      if ( foam.core.Property && m.properties ) {
        for ( var i = 0 ; i < m.properties.length ; i++ ) {
          var a = m.properties[i];

          if ( Array.isArray(a) ) {
            m.properties[i] = a = { name: a[0], value: a[1] };
          } else if ( typeof a === 'string' ) {
            m.properties[i] = a = { name: a };
          }

          var type = foam.lookup(a.class, true) || foam.core.Property;
          console.assert(
              type !== a.cls_,
              'Property', a.name, 'on', m.name,
              'has already been upgraded to a Property.');

          a = type.create(a);

          this.installAxiom(a);
        }
      }
    }
  ]
});


// TODO: Methods defined here, like copyFrom() and toString() don't appear
// in describe() because they aren't added as method axioms, but as bootstrap
// methods instead. Fix.

/** The implicit base model for the model heirarchy. If you do not
 *  explicitly extend another model, FObject is used. Most models will
 *  extend FObject and inherit its methods.
 */
foam.CLASS({
  package: 'foam.core',
  name: 'FObject',

  documentation: 'Base model for model hierarchy.',

  // Effectively imports the following methods, but imports: isn't available
  // yet, so we add with 'methods:'.
  //
  // imports: [ 'assert', 'error', 'log', 'warn' ],

  methods: [
    /**
      This is a temporary version of initArgs.
      When the bootstrap is finished, it will be replaced by a version
      that knows about a classes Properties, so it can do a better job.
     */
    function initArgs(args) {
      if ( ! args ) return;

      for ( var key in args ) this[key] = args[key];
    },

    function init() {
      /* Template method to do on creation initialization */
    },

    function hasOwnProperty(name) {
      return this.instance_[name] !== undefined;
    },

    function hasDefaultValue(name) {
      if ( ! this.hasOwnProperty(name) ) return true;

      var axiom = this.cls_.getAxiomByName(obj);
      return axiom.isDefaultValue(this[name]);
    },

    /**
      Undefine a Property's value.
      The value will revert to either the Property's 'value' or
      'expression' value, if they're defined or undefined if they aren't.
      A propertyChange event will be fired, even if the value doesn't change.
    */
    function clearProperty(name) {
      if ( this.hasOwnProperty(name) ) {
        var oldValue = this[name];
        this.instance_[name] = undefined

        // Avoid creating slot and publishing event if no listeners
        if ( this.hasListeners('propertyChange', name) ) {
          this.pub('propertyChange', name, this.slot(name));
        }
      }
    },

    /**
      Private support is used to store per-object values that are not
      instance variables.  Things like listeners and topics.
    */
    function setPrivate_(name, value) {
      var p = this.private_;
      if ( ! p ) p = this.private_ = {};
      p[name] = value;
      return value;
    },

    function getPrivate_(name) {
      return this.private_ && this.private_[name];
    },

    function hasOwnPrivate_(name) {
      return this.private_ && typeof this.private_[name] !== 'undefined';
    },

    function clearPrivate_(name) {
      this.private_[name] = undefined;
    },

    function pubPropertyChange_() {
      // NOP - to be added later
    },

    function validate() {
      var as = this.cls_.getAxioms();
      for ( var i = 0 ; i < as.length ; i++ ) {
        var a = as[i];
//        a.validate && a.validate();
        a.validateInstance && a.validateInstance(this);
      }
    },


    /************************************************
     * Console
     ************************************************/

    // Imports aren't implemented yet, so mimic:
    //   imports: [ 'lookup', 'assert', 'error', 'log', 'warn' ],

    function lookup() { return this.__context__.lookup.apply(this.__context__, arguments); },

    function assert(f) { if ( ! f ) (this.__context__ || foam.__context__).assert.apply(null, arguments); },

    function error() { this.__context__.error.apply(null, arguments); },

    function log() { this.__context__.log.apply(null, arguments); },

    function warn() { this.__context__.warn.apply(null, arguments); },


    /************************************************
     * Publish and Subscribe
     ************************************************/

    /**
      This structure represents the head of a doubly-linked-list/tree of
      listeners. It contains 'next', a pointer to the first listener,
      and 'children', a map of sub-topic chains.

      Nodes in the list contain 'next' and 'prev' links, which lets
      removing subscriptions be done quickly by connecting next to prev
      and prev to next.

      Note that both the head structure and the nodes themselves have a
      'next' property. This simplifies the code because there is no
      special case for handling when the list is empty.

      Listener Tree-List Structure
      ----------------------------
      next -> {
        prev: <-,
        sub: { src: <source object>, destroy: <destructor function> },
        l: <listener>,
        next: -> <same structure>,
        children -> {
          subTopic1: <same structure>,
          ...
          subTopicn: <same structure>
        }
      }
    */
    function createListenerList_() {
      return { next: null };
    },

    /** Return the top-level listener list, creating if necessary. */
    function listeners_() {
      return this.getPrivate_('listeners') ||
        this.setPrivate_('listeners', this.createListenerList_());
    },

    /**
      Notify all of the listeners in a listener list.
      Pass 'a' arguments to listeners.
      Returns the number of listeners notified.
    */
    function notify_(listeners, a) {
      var count = 0;
      while ( listeners ) {
        var l = listeners.l;
        var s = listeners.sub;

        // Update 'listeners' before notifying because the listener
        // may set next to null.
        listeners = listeners.next;

        // Like l.apply(l, [s].concat(Array.from(a))), but faster.
        // FUTURE: add benchmark to justify
        // ???: optional exception trapping, benchmark
        try {
          switch ( a.length ) {
            case 0: l(s); break;
            case 1: l(s, a[0]); break;
            case 2: l(s, a[0], a[1]); break;
            case 3: l(s, a[0], a[1], a[2]); break;
            case 4: l(s, a[0], a[1], a[2], a[3]); break;
            case 5: l(s, a[0], a[1], a[2], a[3], a[4]); break;
            case 6: l(s, a[0], a[1], a[2], a[3], a[4], a[5]); break;
            case 7: l(s, a[0], a[1], a[2], a[3], a[4], a[5], a[6]); break;
            case 8: l(s, a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7]); break;
            case 9: l(s, a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]); break;
            default: l.apply(l, [s].concat(Array.from(a)));
          }
        } catch (x) {}
        count++;
      }
      return count;
    },

    function hasListeners(/* args */) {
      /** Return true iff there are listeners for the supplied message. **/
      var listeners = this.getPrivate_('listeners');

      for ( var i = 0 ; listeners ; i++ ) {
        if ( listeners.next        ) return true;
        if ( i == arguments.length ) return false;
        listeners = listeners.children && listeners.children[arguments[i]];
      }

      return false;
    },

    /**
      Publish a message to all matching sub()'ed listeners.

      All sub()'ed listeners whose specified pattern match the
      pub()'ed arguments will be notified.
      Ex.
<pre>
  var obj  = foam.core.FObject.create();
  var sub1 = obj.sub(               function(a,b,c) { console.log(a,b,c); });
  var sub2 = obj.sub('alarm',       function(a,b,c) { console.log(a,b,c); });
  var sub3 = obj.sub('alarm', 'on', function(a,b,c) { console.log(a,b,c); });

  obj.pub('alarm', 'on');  // notifies sub1, sub2 and sub3
  obj.pub('alarm', 'off'); // notifies sub1 and sub2
  obj.pub();               // only notifies sub1
  obj.pub('foobar');       // only notifies sub1
</pre>

      Note how FObjects can be used as generic pub/subs.

      Returns the number of listeners notified.
    */
    function pub(a1, a2, a3, a4, a5, a6, a7, a8, a9) {
      // This method prevents this function not being JIT-ed because
      // of the use of 'arguments'. Doesn't generate any garbage ([]'s
      // don't appear to be garbage in V8).
      // FUTURE: benchmark
      switch ( arguments.length ) {
        case 0:  return this.pub_([]);
        case 1:  return this.pub_([a1]);
        case 2:  return this.pub_([a1, a2]);
        case 3:  return this.pub_([a1, a2, a3]);
        case 4:  return this.pub_([a1, a2, a3, a4]);
        case 5:  return this.pub_([a1, a2, a3, a4, a5]);
        case 6:  return this.pub_([a1, a2, a3, a4, a5, a6]);
        case 7:  return this.pub_([a1, a2, a3, a4, a5, a6, a7]);
        case 8:  return this.pub_([a1, a2, a3, a4, a5, a6, a7, a8]);
        case 9:  return this.pub_([a1, a2, a3, a4, a5, a6, a7, a8, a9]);
        default: return this.pub_(arguments);
      }
    },

    function pub_(args) {
      /** Internal publish method, called by pub(). */

      // No listeners, so return.
      if ( ! this.hasOwnPrivate_('listeners') ) return 0;

      var listeners = this.listeners_();

      // Notify all global listeners.
      var count = this.notify_(listeners.next, args);

      // Walk the arguments, notifying more specific listeners.
      for ( var i = 0 ; i < args.length; i++ ) {
        var listeners = listeners.children && listeners.children[args[i]];
        if ( ! listeners ) break;
        count += this.notify_(listeners.next, args);
      }

      return count;
    },

    /**
      Subscribe to pub()'ed events.
      args - zero or more values which specify the pattern of pub()'ed
             events to match.
      <p>For example:
<pre>
   sub('propertyChange', l) will match:
   pub('propertyChange', 'age', 18, 19), but not:
   pub('stateChange', 'active');
</pre>
      <p>sub(l) will match all events.
      l - the listener to call with notifications.
       <p> The first argument supplied to the listener is the "subscription",
        which contains the "src" of the event and a destroy() method for
        cancelling the subscription.
      <p>Returns a "subscrition" which can be cancelled by calling
        its .destroy() method.
    */
    function sub() { /* args..., l */
      var l = arguments[arguments.length-1];

      this.assert(typeof l === 'function', 'Listener must be a function');

      var listeners = this.listeners_();

      for ( var i = 0 ; i < arguments.length-1 ; i++ ) {
        var children = listeners.children || ( listeners.children = {} );
        listeners = children[arguments[i]] ||
            ( children[arguments[i]] = this.createListenerList_() );
      }

      var node = {
        sub:  { src: this },
        next: listeners.next,
        prev: listeners,
        l:    l
      };
      node.sub.destroy = function() {
        if ( node.next ) node.next.prev = node.prev;
        if ( node.prev ) node.prev.next = node.next;

        // Disconnect so that calling destroy more than once is harmless
        node.next = node.prev = null;
      };

      if ( listeners.next ) listeners.next.prev = node;
      listeners.next = node;

      return node.sub;
    },

    /** Publish to this.propertyChange topic if oldValue and newValue are different. */
    function pubPropertyChange_(prop, oldValue, newValue) {
      if ( Object.is(oldValue, newValue) ) return;
      if ( ! this.hasListeners('propertyChange', prop.name) ) return;

      var slot = prop.toSlot(this);
      slot.setPrev(oldValue);
      this.pub('propertyChange', prop.name, slot);
    },

    /**
      Creates a Slot for an Axiom.
    */
    function slot(obj) {
      if ( typeof obj === 'function' ) {
        return foam.core.ExpressionSlot.create(
          arguments.length == 1 ?
            { code: obj, obj: this } :
            { code: obj, obj: this, args: Array.prototype.slice.call(arguments, 1) }
        );
      }

      var axiom = this.cls_.getAxiomByName(obj);

      this.assert(axiom, 'Unknown axiom:', obj);
      this.assert(axiom.toSlot, 'Called slot() on unslotable axiom:', obj);

      return axiom.toSlot(this);
    },


    /************************************************
     * Destruction
     ************************************************/

    function isDestroyed() {
      /* Returns true iff destroy() has been called on this object. */
      return ! this.instance_;
    },

    function onDestroy(d) {
      /*
        Register a function or a destroyable to be called
        when this object is destroyed.
      */
      if ( d ) this.sub('destroy', d.destroy ? d.destroy.bind(d) : d);
      return d;
    },

    function destroy() {
      /*
        Destroy this object.
        Free any referenced objects and destroy any registered destroyables.
        This object is completely unusable after being destroyed.
       */
      if ( this.isDestroyed() || this.instance_.destroying_ ) return;

      // Record that we're currently destroying this object,
      // to prevent infitine recursion.
      this.instance_.destroying_ = true;
      this.pub('destroy');
      this.instance_ = this.private_ = null;
    },


    /************************************************
     * Utility Methods: clone, equals, hashCode, etc.
     ************************************************/

    function equals(other) { return this.compareTo(other) === 0; },

    function compareTo(other) {
      if ( other === this ) return 0;
      if ( ! other        ) return 1;

      if ( this.model_ !== other.model_ ) {
        return other.model_ ?
          foam.util.compare(this.model_.id, other.model_.id) :
          1;
      }

      // FUTURE: check 'id' first
      // FUTURE: order properties
      var ps = this.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < ps.length ; i++ ) {
        var r = ps[i].compare(this, other);
        if ( r ) return r;
      }

      return 0;
    },

    /**
     * Compare this object to another object of the same type, and produce a raw
     * javascript object which shows the differences between the two.
     * Example
     * <pre>
     * var obj1 = Abc.create({ a: 1, b: ['A', 'B', 'C'] });
     * var obj2 = Abc.create({ a: 2, b: ['A', 'D'] });
     * var diff = obj1.diff(obj2);
     * </pre>
     * The diff object will look like
     * <pre>
     * { a: 2, b: { added: ['D'], removed: ['B', 'C'] } };
     * </pre>
     */
    function diff(other) {
      var diff = {};

      this.assert(other, 'Attempt to diff against null.');
      this.assert(other.cls_ === this.cls_, 'Attempt to diff objects with different classes.', this, other);

      var ps = this.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0, property ; property = ps[i] ; i++ ) {
        var value    = property.f(this);
        var otherVal = property.f(other);

        // FUTURE: add nested Object support
        // FUTURE: add patch() method?
        if ( Array.isArray(value) ) {
          var subdiff = foam.Array.diff(value, otherVal);
          if ( subdiff.added.length !== 0 || subdiff.removed.length !== 0 ) {
            diff[property.name] = subdiff;
          }
        } else if ( ! foam.util.equals(value, otherVal) ) {
          // if the primary value is undefined, use the compareTo of the other
          diff[property.name] = otherVal;
        }
      }

      return diff;
    },

    /**
      Create an integer hash code value based on all properties of this object.
    */
    function hashCode() {
      var hash = 17;

      var ps = this.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < ps.length ; i++ ) {
        var prop = this[ps[i].name];
        hash = ((hash << 5) - hash) + foam.util.hashCode(prop);
        hash &= hash; // forces 'hash' back to a 32-bit int
      }

      return hash;
    },

    /** Create a deep copy of this object. **/
    function clone(opt_X) {
      var m = {};
      for ( var key in this.instance_ ) {
        var value = this[key];
        this.cls_.getAxiomByName(key).cloneProperty(value, m);
      }
      return this.cls_.create(m, opt_X || this.__context__);
    },

    /**
      Copy property values from the supplied object or map.

      Ex.
<pre>
  person.copyFrom({fName: 'John', lName: 'Smith', age: 42})
  or
  person.copyFrom(otherPerson);
</pre>
     The first example is short-form for:
<pre>
  person.fName = 'John';
  person.lName = 'Smith';
  person.age   = 42;
</pre>
     If an FObject is supplied, it doesn't need to be the same class as 'this'.
     Only properties that the two classes have in common will be copied.
     */
    function copyFrom(o, opt_warn) {
      // When copying from a plain map, just enumerate the keys
      if ( o.__proto__ === Object.prototype || ! o.__proto__ ) {
        for ( var key in o ) {
          var name = key.endsWith('$') ?
              key.substring(0, key.length - 1) :
              key ;

          var a = this.cls_.getAxiomByName(name);
          if ( a && foam.core.Property.isInstance(a) ) {
            this[key] = o[key];
          } else if ( opt_warn ) {
            this.unknownArg(key, o[key]);
          }
        }
        return this;
      }

      // When copying from an object of the same class
      // We don't copy default values or the values of expressions
      // so that the unset state of those properties is preserved
      var props = this.cls_.getAxiomsByClass(foam.core.Property);

      if ( o.cls_ && ( o.cls_ === this.cls_ || o.cls_.isSubClass(this.cls_) ) ) {
        for ( var i = 0 ; i < props.length ; i++ ) {
          var name = props[i].name;

          // Only copy values that are set or have a factory.
          // Any default values or expressions will be the same
          // for each object since they are of the exact same
          // type.
          if ( o.hasOwnProperty(name) || props[i].factory ) {
            this[name] = o[name];
          }
        }
        return this;
      }

      // If the source is an FObject, copy any properties
      // that we have in common.
      if ( foam.core.FObject.isInstance(o) ) {
        for ( var i = 0 ; i < props.length ; i++ ) {
          var name = props[i].name;
          var otherProp = o.cls_.getAxiomByName(name);
          if ( otherProp && foam.core.Property.isInstance(otherProp) ) {
            this[name] = o[name];
          }
        }
        return this;
      }

      // If the source is some unknown object, we do our best
      // to copy any values that are not undefined.
      for ( var i = 0 ; i < props.length ; i++ ) {
        var name = props[i].name;
        if ( typeof o[name] !== 'undefined' ) {
          this[name] = o[name];
        }
      }
      return this;
    },

    function toString() {
      // Distinguish between prototypes and instances.
      return this.cls_.id + (
          this.cls_.prototype === this ? 'Proto'      :
          this.isDestroyed()           ? ':DESTROYED' :
          '');
    }
  ]
});
