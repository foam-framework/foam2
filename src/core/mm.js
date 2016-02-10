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
 FOAM Bootstrap

 FOAM uses Models to specify class definitions.
 The FOAM Model class is itself specified with a FOAM model, meaning
 that Model is defined in the same language which it defines.
 This self-modeling system requires some care to bootstrap, but results
 in a very compact, uniform, and powerful system. 
 
            Abstract Class
                  ^
                  |
 FObject -> FObject Class                     Prototype
    ^                        +-.prototype---------^
    |                        |                    |
  Model  -> getClass()  -> Class -> create() -> instance
  
  FObject is the root model/class of all other classes, including Model.
  Abstract Class is the prototype of FObject's Class, which makes it the root of all Classes.
  From a Model we call getClass() to create a Class (or the previously created Class) object.
  From the Class we call create() to create new instances of that class.
  New instances extend the classes prototype object, which is store on the class as .prototype.

  instance ---> .cls_   -> Object's Class
       |
       +------> .model_ -> Object's Model
 
  All descendents of FObject haver references to both their Model and Class.
    - obj.cls_ refers to an Object's Class
    - obj.model_ refers to an Object's Model

  Classes also refer to their Model with .model_.

  Model is its own definition:
    Model.getClass().create(Model) == Model
    Model.model_ === Model

  Models are defined as a collection of Axioms.
  It is the responsibility of Axioms to isntall itself onto a Model's Class and/or Prototype.

  Axioms are defined with the following psedo-interface:

    public interface Axiom {
      optional installInClass(class)
      optional installInProto(proto)
    }

  Ex. of a Model with one Axiom:
 
  foam.CLASS({
    name: 'Sample',

    axioms: [
      {
        name: 'axiom1',
        installInClass: function(cls) { ... },
        installInProto: function(proto) { ... }
      }
    ]
  });

  Axioms can be added either during the initial creation of a class and prototype,
  or anytime after.  This allows classes to be extended with new functionality,
  and this is very important to the bootstrap process because it allows us to
  start out with very simple definitions of Model and FObject, and then build
  them up until they're fully bootstrapped.

  However, raw axioms are rarely used directly. Instead we model higher-level
  axiom types, including:

  Traits     - Implement multiple inheritance  
  Constants  - Add constants to the prototype and class
  Topics     - Publish/subscribe topics
  Properties - High-level instance variable definitions
  Methods    - Prototype methods
  Listeners  - Like methods, but with extra features for use as callbacks 
*/

