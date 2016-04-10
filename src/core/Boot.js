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
 FOAM Bootstrap
<p>
 FOAM uses Models to specify class definitions.
 The FOAM Model class is itself specified with a FOAM model, meaning
 that Model is defined in the same language which it defines.
 This self-modeling system requires some care to bootstrap, but results
 in a very compact, uniform, and powerful system.
<pre>
            Abstract Class
                  ^
                  |
 FObject -> FObject Class                     Prototype
    ^                        +-.prototype---------^
    |                        |                    |
  Model  -> getClass()  -> Class -> create() -> instance
</pre>
  FObject is the root model/class of all other classes, including Model.
  Abstract Class is the prototype of FObject's Class, which makes it the root of all Classes.
  From a Model we call getClass() to create a Class (or the previously created Class) object.
  From the Class we call create() to create new instances of that class.
  New instances extend the classes prototype object, which is store on the class as .prototype.
<pre>
  instance ---> .cls_   -> Object's Class
       |
       +------> .model_ -> Object's Model
</pre>
  All descendents of FObject have references to both their Model and Class.
    - obj.cls_ refers to an Object's Class
    - obj.model_ refers to an Object's Model

<p>  Classes also refer to their Model with .model_.

<p>  Model is its own definition:
<pre>
    Model.getClass().create(Model) == Model
    Model.model_ === Model
</pre>
  Models are defined as a collection of Axioms.
  It is the responsibility of Axioms to install itself onto a Model's Class and/or Prototype.

<p>
  Axioms are defined with the following psedo-interface:
<pre>
    public interface Axiom {
      optional installInClass(cls)
      optional installInProto(proto)
    }
</pre>
  Ex. of a Model with one Axiom:
<pre>
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
</pre>
  Axioms can be added either during the initial creation of a class and prototype,
  or anytime after.  This allows classes to be extended with new functionality,
  and this is very important to the bootstrap process because it allows us to
  start out with very simple definitions of Model and FObject, and then build
  them up until they're fully bootstrapped.
<p>
  However, raw axioms are rarely used directly. Instead we model higher-level
  axiom types, including:
<ul>
  <li>Requires   - Require other classes
  <li>Imports    - Context imports
  <li>Exports    - Context exports
  <li>Implements - Declare interfaces implemented / mix-ins mixed-in
  <li>Constants  - Add constants to the prototype and class
  <li>Properties - High-level instance variable definitions
  <li>Methods    - Prototype methods
  <li>Topics     - Publish/sub topics
  <li>Listeners  - Like methods, but with extra features for use as callbacks
</ul>

*/


/**
 Bootstrap support.

 Is discarded after use.
*/
foam.LIB({
  name: 'foam.boot',

  constants: {
    startTime: Date.now(),
  },

  methods: [
    /**
      Create or Update a Prototype from a Model definition.

      This will be added as a method on the Model class
      when it is eventually built.

      (Model is 'this').
    */
    function getClass() {
      var cls;

      if ( this.refines ) {
        cls = foam.lookup(this.refines);
        console.assert(cls, 'Unknown refinement class: ' + this.refines);
      } else {
        console.assert(this.id, 'Missing id name.', this.name);
        console.assert(this.name, 'Missing class name.');
//        if ( global[this.name] )
//          console.warn('Redefinition of class: ' + this.name);

        var parent = this.extends   ?
          foam.lookup(this.extends) :
          foam.AbstractClass        ;

        if ( ! parent ) {
          console.error('Unknown extends: ' + this.extends + ', in class ' + this.id);
        }

        cls                  = Object.create(parent);
        cls.prototype        = Object.create(parent.prototype);
        cls.prototype.cls_   = cls;
        cls.prototype.model_ = this;
        cls.prototype.ID__   = this.id + 'Prototype';
        cls.ID__             = this.id + 'Class';
        cls.private_         = { axiomCache: {} };
        cls.axiomMap_        = Object.create(parent.axiomMap_);
        cls.id               = this.id;
        cls.package          = this.package;
        cls.name             = this.name;
        cls.model_           = this;

        // Classes without a package are also registered as globals
        if ( ! cls.package ) global[cls.name] = cls;

        foam.register(cls);
      }

      cls.installModel(this);

      return cls;
    },

    function start() {
      /* Start the bootstrap process. */

      var getClass = this.getClass;

      // Will be replaced in phase2.
      foam.CLASS = function(m) { return getClass.call(m); };
    },

    /** Start second phase of bootstrap process. */
    function phase2() {
      // Upgrade to final CLASS() definition.
      /** Creates a Foam class from a plain-old-object definition.
          @method CLASS
          @memberof module:foam */
      foam.CLASS = function(m) {
        var model = foam.core.Model.create(m);
        model.validate();
        return model.getClass();
      };

      // Upgrade existing classes to real classes.
      for ( var key in foam.core ) {
        var m = foam.lookup(key).model_;
        m.refines = m.id;
        foam.CLASS(m);
      }
    },

    function phase3() {
      // Substitute AbstractClass.installModel() with simpler axiom-only version.
      foam.AbstractClass.installModel = function installModel(m) {
        this.private_.axiomCache = {};

        // Install Axioms in first pass so that they're available in the second-pass
        // when axioms are actually run.  This avoids some ordering issues.
        for ( var i = 0 ; i < m.axioms_.length ; i++ ) {
          var a = m.axioms_[i];
          this.axiomMap_[a.name] = a;
          a.sourceCls_ = this;
        }

        for ( var i = 0 ; i < m.axioms_.length ; i++ ) {
          var a = m.axioms_[i];
          a.installInClass && a.installInClass(this);
          a.installInProto && a.installInProto(this.prototype);
        }
      };
    },

    /** Finish the bootstrap process, deleting foam.boot when done. */
    function end() {
      var Model = foam.core.Model;

      // Update psedo-Models to real Models
      for ( var key in foam.core ) {
        var c = foam.core[key];
        c.prototype.model_ = c.model_ = Model.create(c.model_);
      }

      delete foam['boot'];

      console.log('core boot time: ', Date.now() - this.startTime);
    }
  ]
});


