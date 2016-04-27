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
  Model  -> buildClass()  -> Class -> create() -> instance
</pre>
  FObject is the root model/class of all other classes, including Model.
  Abstract Class is the prototype of FObject's Class, which makes it the root of all Classes.
  From a Model we call buildClass() to create a Class (or the previously created Class) object.
  From the Class we call create() to create new instances of that class.
  New instances extend the classes prototype object, which is stored on the class as .prototype.
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
    Model.buildClass().create(Model) == Model
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
    function buildClass() {
      var cls;

      var X = this.X || foam;

      if ( this.refines ) {
        cls = X.lookup(this.refines);
        console.assert(cls, 'Unknown refinement class: ' + this.refines);
      } else {
        console.assert(this.id, 'Missing id name.', this.name);
        console.assert(this.name, 'Missing class name.');
//        if ( global[this.name] )
//          console.warn('Redefinition of class: ' + this.name);

        var parent = this.extends   ?
          X.lookup(this.extends) :
          foam.AbstractClass ;

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
      }

      cls.installModel(this);

      return cls;
    },

    function start() {
      /* Start the bootstrap process. */

      var buildClass = this.buildClass;

      // Will be replaced in phase2.
      foam.CLASS = function(m) {
        var cls = buildClass.call(m);

        if ( ! m.refines ) foam.register(cls);

        var path = cls.id.split('.');
        var root = global;

        for ( var i = 0 ; i < path.length-1 ; i++ ) {
          root = root[path[i]] || ( root[path[i]] = {} );
        }

        root[path[path.length-1]] = cls;
        return cls;
      };
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
        var cls = model.buildClass();
        cls.validate();

        if ( ! m.refines ) foam.register(cls);

        var path = cls.id.split('.');
        var root = global;

        for ( var i = 0 ; i < path.length-1 ; i++ ) {
          root = root[path[i]] || ( root[path[i]] = {} );
        }

        root[path[path.length-1]] = cls;
        return cls;
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
        // when axioms are actually run. This avoids some ordering issues.
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

      FUTURE: Wait for first object to be created before creating prototype.
      Currently it installs axioms into the protoype immediately, but in should
      wait until the first object is created. This will provide
      better startup performance.
    */
    function installAxiom(a) {
      // Store the destination class in the Axiom.  Used by describe().
      // Store source class on a clone of 'a' so that the Axiom can be
      // reused without corrupting the sourceCls_.
      // Disabled: is causing dramatic performance slow-down.
      // a = Object.create(a);
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