foam.LIB({
  package: 'foam.core',
  name: 'AbstractClass',

  documentation: "Root prototype for all classes.",

  constants: {
    prototype: Object.prototype,
    axiomMap_: null,
  },

  methods: [
    function create(/*args*/) {
      /*
        Create a new instance of this class.
        Configured from values taken from 'args', if supplifed.
      */
      var obj = Object.create(this.prototype);
      obj.instance_ = Object.create(null);
      
      obj.initArgs.apply(obj, arguments);
      
      return obj;
    },

    function installModel(m) {
      /*
        This is a temporary version of installModel.
        When the bootstrap is finished, it will be replaced by a version
        that only knows how to install axioms.
      */
      if ( m.axioms )
        for ( var i = 0 ; i < m.axioms.length ; i++ )
          this.installAxiom(m.axioms[i]);
      
      if ( m.methods )
        for ( var i = 0 ; i < m.methods.length ; i++ ) {
          var a = m.methods[i];
          if ( typeof a === 'function' )
            m.methods[i] = a = { name: a.name, code: a };
          this.prototype[a.name] = a.code;
        }
      
      if ( global.Property && m.properties )
        for ( var i = 0 ; i < m.properties.length ; i++ ) {
          var a = m.properties[i];
          if ( typeof a === 'string' ) m.properties[i] = a = { name: a };
          var type = global[(a.type || '') + 'Property'] || Property;
          this.installAxiom(type.create(a));
        }
    },

    function installAxiom(a) {
      /*
        Install an Axiom into the class and prototype.
        Invalidate the axiom-cache, used by getAxiomsByName().
        -
        Installs axioms into the protoype immediately, but in the future
        we will wait until the first object is created. This will provide
        better startup performance.
      */
      this.axiomMap_[a.name] = a;
      this.axiomCache_ = {};
      
      // Store the destination class in the Axiom.  Used by describe().
      a.sourceCls_ = this;
      
      a.installInClass && a.installInClass(this);
      a.installInProto && a.installInProto(this.prototype);
    },

    function isInstance(o) {
      /*
        Determine if an object is an instance of this class
        or one of its sub-classes.
      */
      return o.cls_ && this.isSubClass(o.cls_);
    },

    function isSubClass(c) {
      /* Determine if a class is either this class or a sub-class. */
      // TODO: switch from 'name' to 'id' when available
      if ( ! c ) return false;
      
      var subClasses_ = this.hasOwnProperty('subClasses_') ?
        this.subClasses_ :
        this.subClasses_ = {} ;
      
      if ( ! subClasses_.hasOwnProperty(c.name) )
        subClasses_[c.name] = ( c === this ) || this.isSubClass(c.__proto__);
      
      return subClasses_[c.name];
    },

    function getAxiomByName(name) {
      /* Find an axiom by the specified name from either this class or an ancestor. */
      return this.axiomMap_[name];
    },

    // The Following method will eventually change.
    // Would like to have efficient support for:
    //    .where() .orderBy() groupBy
    function getAxiomsByClass(cls) {
      /*
        Returns all axioms defined on this class or its parent classes
        that are instances of the specified class.
      */
      var as = this.axiomCache_[cls.name];
      if ( ! as ) {
        as = [];
        for ( var key in this.axiomMap_ ) {
          var a = this.axiomMap_[key];
          if ( cls.isInstance(a) )
            as.push(a);
        }
        this.axiomCache_[cls.name] = as;
      }
      
      return as;
    },

    function getAxioms() {
      /* Returns all axioms defined on this class or its parent classes. */
      // The full axiom list is stored in the regular cache with '' as a key.
      var as = this.axiomCache_[''];
      if ( ! as ) {
        as = [];
        for ( var key in this.axiomMap_ )
          as.push(this.axiomMap_[key]);
        this.axiomCache_[''] = as;
      }
      return as;
    },

    function toString() { return this.name + 'Class'; }
  ]
});


foam.LIB({
  name: 'boot',

  documentation: 'Bootstrap support, discarded after use.',

  /*
    Collection of classes to be repaired/upgraded later.
    This is needed because they're built before the full
    class/model infrastructure is finished, so they're lacking
    features.
  */
  constants: { classes: [] },

  methods: [
    function start() {
      /* Start the bootstrap process. */
      foam.CLASS = this.CLASS.bind(this);
    },

    function getClass() {
      /*
        Create or Update a Prototype from a Model definition.
        (Model is 'this').
      */
      var cls = global[this.name];

      if ( ! cls ) {
        var parent = this.extends ? global[this.extends] : foam.AbstractClass ;
        // TODO: make some of these values non-innumerable
        cls                  = Object.create(parent);
        cls.prototype        = Object.create(parent.prototype);
        cls.prototype.cls_   = cls;
        cls.prototype.model_ = this;
        cls.prototype.ID__   = this.name + 'Prototype';
        cls.ID__             = this.name + 'Class';
        cls.axiomMap_        = Object.create(parent.axiomMap_);
        cls.axiomCache_      = {};
        cls.name             = this.name;
        cls.model_           = this;
        global[cls.name]     = cls;
      }
      
      cls.installModel(this);
      
      return cls;
    },

    function CLASS(m) {
      /*
        Bootstrap Model definition which records incomplete models
        so they can be patched at the end of the bootstrap process.
      */
      this.classes.push(this.getClass.call(m));
    },

    function phase2() {
      /* Start second phase of bootstrap process. */

      // Upgrade to final CLASS() definition.
      foam.CLASS = function(m) { return Model.create(m).getClass(); };
      
      // Upgrade existing classes to real classes.
      for ( var i = 0 ; i < this.classes.length ; i++ )
        foam.CLASS(this.classes[i].model_);
    },

    function end() {
      /* Finish the bootstrap process, deleting foam.boot when done. */

      // Substitute AbstractClass.installModel() with simpler axiom-only version.
      foam.AbstractClass.installModel = function installModel(m) {
        for ( var i = 0 ; i < m.axioms.length ; i++ )
          this.installAxiom(m.axioms[i]);
      };
      
      delete foam['boot'];
    }
  ]
});