foam.LIB({
  name: 'foam.AbstractClass',

  // documentation: "Root prototype for all classes.",

  constants: {
    prototype: Object.prototype,
    axiomMap_: {}
  },

  methods: [
    /**
      Create a new instance of this class.
      Configured from values taken from 'args', if supplifed.
    */
    function create(args, X) {
      var obj = Object.create(this.prototype);

      // Properties have their values stored in instance_ instead
      // of on the object directly. This lets us defineProperty on
      // the object itself so that we can add extra behaviour
      // to properties (things like preSet, postSet, firing property-
      // change events, etc.).
      obj.instance_ = {};

      // initArgs() is the standard argument extraction method.
      obj.initArgs(args, X);

      // init(), if defined, is called when object is created.
      // This is where class specific initialization code should
      // be put (not in initArgs).
      obj.init && obj.init();

      return obj;
    },

    /**
      Install an Axiom into the class and prototype.
      Invalidate the axiom-cache, used by getAxiomsByName().

      TODO: Wait for first object to be created before creating prototype.
      Currently it installs axioms into the protoype immediately, but in should
      wait until the first object is created. This will provide
      better startup performance.
    */
    function installAxiom(a) {
      // Store the destination class in the Axiom.  Used by describe().
      // Store source class on a clone of 'a' so that the Axiom can be
      // reused without corrupting the sourceCls_.
      a = Object.create(a);
      a.sourceCls_ = this;

      this.axiomMap_[a.name] = a;
      this.private_.axiomCache = {};

      a.installInClass && a.installInClass(this);
      a.installInProto && a.installInProto(this.prototype);
    },

    /**
      Determine if an object is an instance of this class
      or one of its sub-classes.
    */
    function isInstance(o) {
      return !! ( o && o.cls_ && this.isSubClass(o.cls_) );
    },

    /** Determine if a class is either this class or a sub-class. */
    function isSubClass(c) {
      if ( ! c ) return false;

      var cache = this.private_.isSubClassCache ||
        ( this.private_.isSubClassCache = {} );

      if ( cache[c.id] === undefined ) {
        cache[c.id] = ( c === this.prototype.cls_ ) ||
          this.isSubClass(c.__proto__);
      }

      return cache[c.id];
    },

    /** Find an axiom by the specified name from either this class or an ancestor. */
    function getAxiomByName(name) {
      return this.axiomMap_[name];
    },

    /**
      Returns all axioms defined on this class or its parent classes
      that are instances of the specified class.
    */
    function getAxiomsByClass(cls) {
      // TODO: Add efficient support for:
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
      Return true if an axiom named "name" is defined on this class
      directly, regardless of what parent classes define.
    */
    function hasOwnAxiom(name) {
      return this.axiomMap_.hasOwnProperty(name);
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
          this.prototype[a.name] = a.code;
        }
      }

      /*
        Properties can be defined using three formats:
        1. Short-form String: Ex.: 'firstName' or 'sex'
        2. Medium-form Array: Ex.: [ 'firstName', 'John' ] or [ 'sex', 'Male' ]
           The first element of the array is the name and the second is the default value.
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

          var type = foam.lookup(a.class) || foam.core.Property;
          if ( type !== a.cls_ ) a = type.create(a);

          this.installAxiom(a);
        }
      }
    }
  ]
});


foam.boot.start();

/** The implicit base model for the model heirarchy. If you do not
 *  explicitly extend another model, FObject is used. Most models will
 *  extend FObject and inherit its methods.
 */
foam.CLASS({
  id: 'foam.core.FObject',
  package: 'foam.core',
  name: 'FObject',

  // documentation: 'Base model for model hierarchy.',

  imports: [ 'assert', 'error', 'log', 'warn' ],

  methods: [
    /**
      This is a temporary version of initArgs.
      When the bootstrap is finished, it will be replaced by a version
      that knows about a classes Properties, so it can do a better job.
     */
    function initArgs(args) {
      if ( ! args ) return;

      if ( args.originalArgs_ ) {
        args = args.originalArgs_;
      } else {
        this.originalArgs_ = args;
      }

      for ( var key in args ) this[key] = args[key];
    },

    function hasOwnProperty(name) {
      return typeof this.instance_[name] !== 'undefined' ||
          this.instance_.hasOwnProperty(name);
    },

    /**
      Private support is used to store per-object values that are not
      instance variables.  Things like listeners and topics.
    */
    function setPrivate_(name, value) {
      ( this.private_ || ( this.private_ = {} ) )[name] = value;
      return value;
    },

    function getPrivate_(name) {
      return this.private_ && this.private_[name];
    },

    function hasOwnPrivate_(name) {
      return this.private_ &&
        ( typeof this.private_[name] !== 'undefined' ||
          this.private_.hasOwnProperty(name) );
    },

    function pubPropertyChange() {
      // NOP - to be added later
    },

    function validate() {
      var as = this.cls_.getAxioms();
      for ( var i = 0 ; i < as.length ; i++ ) {
        var a = as[i];
//        a.validate && a.validate();
        a.validateInstance && a.validateInstance(this);
      }
    }
  ]
});


/** Class/Prototype description. */
foam.CLASS({
  id: 'foam.core.Model',
  package: 'foam.core',
  name: 'Model',
  extends: 'FObject', // Isn't the default yet.

  // documentation: 'Class/Prototype description.',

  properties: [
    {
      name: 'id',
      getter: function() {
        return this.package ? this.package + '.' + this.name : this.name;
      }
    },
    'package',
    'name',
    {
      name: 'label',
      expression: function(name) { return foam.String.labelize(name); }
    },
    [ 'extends', 'FObject' ],
    'refines',
    {
      name: 'axioms_',
      factory: function() { return []; }
    },
    {
      name: 'axioms',
      factory: function() { return []; },
      postSet: function(_, a) { this.axioms_.push.apply(this.axioms_, a); }
    },
    {
      class: 'Array',
      of: 'Property',
      name: 'properties',
      adaptArrayElement: function(o) {
        if ( typeof o === 'string' ) {
          var p = foam.core.Property.create();
          p.name = o;
          return p;
        }
        if ( Array.isArray(o) ) {
          var p = foam.core.Property.create();
          p.name         = o[0];
          p.value = o[1];
          return p;
        }
        return o.class ?
          foam.lookup(o.class).create(o) :
          foam.core.Property.create(o)   ;
      }
    },
    {
      class: 'Array',
      of: 'Method',
      name: 'methods',
      adaptArrayElement: function(o) {
        if ( typeof o === 'function' ) {
          console.assert(o.name, 'Method must be named');
          var m = foam.core.Method.create();
          m.name = o.name;
          m.code = o;
          return m;
        }
        return o;
      }
    }
  ],

  methods: [ foam.boot.getClass ]
});


foam.CLASS({
  id: 'foam.core.Property',
  package: 'foam.core',
  name: 'Property',
  extends: 'FObject',

  properties: [
    { name: 'name', required: true },
    {
      name: 'label',
      expression: function(name) { return foam.String.labelize(name); }
    },
    'help',
    'value',
    'factory',
    'adapt',
    'preSet',
    'postSet',
    'expression',
    'getter',
    'setter',
    'final',
    'required',
    [
      /**
        Compare two values taken from this property.
        <p>Used by Property.compare().
        It is a property rather than a method so that it can be configured
        without subclassing.
      */
      'comparePropertyValues',
      function(o1, o2) {
        return foam.util.compare(o1, o2);
      }
    ]
  ],

  methods: [
    /**
      Handle overriding of Property definition from parent class by
      copying undefined values from parent Property, if it exists.
    */
    function installInClass(c) {
      var superProp = c.__proto__.getAxiomByName(this.name);
      if ( superProp ) {
        var a = this.cls_.getAxiomsByClass(foam.core.Property);
        for ( var i = 0 ; i < a.length ; i++ ) {
          var name = a[i].name;
          if ( superProp.hasOwnProperty(name) && ! this.hasOwnProperty(name) ) {
            this[name] = superProp[name];
          }
        }
      }

      c[foam.String.constantize(this.name)] = this;

      /** Makes this Property an adapter, suitable for use with mLangs. */
      var name = this.name;
      var f = this.f = function f(o) { return o[name]; };

      /** Makes this Property a comparator, suitable for use with mLangs. */
      var comparePropertyValues = this.comparePropertyValues;
      this.compare = function compare(o1, o2) {
        return comparePropertyValues(f(o1), f(o2));
      }
    },

    /**
      Install a property onto a prototype from a Property definition.
      (Property is 'this').
    */
    function installInProto(proto) {
      var prop     = this;
      var name     = this.name;
      var adapt    = this.adapt
      var preSet   = this.preSet;
      var postSet  = this.postSet;
      var factory  = this.factory;
      // This doesn't let value to be 'undefined', which is maybe not bad.
      var value    = this.value;
      var hasValue = typeof value !== 'undefined';
      var slotName = name + '$';
      var isFinal  = this.final;
      var eFactory = this.exprFactory(this.expression);

      // This costs us about 4% of our boot time.
      // If not in debug mode we should share implementations like in F1.
      Object.defineProperty(proto, slotName, {
        get: function propDynGetter() {
          return prop.toSlot(this);
        },
        set: function propDynSetter(dyn) {
          prop.toSlot(this).link(dyn);
        },
        configurable: true,
        enumerable: false
      });

      var getter =
        prop.getter ? prop.getter :
        factory ? function factoryGetter() {
          return this.hasOwnProperty(name) ?
            this.instance_[name] :
            this[name] = factory.call(this) ;
        } :
        eFactory ? function eFactoryGetter() {
          return this.hasOwnProperty(name) ? this.instance_[name]   :
                 this.hasOwnPrivate_(name) ? this.getPrivate_(name) :
                 this.setPrivate_(name, eFactory.call(this)) ;
        } :
        hasValue ? function valueGetter() {
          var v = this.instance_[name];
          return typeof v !== 'undefined' || this.instance_.hasOwnProperty(name) ? v : value ;
        } :
        function simpleGetter() { return this.instance_[name]; };

      var setter = prop.setter ||
        function propSetter(newValue) {
          // Get old value but avoid triggering factory if present
          var oldValue =
            factory  ? ( this.hasOwnProperty(name) ? this[name] : undefined ) :
            eFactory ? ( this.hasOwnPrivate_(name) || this.hasOwnProperty(name) ? this[name] : undefined ) :
            this[name] ;

          if ( adapt )  newValue = adapt.call(this, oldValue, newValue, prop);

          if ( preSet ) newValue = preSet.call(this, oldValue, newValue, prop);

          this.instance_[name] = newValue;

          if ( isFinal ) {
            Object.defineProperty(this, name, {
              value: newValue,
              writable: false,
              configurable: true
            });
          }

          this.pubPropertyChange(name, oldValue, newValue);

          // TODO(maybe): pub to a global topic to support dynamic()

          if ( postSet ) postSet.call(this, oldValue, newValue, prop);
        };

      Object.defineProperty(proto, name, {
        get: getter,
        set: setter,
        configurable: true
      });
    },

    function validateInstance(o) {
      /* Validate an object which has this property. */
      if ( this.required && ! o[this.name] ) {
        throw 'Required property ' + o.cls_.id + '.' + this.name + ' not defined.';
      }
    },

    /** Create a factory function from an expression function. **/
    function exprFactory(e) {
      if ( ! e ) return null;

      var argNames = foam.Function.argsArray(e);
      var name = this.name;

      return function() {
        var self = this;
        var args = new Array(argNames.length);
        var subs = [];
        var l    = function() {
          if ( ! self.hasOwnProperty(name) ) {
            delete self.private_[name];
            self.clearProperty(name); // TODO: this might be wrong
          }
          for ( var i = 0 ; i < subs.length ; i++ ) {
            subs[i].destroy();
          }
        };
        for ( var i = 0 ; i < argNames.length ; i++ ) {
          subs.push(this.sub('propertyChange', argNames[i], l));
          args[i] = this[argNames[i]];
        }
        return e.apply(this, args);
      };
    },

    /** Returns a human-readable description of this Property. **/
    function toString() {
      return this.name;
    },

    /** Flyweight getter for this Property. **/
    function get(o) {
      return o[this.name];
    },

    /** Flyweight setter for this Property. **/
    function set(o, value) {
      o[this.name] = value;
      return this;
    },

    /** Copy this property's value from o1 to o2. **/
    function copy(srd, dst) {
      this.set(dst, this.get(src));
    },

    function exportedValue(obj) {
      /** Export obj.name$ instead of just obj.name. **/
      return obj.slot(this.name);
    },

    function toSlot(obj) {
      var slotName = this.slotName_ || ( this.slotName_ = this.name + '$' );
      var dyn      = obj.getPrivate_(slotName);

      if ( ! dyn ) {
        dyn = foam.core.internal.PropertySlot.create();
        dyn.obj  = obj;
        dyn.prop = this;
        obj.setPrivate_(slotName, dyn);
      }

      return dyn;
    }
  ]
});


/**
<p>
  Methods are only installed on the prototype.
  If the method is overriding a method from a parent
  class, then SUPER support is added.

<p>
  Ex.
<pre>
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
</pre>
*/
foam.CLASS({
  id: 'foam.core.Method',
  package: 'foam.core',
  name: 'Method',
  extends: 'FObject',

  properties: [ 'name', 'code', 'returns' ],

  methods: [
    /**
      Decorate a method so that it can call the
      method it overrides with this.SUPER().
    */
    function override_(proto, method) {
      var super_ = proto[this.name];

      // Not overriding, so just return original method
      if ( ! super_ ) return method;

      console.assert(
          typeof super_ === 'function',
          'Attempt to override non-method: ',
          this.name);

      // Not using SUPER, so just return original method
      if ( method.toString().indexOf('SUPER') == -1 ) return method;

      function SUPER() { return super_.apply(this, arguments); }

      var f = function() {
        var oldSuper = this.SUPER;
        this.SUPER = SUPER;

        try {
          return method.apply(this, arguments);
        } finally {
          this.SUPER = oldSuper;
        }

        return ret;
      };

      foam.Function.setName(f, this.name);
      f.toString = function() { return method.toString(); };

      return f;
    },

    function installInProto(proto) {
      proto[this.name] = this.override_(proto, this.code);
    },

    function exportedValue(obj) {
      var m = obj[this.name];
      /** Bind the method to 'this' when exported so that it still works. **/
      return function exportedMethod() { return m.apply(obj, arguments); };
    }
  ]
});


foam.CLASS({
  id: 'foam.core.String',
  package: 'foam.core',
  name: 'String',
  extends: 'Property',

  // documentation: 'StringProperties coerce their arguments into Strings.',

  properties: [
    [ 'adapt', function(_, a) {
        return typeof a === 'function' ? foam.String.multiline(a) :
          a ? a.toString() :
          '' ;
      }
    ],
    [ 'value', '' ]
  ]
});


foam.CLASS({
  id: 'foam.core.Array',
  package: 'foam.core',
  name: 'Array',
  extends: 'Property',

  // documentation: "A Property which contains an array of 'of' objects.",

  properties: [
    { name: 'of', required: true },
    [ 'factory', function() { return []; } ],
    [ 'adapt', function(_, a, prop) {
        if ( ! a ) return [];
        var b = new Array(a.length);
        for ( var i = 0 ; i < a.length ; i++ ) {
          b[i] = prop.adaptArrayElement(a[i]);
        }
        return b;
      }
    ],
    [ 'adaptArrayElement', function(o) {
        return foam.lookup(this.of).create(o, this);
      }
    ]
  ]
});


foam.boot.phase2();


foam.CLASS({
  refines: 'foam.core.FObject',

  // documentation: 'Add listener support to FObject.',

  methods: [
    /**
      This structure represents the head of a doubly-linked list of
      listeners. It contains 'next', a pointer to the first listener,
      and 'children', an array of sub-topic chains.
      Nodes in the list contain 'next' and 'prev' links, which lets
      removing subscriptions be done quickly by connecting next to prev
      and prev to next.
    */
    function createListenerList_() {
      return { next: null, children: [] };
    },

    /** Return the top-level listener list, creating if necessary. */
    function listeners_() {
      return this.getPrivate_('listeners') ||
        this.setPrivate_('listeners', this.createListenerList_());
    },

    /**
      Notify all of the listeners in a listener list.
      Returns the number of listeners notified.
    */
    function notify_(listeners, a) {
      var count = 0;
      while ( listeners ) {
        var l = listeners.l;
        var s = listeners.sub;
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
        }
        listeners = listeners.next;
        count++;
      }
      return count;
    },

    function hasListeners(/* args */) {
      var listeners = this.getPrivate_('listeners');

      for ( var i = 0 ; listeners ; i++ ) {
        if ( listeners.next        ) return true;
        if ( i == arguments.length ) return false;
        listeners = listeners.children[arguments[i]];
      }

      return false;
    },

    /**
      Publish a message to all matching subd listeners.
      Returns the number of listeners notified.
    */
    function pub(a1, a2, a3, a4, a5, a6, a7) {
      // This method prevents this function not being JIT-ed because
      // of the use of 'arguments'.  Doesn't generate any garbage.
      switch ( arguments.length ) {
        case 0: return this.pub_([]);
        case 1: return this.pub_([a1]);
        case 2: return this.pub_([a1, a2]);
        case 3: return this.pub_([a1, a2, a3]);
        case 4: return this.pub_([a1, a2, a3, a4]);
        case 5: return this.pub_([a1, a2, a3, a4, a5]);
        case 6: return this.pub_([a1, a2, a3, a4, a5, a6]);
        case 7: return this.pub_([a1, a2, a3, a4, a5, a6, a7]);
      }
      console.error('pub() takes at most 7 arguments.');
    },

    function pub_(args) {
      if ( ! this.hasOwnPrivate_('listeners') ) return 0;

      var listeners = this.listeners_();
      var count     = this.notify_(listeners.next, args);
      for ( var i = 0 ; i < args.length; i++ ) {
        var listeners = listeners.children[args[i]];
        if ( ! listeners ) break;
        count += this.notify_(listeners.next, args);
      }

      return count;
    },

    /**
      Subscribe to pubed events.
      args - zero or more values which specify the pattern of pubed
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
      var l         = arguments[arguments.length-1];
      var listeners = this.listeners_();

      for ( var i = 0 ; i < arguments.length-1 ; i++ ) {
        listeners = listeners.children[arguments[i]] ||
        ( listeners.children[arguments[i]] = this.createListenerList_() );
      }

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

    /** Unsub a previously subd listener. */
    function unsub() { /* args..., l */
      var l         = arguments[arguments.length-1];
      var listeners = this.getPrivate_('listeners');

      for ( var i = 0 ; i < arguments.length-1 && listeners ; i++ ) {
        listeners = listeners.children[arguments[i]];
      }

      var node = listeners && listeners.next;
      while ( node ) {
        if ( node.l === l ) {
          node.sub.destroy();
          return;
        }
        node = node.next;
      }
    },

    /** Publish to this.propertyChange topic if oldValue and newValue are different. */
    function pubPropertyChange(name, oldValue, newValue) {
      if ( ! Object.is(oldValue, newValue) && this.hasListeners('propertyChange', name) ) {
        var dyn = this.slot(name);
        dyn.setPrev(oldValue);
        this.pub('propertyChange', name, dyn);
      }
    },

    /**
      Creates a Slot for a property.
      @private
    */
    // TODO: have this call toSlot() on Axiom, then not Property specific.
    // This will enable imports to be used in expressions.
    function slot(name) {
      var axiom = this.cls_.getAxiomByName(name);

      console.assert(
        axiom,
        'Attempt to access slot() on unknown axiom: ',
        name);
      console.assert(axiom.toSlot,
        'Attempt to access slot() on an Axiom without toSlot() support: ',
         name);

      return axiom.toSlot(this);
    }
  ]
});


/** An Array whose elements are Axioms and are added to this.axioms. */
foam.CLASS({
  package: 'foam.core',
  name: 'AxiomArray',
  extends: 'Array',

  // documentation: 'An Array whose elements are Axioms and are added to this.axioms.',

  properties: [
    [ 'postSet', function(_, a) { this.axioms_.push.apply(this.axioms_, a); } ]
  ]
});


/**
  Constants are installed on both the prototype and class.
<pre>
  Ex.
  constants: {
    KEY: 'some value'
  }

  this.cls_.KEY === this.KEY === 'some value'
</pre>
*/
foam.CLASS({
  package: 'foam.core',
  name: 'Constant',

  // documentation: 'Constant Axiom',

  properties: [ 'name', 'value' ],

  methods: [
    function installInClass(cls) {
      Object.defineProperty(
        cls,
        foam.String.constantize(this.name),
        {
          value: this.value,
          enumerable: false,
          configurable: false
        });
    },
    function installInProto(proto) {
      this.installInClass(proto);
    }
  ]
});


/**
<pre>
</pre>
*/
foam.CLASS({
  package: 'foam.core',
  name: 'InnerClass',

  // documentation: 'Inner-Class Axiom',

  properties: [
    {
      name: 'model',
      adapt: function(_, m) {
        // TODO: Not needed once we have ObjectProperties
        return foam.core.Model.isInstance(m) ? m : foam.core.Model.create(m);
      }
    }
  ],

  methods: [
    function installInClass(cls) {
      cls[this.model.name] = this.model.getClass();
    },
    function installInProto(proto) {
      // get class already created in installInClass();
      var name = this.model.name;
      var cls = proto.cls_[name];

      Object.defineProperty(proto, name, {
        get: function requiresGetter() {
          if ( ! this.hasOwnPrivate_(name) ) {
            var parent = this;

            var c = Object.create(cls);
            c.create = function(args, X) { return cls.create(args, X || parent); };
            this.setPrivate_(name, c);
          }

          return this.getPrivate_(name);
        },
        configurable: true,
        enumerable: false
      });
    }
  ]
});


/**
  Implements provide a delcaration of a classes intent to implement
  an interface. Since interfaces can also have implementations, it
  can also be used to provide mix-ins, which is a safe form of
  multiple-inheritance.
<pre>
  Ex.
  foam.CLASS({
    name: 'SalaryI',
    properties: [ 'salary' ]
  });

  foam.CLASS({
    name: 'Employee',
    extends: 'Person',
    implements: [ 'SalaryI' ]
  });
</pre>
  Employee extends Person through regular inheritance, but
  the axioms from SalaryI are also added to the class.
  Any number of mix-ins/interfaces can be specified.
*/
foam.CLASS({
  package: 'foam.core',
  name: 'Implements',

  // documentation: 'Implements Axiom',

  properties: [
    { name: 'name', getter: function() { return 'implements_' + this.path; } },
    'path'
  ],

  methods: [
    function installInClass(cls) {
      var m = foam.lookup(this.path);
      if ( ! m ) throw 'No such interface or trait: ' + this.path;
      cls.installModel(m.model_);
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Requires',

  // documentation: 'Require Class Axiom',

  properties: [
    { name: 'name', getter: function() { return 'requires_' + this.path; } },
    'path',
    'as'
  ],

  methods: [
    function installInProto(proto) {
      var path = this.path;
      var as   = this.as;

      Object.defineProperty(proto, as, {
        get: function requiresGetter() {
          if ( ! this.hasOwnPrivate_(as) ) {
            var cls    = foam.lookup(path);
            var parent = this;

            if ( ! cls )
              console.error('Unknown class: ' + path);

            var c = Object.create(cls);
            c.create = function(args, X) { return cls.create(args, X || parent); };
            this.setPrivate_(as, c);
          }

          return this.getPrivate_(as);
        },
        configurable: true,
        enumerable: false
      });
    }
  ]
});


// TODO: doc
foam.CLASS({
  package: 'foam.core',
  name: 'Imports',

  // documentation: 'Import Context Value Axiom',

  properties: [
    { name: 'name', getter: function() { return 'imports_' + this.key; } },
    'key',
    'as'
  ],

  methods: [
    function installInProto(proto) {
      var key      = this.key;
      var as       = this.as;
      var slotName = this.slotName_ = as + '$';

      Object.defineProperty(proto, as, {
        get: function importsGetter() {
          return this[slotName].get();
        },
        set: function importsSetter(v) {
          this[slotName].set(v);
        },
        configurable: true,
        enumerable: false
      });

      Object.defineProperty(proto, slotName, {
        get: function importsGetter() {
          if ( ! this.hasOwnPrivate_(slotName) ) {
            var X = this.X || foam;
            this.setPrivate_(slotName, X[key + '$']);
          }

          return this.getPrivate_(slotName);
        },
        configurable: true,
        enumerable: false
      });
    },

    function toSlot(obj) {
      return obj[this.slotName_];
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Exports',

  // documentation: 'Export Sub-Context Value Axiom',

  properties: [
    [ 'name', 'exports_' ],
    {
      name: 'bindings',
      adapt: function(_, bs) {
        for ( var i = 0 ; i < bs.length ; i++ ) {
          var b = bs[i];
          if ( typeof b === 'string' ) {
            var a   = b.split(' ');
            var key, as;
            switch ( a.length ) {
              case 1:
                key = as = a[0];
              break;
              case 2:
                console.assert(a[0] === 'as', 'Invalid export syntax: key [as value] | as value');
                key = null;
                as  = a[1]; // signifies 'this'
              break;
              case 3:
                console.assert(a[1] === 'as', 'Invalid export syntax: key [as value] | as value');
                key = a[2];
                as  = a[0];
              break;
              default:
                console.error('Invalid export syntax: key [as value] | as value');
            }
            bs[i] = [ key, as ];
          }
        }
        return bs;
      }
    }
  ],

  methods: [
    function installInProto(proto) {
      var bs = this.bindings;

      Object.defineProperty(proto, 'Y', {
        get: function YGetter() {
          if ( ! this.hasOwnPrivate_('Y') ) {
            var X = this.X || foam;
            var m = {};
            for ( var i = 0 ; i < bs.length ; i++ ) {
              var b = bs[i];

              if ( b[0] ) {
                var a = this.cls_.getAxiomByName(b[0]);

                if ( ! a ) {
                  console.error('Unknown export: "' + b[0] + '" in model: ' + this.cls_.id);
                }

                // Axioms have an option of wrapping a value for export.
                // This could be used to bind a method to 'this', for example.
                m[b[1]] = a.exportedValue ? a.exportedValue(this) : this[b[0]] ;
              } else {
                m[b[1]] = this;
              }
            }
            this.setPrivate_('Y', X.subContext(m));
          }

          return this.getPrivate_('Y');
        },
        configurable: true,
        enumerable: false
      });
    }
  ]
});


/**
  Topics delcare the types of events that an object pubes.
<pre>
  Ex.
  foam.CLASS({
    name: 'Alarm',
    topics: [ 'ring' ]
  });

  then doing:
  alarm.ring.pub();
  alarm.ring.sub(l);

  is the same as:
  alarm.pub('ring');
  alarm.sub('ring', l);
</pre>
*/
foam.CLASS({
  package: 'foam.core',
  name: 'Topic',

  // documentation: 'Topic Axiom',

  properties: [
    'name',
    'description',
    {
      class: 'Array',
      of: 'Topic',
      name: 'topics',
      adaptArrayElement: function(o) {
        return typeof o === 'string' ?
          foam.core.Topic.create({ name: o }, this) :
          foam.core.Topic.create(o, this);
      }
    }
  ],

  methods: [
    function installInProto(proto) {
      function makeTopic(topic, parent) {
        var name = topic.name;
        var topics = topic.topics;

        var ret = {
          pub:   foam.Function.bind(parent.pub,   parent, name),
          sub:   foam.Function.bind(parent.sub,   parent, name),
          unsub: foam.Function.bind(parent.unsub, parent, name),
          toString: function() { return 'Topic(' + name + ')'; }
        };

        for ( var i = 0 ; i < topics.length ; i++ ) {
          ret[topics[i].name] = makeTopic(topics[i], ret);
        }

        return ret;
      }

      var name = this.name;
      var topic = this;

      Object.defineProperty(proto, name, {
        get: function topicGetter() {
          var self = this;
          if ( ! this.hasOwnPrivate_(name) ) {
            this.setPrivate_(name, makeTopic(topic, self));
          }

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
  package: 'foam.core',
  name: 'Boolean',
  extends: 'Property',

  properties: [
    [ 'value', false ],
    [ 'adapt', function(_, v) { return !!v; } ]
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Int',
  extends: 'Property',

  properties: [
    'units',
    [ 'value', 0 ],
    [ 'adapt', function(_, v) {
        return typeof v === 'number' ?
          Math.round(v) : v ? parseInt(v) : 0 ;
      }
    ]
  ]
});


/**
  Listeners are high-level pre-bound event call-backs.
<pre>
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
</pre>
  You might use the above onAlarm listener like this:
  alarm.ring.sub(sprinker.onAlarm);
<p>
  Notice, that normally JS methods forget which object they belong
  to so you would need to do something like:
    <pre>alarm.ring.sub(sprinker.onAlarm.bind(sprinkler));</pre>
  But listeners are pre-bound.
*/
foam.CLASS({
  package: 'foam.core',
  name: 'Listener',

  properties: [
    'name',
    'code',
    { class: 'Boolean', name: 'isFramed',   value: false },
    { class: 'Boolean', name: 'isMerged',   value: false },
    { class: 'Int',     name: 'mergeDelay', value: 16, units: 'ms' }
  ],

  methods: [
    function installInProto(proto) {
      var name       = this.name;
      var code       = this.code;
      var isMerged   = this.isMerged;
      var isFramed   = this.isFramed;
      var mergeDelay = this.mergeDelay;

      Object.defineProperty(proto, name, {
        get: function topicGetter() {
          if ( ! this.hasOwnPrivate_(name) ) {
            var self = this;
            var l = function(sub) {
              if ( self.destroyed ) {
                if ( sub ) {
                  console.warn('Destroying stale subscription for', self.cls_.id);
                  sub.destroy();
                }
              } else {
                code.apply(self, arguments);
              }
            };
            if ( isMerged ) {
              l = this.X.merged(l, mergeDelay);
            } else if ( isFramed ) {
              l = this.X.framed(l);
            }
            this.setPrivate_(name, l);
          }

          return this.getPrivate_(name);
        },
        configurable: true,
        enumerable: false
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Identity',

  properties: [ 'ids' ],

  methods: [
    function installInClass(cls) {
      var ids  = this.ids.map(function(id) {
        var prop = cls.getAxiomByName(id);
        if ( ! prop ) {
          console.error('Unknown ids property:', cls.id + '.' + id);
        }
        return prop;
      });

      console.assert(ids.length, 'Ids must contain at least one id.');

      if ( ids.length == 1 ) {
        console.assert(ids[0].name !== 'id', "Redundant to set ids: to just 'id'.");
        cls.ID = ids[0];
      } else {
        cls.ID = {
          name: 'ID',
          get: function(o) {
            var a = new Array(ids.length);
            for ( var i = 0 ; i < ids.length ; i++ ) a[i] = ids[i].get(o);
            return a;
          },
          set: function(o, a) {
            for ( var i = 0 ; i < ids.length ; i++ ) ids[i].set(o, a[i]);
          },
          compare: function(o1, o2) {
            for ( var i = 0 ; i < ids.length ; i++ ) {
              var c = ids[i].compare(o1, o2);
              if ( c ) return c;
            }
            return 0;
          },
          copy: function(src, dst) {
            for ( var i = 0 ; i < ids.length ; i++ ) ids[i].copy(src, dst);
          }
        };
      }
    },

    function installInProto(proto) {
      var ID = proto.cls_.ID;
      Object.defineProperty(proto, 'id', {
        get: function() { return ID.get(this); },
        set: function(id) { ID.set(this, id); }
      });
    }
  ]
});


/** Add new Axiom types (Implements, Constants, Topics, Properties, Methods and Listeners) to Model. */
foam.CLASS({
  refines: 'foam.core.Model',

  // documentation: 'Add new Axiom types (Implements, Constants, Topics, Properties, Methods and Listeners) to Model.',

  properties: [
    {
      class: 'AxiomArray',
      of: 'Requires',
      name: 'requires',
      adaptArrayElement: function(o) {
        if ( typeof o === 'string' ) {
          var a = o.split(' as ');
          var m = a[0];
          var path = m.split('.');
          var as = a[1] || path[path.length-1];
          return foam.core.Requires.create({path: m, as: as});
        }

        return foam.core.Requires.create(o);
      }
    },
    {
      class: 'AxiomArray',
      of: 'Imports',
      name: 'imports',
      adaptArrayElement: function(o) {
        if ( typeof o === 'string' ) {
          var a = o.split(' as ');
          var m = a[0];
          var as = a[1] || m;
          return foam.core.Imports.create({key: m, as: as});
        }

        return foam.core.Imports.create(o);
      }
    },
    {
      name: 'exports',
      postSet: function(_, xs) {
        this.axioms_.push.call(
          this.axioms_,
          foam.core.Exports.create({bindings: xs}));
      }
    },
    {
      class: 'AxiomArray',
      of: 'Implements',
      name: 'implements',
      adaptArrayElement: function(o) {
        return typeof o === 'string' ?
          foam.core.Implements.create({path: o}) :
          foam.core.Implements.create(o)         ;
      }
    },
    {
      class: 'AxiomArray',
      of: 'InnerClass',
      name: 'classes',
      adaptArrayElement: function(o) {
        return foam.core.InnerClass.isInstance(o) ?
          o :
          foam.core.InnerClass.create({model: o}) ;
      }
    },
    {
      class: 'AxiomArray',
      of: 'Constant',
      name: 'constants',
      adapt: function(_, a, prop) {
        if ( ! a ) return [];
        if ( ! Array.isArray(a) ) {
          var cs = [];
          for ( var key in a ) {
            cs.push(foam.core.Constant.create({name: key, value: a[key]}));
          }
          return cs;
        }
        var b = new Array(a.length);
        for ( var i = 0 ; i < a.length ; i++ ) {
          b[i] = prop.adaptArrayElement(a[i]);
        }
        return b;
      }
    },
    {
      name: 'ids',
      postSet: function(_, ids) {
        this.axioms_.push.call(
          this.axioms_,
          foam.core.Identity.create({ids: ids}));
      }
    },
    {
      class: 'AxiomArray',
      of: 'Topic',
      name: 'topics',
      adaptArrayElement: function(o) {
        return typeof o === 'string'        ?
          foam.core.Topic.create({name: o}) :
          foam.core.Topic.create(o)         ;
      }
    },
    {
      class: 'AxiomArray',
      of: 'Property',
      name: 'properties',
      adaptArrayElement: foam.core.Model.PROPERTIES.adaptArrayElement
    },
    {
      class: 'AxiomArray',
      of: 'Method',
      name: 'methods',
      adaptArrayElement: function(o) {
        if ( typeof o === 'function' ) {
          console.assert(o.name, 'Method must be named');
          var m = foam.core.Method.create();
          m.name = o.name;
          m.code = o;
          return m;
        }
        return foam.core.Method.create(o);
      }
    },
    {
      class: 'AxiomArray',
      of: 'Listener',
      name: 'listeners',
      adaptArrayElement: function(o) {
        if ( typeof o === 'function' ) {
          console.assert(o.name, 'Listener must be named');
          return foam.core.Listener.create({name: o.name, code: o});
        }
        return foam.core.Listener.create(o);
      }
    }
  ]
});


foam.boot.phase3();

foam.CLASS({
  refines: 'foam.core.FObject',

  // documentation: 'Upgrade FObject to fully bootstraped form.',

  topics: [ 'propertyChange' ],

  axioms: [
    {
      name: 'X',
      installInProto: function(p) {
        Object.defineProperty(p, 'X', {
          get: function() {
            var x = this.getPrivate_('X');
            if ( ! x ) {
              var ySource = this.getPrivate_('ySource');
              if ( ySource ) {
                this.setPrivate_('X', x = ySource.Y || ySource.X);
                this.setPrivate_('ySource', undefined);
              } else {
                // console.error('Missing X in ', this.cls_.id);
                return undefined;
              }
            }
            return x;
          },
          set: function(x) {
            if ( x ) {
              this.setPrivate_(foam.core.FObject.isInstance(x) ? 'ySource' : 'X', x);
            }
          }
        });
      }
    }
  ],

  methods: [
    /**
      Called to process constructor arguments.
      Replaces simpler version defined in original FObject definition.
    */
    function initArgs(args, X) {
      this.X = X || foam.X;
      if ( ! args ) return;

      // If args are just a simple {} map, just copy
      if ( args.__proto__ === Object.prototype || ! args.__proto__ ) {
        for ( var key in args ) {
          if ( this.cls_.getAxiomByName(key) ) {
            this[key] = args[key];
          } else {
            this.unknownArg(key, args[key]);
          }
        }
      }
      // If an FObject, copy values from instance_
      else if ( args.instance_ ) {
        for ( var key in args.instance_ ) {
          if ( this.cls_.getAxiomByName(key) ) this[key] = args[key];
        }
      }
      // Else call copyFrom(), which is the slowest version because
      // it is O(# of properties) not O(# of args)
      else {
        this.copyFrom(args);
      }
    },

    function unknownArg(key, value) {
      // NOP
    },

    function copyFrom(o) {
      // TODO: should walk through Axioms with initAgents instead
      var a = this.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0 ; i < a.length ; i++ ) {
        var name = a[i].name;
        if ( typeof o[name] !== 'undefined' ) this[name] = o[name];
      }
      return this;
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
        delete this.instance_[name];
        this.pub('propertyChange', name, this.slot(name));
      }
    },

    function onDestroy(dtor) {
      /*
        Register a function or a destroyable to be called
        when this object is destroyed.
      */
      var dtors = this.getPrivate_('dtors') || this.setPrivate_('dtors', []);
      dtors.push(dtor);
      return dtor;
    },

    function destroy() {
      /*
        Destroy this object.
        Free any referenced objects and destroy any registered destroyables.
        This object is completely unusable after being destroyed.
       */
      if ( this.destroyed ) return;

      this.destroyed = true;

      var dtors = this.getPrivate_('dtors');
      if ( dtors ) {
        for ( var i = 0 ; i < dtors.length ; i++ ) {
          var d = dtors[i];
          if ( typeof d === 'function' ) {
            d();
          } else {
            d.destroy();
          }
        }
      }

      this.instance_ = null;
      this.private_ = null;
    },

    function toString() {
      // Distinguish between prototypes and instances.
      return this.cls_.name + (this.instance_ ? '' : 'Proto')
    }
  ]
});


foam.boot.end();


/**
 TODO:
  - model validation
    - abstract methods
    - interfaces
  - Slot map() and relate() methods
  - more docs
  - Axiom ordering/priority
  - The defineProperty() and setPrivate() pattern is used in several spots, maybe make a helper function

 ???:
  - ? proxy label, plural from Class to Model

 Future:
  - predicate support for getAxioms() methods.
  - cascading object property change events
  - should destroyables be a linked list for fast removal?
    - should onDestroy be merged with listener support?
  - multi-methods?
  - Topic listener relay
*/