foam.boot.start();

foam.CLASS({
  name: 'FObject',

  documentation: 'Base model for model hierarchy.',

  methods: [
    function initArgs(args) {
      /*
        This is a temporary version of initArgs.
        When the bootstrap is finished, it will be replaced by a version
        that knows about a classes Properties, so it can do a better job.
       */
      if ( ! args ) return;

      for ( var key in args )
        if ( key.indexOf('_') == -1 )
          this[key] = args[key];

        Object.assign(this, args.instance_);
    },

    function hasOwnProperty(name) {
      return Object.hasOwnProperty.call(this.instance_, name);
    },

    // Private support is used to store per-object values that are not
    // instance variables.  Things like listeners and topics.
    function setPrivate_(name, value) {
      if ( ! this.private_ ) {
        Object.defineProperty(this, 'private_', {
          value: {},
          ennumerable: false
        });
      }
      this.private_[name] = value;
      return value;
    },

    function getPrivate_(name) {
      return this.private_ && this.private_[name];
    },

    function hasOwnPrivate_(name) {
      return this.private_ && this.private_.hasOwnProperty(name);
    },

    function publishPropertyChange() {
      // NOP - to be added later
    }
  ]
});


foam.CLASS({
  name: 'Model',
  extends: 'FObject', // Isn't the default yet.

  documentation: 'Class/Prototype description.',

  properties: [
    'name',
    {
      name: 'extends',
      defaultValue: 'FObject'
    },
    {
      name: 'axioms',
      factory: function() { return []; }
    },
    {
      type: 'Array',
      subType: 'Property',
      name: 'properties',
      adaptArrayElement: function(o) {
        return typeof o === 'string'     ?
          Property.create({name: o})     :
          global[this.subType].create(o) ;
      }
    },
    {
      type: 'Array',
      subType: 'Method',
      name: 'methods',
      adaptArrayElement: function(e) {
        if ( typeof e === 'function' ) {
          console.assert(e.name, 'Method must be named');
          return Method.create({name: e.name, code: e});
        }
        return e;
      }
    }
  ],

  methods: [ foam.boot.getClass ]
});


foam.CLASS({
  name: 'Property',
  extends: 'FObject',

  properties: [
    'name', 'type', 'defaultValue', 'factory', 'adapt', 'preSet', 'postSet', 'expression',
    {
      // Compare two values taken from this property.
      // Used by Property.compare().
      // Is a property rather than a method so that it can be configured
      // without subclassing.
      name: 'comparePropertyValues',
      defaultValue: function(o1, o2) {
        if ( o1 === o2 ) return 0;
        if ( ! o1 && ! o2 ) return 0;
        if ( ! o1 ) return -1;
        if ( ! o2 ) return  1;
        if ( o1.localeCompare ) return o1.localeCompare(o2);
        if ( o1.compareTo ) return o1.compareTo(o2);
        return o1.$UID.compareTo(o2.$UID);
      }
    }
  ],

  methods: [
    function installInClass(c) {
      /*
        Handle overriding of Property definition from parent class by
        copying undefined values from parent Property, if it exists.
      */
      var superProp = c.__proto__.getAxiomByName(this.name);
      if ( superProp ) {
        var a = this.cls_.getAxiomsByClass(Property);
        for ( var i = 0 ; i < a.length ; i++ ) {
          var name = a[i].name;
          if ( typeof superProp[name] !== 'undefined' && ! this.hasOwnProperty(name) )
            this[name] = superProp[name];
        }
      }
      c[foam.string.constantize(this.name)] = this;
    },

    function installInProto(proto) {
      /*
        Install a property onto a prototype from a Property definition.
        (Property is 'this').
      */
      var prop            = this;
      var name            = this.name;
      var adapt           = this.adapt
      var preSet          = this.preSet;
      var postSet         = this.postSet;
      var factory         = this.factory;
      var hasDefaultValue = this.hasOwnProperty('defaultValue');
      var defaultValue    = this.defaultValue;
      var slotName        = name + '$';

      Object.defineProperty(proto, slotName, {
        get: function propSlotGetter() {
          return this.slot(name, slotName, prop);
        },
        set: function propSlotSetter(slot) {
          this.slot(name, slotName, prop).link(slot);
        },
        configurable: true
      });

      // TODO: implement 'expression'

      Object.defineProperty(proto, name, {
        get: prop.getter || function propGetter() {
          if ( ( hasDefaultValue || factory ) &&
               ! this.hasOwnProperty(name) )
          {
            if ( hasDefaultValue ) return defaultValue;

            var value = factory.call(this);
            this.instance_[name] = value;
            return value;
          }

          return this.instance_[name];
        },
        set: prop.setter || function propSetter(newValue) {
          // Get old value but avoid triggering factory if present
          var oldValue = factory ?
            ( this.hasOwnProperty(name) ? this[name] : undefined ) :
            this[name] ;

          if ( adapt )  newValue = adapt.call(this, oldValue, newValue, prop);

          if ( preSet ) newValue = preSet.call(this, oldValue, newValue, prop);

          this.instance_[name] = newValue;

          this.publishPropertyChange(name, oldValue, newValue);

          // TODO: publish to a global topic to support dynamic()

          if ( postSet ) postSet.call(this, oldValue, newValue, prop);
        },
        configurable: true
      });
    },

    function get(o) {
      /* Flyweight getter for this Property. */
      return o[this.name];
    },

    function set(o, value) {
      /* Flyweight setter for this Property. */
      o[this.name] = value;
      return this;
    },
    
    function f(o) {
      /* Makes this Property an adapter, suitable for use with mLangs. */
      return o[this.name];
    },

    function compare(o1, o2) {
      /* Makes this Property a comparator, suitable for use with mLangs. */
      return this.comparePropertyValues(this.f(o1), this.f(o2));
    }
  ]
});


/*
  Method
  Methods are only installed on the prototype.
  If the method is overriding a method from a parent
  class, then SUPER support is added.

  Ex.
  foam.CLASS({
    name: 'Parent',
    methods: [
      // short-form
      function sayHello() { console.log('hello'); },
     
      // long-form
      {
        name: 'sayGoodbye',
        code: function() { console.log('goodbye');
      }
    ]
  });

  // Create a subclass of Parent and override the 'sayHello' method.
  // The parent classes 'sayHello' methold is called with 'this.SUPER()' 
  foam.CLASS({
    name: 'Child',
    extends: 'Parent',
    methods: [
      function sayHello() { this.SUPER(); console.log('world'); }
    ]
  });

  Child.create().sayHello();
  >> hello
  >> world
*/
foam.CLASS({
  name: 'Method',
  extends: 'FObject',

  properties: [ 'name', 'code' ],

  methods: [
    function override_(proto, method) {
      /*
        Decorate a method so that it can call the
        method it overrides with this.SUPER().
      */
      var super_ = proto[this.name];

      // Not overriding, or not using SUPER, so just return original method
      if ( ! super_ || method.toString().indexOf('SUPER') == -1 ) return method;

      var SUPER = function() { return super_.apply(this, arguments); };

      // This code isn't JIT'ed in V8 because of the try/finally,
      // so we move it outside of 'f' below so that the rest of
      // that function is JIT'ed.
      var slowF = function(OLD_SUPER, args) {
        try {
          return method.apply(this, args);
        } finally {
          this.SUPER = OLD_SUPER;
        }
      };

      var f = function() {
        var OLD_SUPER = this.SUPER;
        this.SUPER = SUPER;

        if ( OLD_SUPER ) return slowF.call(this, OLD_SUPER, arguments);

        // Fast-Path when it doesn't matter if we restore SUPER or not
        var ret = method.apply(this, arguments);
        this.SUPER = null;
        return ret;
      };

      foam.fn.setName(f, this.name);
      f.toString = function() { return method.toString(); };
      f.super_ = super_;

      return f;
    },
    function installInProto(proto) {
      proto[this.name] = this.override_(proto, this.code);
    }
  ]
});


foam.CLASS({
  name: 'StringProperty',
  extends: 'Property',

  documentation: 'StringProperties coerce their arguments into Strings.',

  properties: [
    {
      name: 'defaultValue',
      defaultValue: ''
    },
    {
      name: 'preSet',
      defaultValue: function(_, a) { return a ? a.toString() : ''; }
    }
  ]
});


foam.CLASS({
  name: 'ArrayProperty',
  extends: 'Property',

  documentation: "A Property which contains an array of 'subType' objects.",

  properties: [
    'subType',
    {
      name: 'factory',
      defaultValue: function() { return []; }
    },
    {
      name: 'adapt',
      defaultValue: function(_, a, prop) {
        if ( ! a ) return [];
        return a.map(prop.adaptArrayElement.bind(prop));
      }
    },
    {
      name: 'adaptArrayElement',
      defaultValue: function(o) {
        return global[this.subType].create(o);
      }
    }
  ]
});


foam.boot.phase2();


foam.CLASS({
  name: 'FObject',

  documentation: 'Add listener support to FObject.',

  methods: [
    function createListenerList_() {
      /*
        This structure represents the head of a doubly-linked list of
        listeners. It contains 'next', a pointer to the first listener,
        and 'children', an array of sub-topic chains.
        Nodes in the list contain 'next' and 'prev' links, which lets
        removing subscriptions be done quickly by connecting next to prev
        and prev to next.
      */
      return { next: null, children: [] };
    },

    function listeners_() {
      /* Return the top-level listener list, creating if necessary. */
      return this.getPrivate_('listeners') ||
        this.setPrivate_('listeners', this.createListenerList_());
    },

    function notify_(listeners, args) {
      /*
        Notify all of the listeners in a listener list.
        Returns the number of listeners notified.
      */
      var count = 0;
      while ( listeners ) {
        args[0] = listeners.sub;
        listeners.l.apply(null, args);
        listeners = listeners.next;
        count++;
      }
      return count;
    },

    function publish(/* args... */) {
      /*
        Publish a message to all matching subscribed listeners.
        Returns the number of listeners notified.
      */
      if ( ! this.hasOwnPrivate_('listeners') ) return 0;

      var listeners = this.listeners_();
      var args      = Array.prototype.concat.apply([null], arguments);
      var count     = this.notify_(listeners.next, args);
      for ( var i = 0 ; i < arguments.length; i++ ) {
        var listeners = listeners.children[arguments[i]];
        if ( ! listeners ) break;
        count += this.notify_(listeners.next, args);
      }

      return count;
    },

    function subscribe(/* args..., l */) {
      /*
        Subscribe to published events.
        args - zero or more values which specify the pattern of published
               events to match.
        For example:
          subscribe('propertyChange', l) will match:
          publish('propertyChange', 'age', 18, 19), but not:
          publish('stateChange', 'active');
        subscribe(l) will match all events.
        l - the listener to call with notifications.
          The first argument supplied to the listener is the "subscription",
          which contains the "src" of the event and a destroy() method for
          cancelling the subscription.
        Returns a "subscrition" which can be cancelled by calling
          its .destroy() method.
       */
      var l         = arguments[arguments.length-1];
      var listeners = this.listeners_();

      for ( var i = 0 ; i < arguments.length-1 ; i++ )
        listeners = listeners.children[arguments[i]] ||
        ( listeners.children[arguments[i]] = this.createListenerList_() );

      var node = {
        sub:  { src: this },
        next: listeners.next,
        prev: listeners,
        l: l
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

    function unsubscribe(/* args..., l */) {
      /* Unsubscribe a previously subscribed listener. */
      var l         = arguments[arguments.length-1];
      var listeners = this.getPrivate_('listeners');

      for ( var i = 0 ; i < arguments.length-1 && listeners ; i++ )
        listeners = listeners.children[arguments[i]];

      var node = listeners && listeners.next;
      while ( node ) {
        if ( node.l === l ) {
          node.sub.destroy();
          return;
        }
        node = node.next;
      }
    },

    function publishPropertyChange(name, oldValue, newValue) {
      /* Publish to this.propertyChange topic if oldValue and newValue are different. */
      if ( ! Object.is(oldValue, newValue) )
        this.publish('propertyChange', name, oldValue, newValue);
    },

    function slot(name, opt_slotName, opt_prop) {
      if ( ! opt_slotName ) opt_slotName = name + '$';
      var slot = this.getPrivate_(opt_slotName);
      if ( ! slot ) {
        slot = PropertySlot.create(this, opt_prop || this.cls_.getAxiomByName(name));
        this.setPrivate_(opt_slotName, slot);
      }
      return slot;
    }
  ]
});


foam.CLASS({
  name: 'AxiomArrayProperty',
  extends: 'ArrayProperty',

  documentation: 'An ArrayProperty whose elements are Axioms and are added to this.axioms.',

  properties: [
    {
      name: 'postSet',
      defaultValue: function(_, a) {
        (this.axioms || (this.axioms = [])).push.apply(this.axioms, a); }
    }
  ]
});


/*
  Constant
  Constants are installed on both the prototype and class.

  Ex.
  constants: {
    KEY: 'some value'
  }
  
  this.cls_.KEY === this.KEY === 'some value'
*/
foam.CLASS({
  name: 'Constant',

  documentation: 'Constant Axiom',

  properties: [ 'name', 'value' ],

  methods: [
    function installInClass(cls)   {
      cls[foam.string.constantize(this.name)] = this.value;
    },
    function installInProto(proto) {
      proto[foam.string.constantize(this.name)] = this.value;
    }
  ]
});


/*
  Trait
  Traits provide a safe form multiple-inheritance.

  Ex.
  foam.CLASS({
    name: 'SalaryTrait',
    properties: [ 'salary' ]
  });

  foam.CLASS({
    name: 'Employee',
    extends: 'Person',
    traits: [ 'SalaryTrait' ]
  });
  
  Employee extends Person through regular inheritance, but
  the axioms from SalaryTrait are also added to the class.
  Any number of traits can be specified.
*/
foam.CLASS({
  name: 'Trait',

  documentation: 'Trait Axiom',

  properties: [
    { name: 'name', getter: function() { return 'trait_' + this.path; } },
    'path'
  ],

  methods: [
    function installInClass(cls) { cls.installModel(global[this.path].model_); }
  ]
});


// TODO: doc
foam.CLASS({
  name: 'Slot',
  extends: null,

  methods: [
    function link(other) {
      /*
        Link two Slots together, setting both to other's value.
        Returns a Destroyable which can be used to break the link.
      */
      var sub1 = this.follow(other);
      var sub2 = other.follow(this);

      return {
        destroy: function() {
          sub1.destroy();
          sub2.destroy();
        }
      };
    },

    function follow(other) {
      /*
        Have this Slot dynamically follow other's value.
        Returns a Destroyable which can be used to cancel the binding.
      */
      return other.subscribe(function() {
        this.set(other.get());
      }.bind(this));
    }
  ]
});


// TODO: doc
foam.CLASS({
  name: 'PropertySlot',
  extends: 'Slot',
  
  methods: [
    function initArgs(obj, prop) {
      this.obj  = obj;
      this.prop = prop;
    },
    function get() {
      return this.prop.get(this.obj);
    },
    function set(value) {
      return this.prop.set(this.obj, value);
    },
    function subscribe(l) {
      return this.obj.subscribe('propertyChange', this.prop.name, l);
    },
    function unsubscribe(l) {
      this.obj.unsubscribe('propertyChange', this.prop.name, l);
    },
    function isDefined() {
      return this.obj.hasOwnProperty(this.prop.name);
    },
    function clear() {
      this.obj.clearProperty(this.prop.name);
    }
  ]
});


/*
  Topic
  Topics delcare the types of events that an object publishes.

  Ex.
  foam.CLASS({
    name: 'Alarm',
    topics: [ 'ring' ]
  });

  then doing:
  alarm.ring.publish();
  alarm.ring.subscribe(l);

  is the same as:
  alarm.publish('ring');
  alarm.subscribe('ring', l);
*/
foam.CLASS({
  name: 'Topic',

  documentation: 'Topic Axiom',

  properties: [ 'name', 'description' ],

  methods: [
    function installInProto(proto) {
      var name = this.name;

      Object.defineProperty(proto, name, {
        get: function topicGetter() {
          var self = this;
          if ( ! this.hasOwnPrivate_(name) )
            this.setPrivate_(
              name,
              {
                publish:     self.publish.bind(self, name),
                subscribe:   self.subscribe.bind(self, name),
                unsubscribe: self.unsubscribe.bind(self, name),
                toString:    function() { return 'Topic(' + name + ')'; }
              }
            );

          return this.getPrivate_(name);
        },
        set: function propSetter(newValue) {
          this.setPrivate_(name, newValue);
        },
        configurable: true,
        enumerable: false
      });
    }
  ]
});


foam.CLASS({
  name: 'BooleanProperty',
  extends: 'Property',

  properties: [
    {
      name: 'defaultValue',
      defaultValue: false
    },
    {
      name: 'adapt',
      defaultValue: function(_, v) { return !!v; }
    }
  ]
});


foam.CLASS({
  name: 'IntProperty',
  extends: 'Property',

  properties: [
    'units',
    {
      name: 'defaultValue',
      defaultValue: 0
    },
    {
      name: 'adapt',
      defaultValue: function(_, v) {
        return typeof v === 'number' ?
          Math.round(v) : v ? parseInt(v) : 0 ;
      }
    }
  ]
});


// TODO: Add other Property sub-classes here.


/*
  Listener
  Listeners are high-level pre-bound event call-backs.

  Ex.
  foam.CLASS({
    name: 'Sprinkler',
    listeners: [

      // short-form
      function onAlarm() { ... },

      // long-form
      {
        name: 'onClear',
        isFramed: true,
        code: function() { ... }
      }
    ]
  });

  You might use the above onAlarm listener like this:
  alarm.ring.subscribe(sprinker.onAlarm);

  Notice, that normally JS methods forget which object they belong
  to so you would need to do something like:
    alarm.ring.subscribe(sprinker.onAlarm.bind(sprinkler));
  But listeners are pre-bound.
*/
foam.CLASS({
  name: 'Listener',

  properties: [
    'name',
    'code',
    { type: 'Boolean', name: 'isFramed',   defaultValue: false },
    { type: 'Boolean', name: 'isMerged',   defaultValue: false },
    { type: 'Int',     name: 'mergeDelay', defaultValue: 16, units: 'ms' }
  ],

  methods: [
    function installInProto(proto) {
      var name = this.name;
      var code = this.code;

      Object.defineProperty(proto, name, {
        get: function topicGetter() {
          if ( ! this.hasOwnPrivate_(name) )
            this.setPrivate_(name, code.bind(this));

          return this.getPrivate_(name);
        },
        configurable: true,
        enumerable: false
      });
    }
  ]
});


foam.CLASS({
  name: 'Model',

  documentation: 'Add new Axiom types (Traits, Constants, Topics, Properties, Methods and Listeners) to Model.',

  properties: [
    {
      type: 'AxiomArray',
      subType: 'Trait',
      name: 'traits',
      adaptArrayElement: function(o) {
        return typeof o === 'string' ?
          Trait.create({path: o})    :
          Trait.create(o)            ;
      }
    },
    {
      type: 'AxiomArray',
      subType: 'Constant',
      name: 'constants',
      adapt: function(_, a, prop) {
        if ( ! a ) return [];
        if ( ! Array.isArray(a) ) {
          var cs = [];
          for ( var key in a )
            cs.push(Constant.create({name: key, value: a[key]}));
          return cs;
        }
        return a.map(prop.adaptArrayElement.bind(prop));
      }
    },
    {
      type: 'AxiomArray',
      subType: 'Topic',
      name: 'topics',
      adaptArrayElement: function(o) {
        return typeof o === 'string' ?
          Topic.create({name: o})    :
          Topic.create(o)            ;
      }
    },
    {
      type: 'AxiomArray',
      subType: 'Property',
      name: 'properties',
      adaptArrayElement: function(o) {
        return typeof o === 'string'     ?
          Property.create({name: o})     :
          global[this.subType].create(o) ;
      }
    },
    {
      type: 'AxiomArray',
      subType: 'Method',
      name: 'methods',
      adaptArrayElement: function(o) {
        if ( typeof o === 'function' ) {
          console.assert(o.name, 'Method must be named');
          return Method.create({name: o.name, code: o});
        }
        return global[this.subType].create(o);
      }
    },
    {
      type: 'AxiomArray',
      subType: 'Listener',
      name: 'listeners',
      adaptArrayElement: function(o) {
        if ( typeof o === 'function' ) {
          console.assert(o.name, 'Listener must be named');
          return Listener.create({name: o.name, code: o});
        }
        return Listener.create(o);
      }
    }
  ]
});


foam.CLASS({
  name: 'FObject',
  
  documentation: 'Upgrade FObject to fully bootstraped form.',

  topics: [ 'propertyChange' ],

  methods: [
    function initArgs(args) {
      /*
        Called to process constructor arguments.
        Replaces simpler version defined in original FObject definition.
      */
      if ( ! args ) return;

      // If args are just a simple {} map, just copy
      if ( args.__proto__ === Object.prototype || ! args.__proto__ ) {
        Object.assign(this, args);
      }
      // If an FObject, copy values from instance_ 
      else if ( args.instance_ ) {
        for ( var key in args.instance_ )
          if ( this.cls_.getAxiomByName(key) )
            this[key] = args[key];
      }
      // Else call copyFrom(), which is the slowest version because
      // it is O(# of properties) not O(# of args)
      else {
        this.copyFrom(args);
      }
    },

    function copyFrom(o) {
      // TODO: should walk through Axioms with initAgents instead
      var a = this.cls_.getAxiomsByClass(Property);
      for ( var i = 0 ; i < a.length ; i++ ) {
        var name = a[i].name;
        if ( typeof o[name] !== 'undefined' )
          this[name] = o[name];
      }
      return this;
    },

    function clearProperty(name) { delete this.instance_[name]; },

    function toString() {
      // Distinguish between prototypes and instances.
      return this.cls_.name + (this.instance_ ? '' : 'Proto')
    }
  ]
});

foam.boot.end();


/*
  TODO:
  - more docs
    - doc Slots
  - Slot.follow() and other methods
  - distinguish new CLASS from EXTENSION
  - package support
  - imports / exports
  - listener decorators
  - Lightweight Objects
  - 'expression' Property property
  - Add package and id to Model and Class
  - Proxy id, name, package, label, plural from Class to Model
  - ID support
*/
