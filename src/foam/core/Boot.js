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

/**
 FOAM Bootstrap
<p>
 FOAM uses Models to specify class definitions.
 The FOAM Model class is itself specified with a FOAM model, meaning
 that Model is defined in the same language which it defines.
 This self-modeling system requires some care to bootstrap, but results
 in a very compact, uniform, and powerful system.
<pre>

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
      var context = this.__context__ || foam.__context__;
      var cls;

      if ( this.refines ) {
        cls = context.lookup(this.refines);
        foam.assert(cls, 'Unknown refinement class: ' + this.refines);
      } else {
        foam.assert(this.id, 'Missing id name.', this.name);
        foam.assert(this.name, 'Missing class name.');

        var parent = this.extends      ?
          context.lookup(this.extends) :
          foam.core.FObject            ;

        cls                  = parent.createSubClass_();
        cls.prototype.cls_   = cls;
        cls.prototype.model_ = this;
        cls.count_           = 0;            // Number of instances created
        cls.id               = this.id;
        cls.package          = this.package;
        cls.name             = this.name;
        cls.model_           = this;

        // Install an FObject on the class that we can use as a pub/sub hub.
        // We have to do this because classes aren't FObjects.
        // This is used to publish 'installAxiom' events to, so that descendents
        // properties know when they need to be re-installed.
        if ( cls !== foam.core.FObject ) {
          cls.pubsub_ = foam.core.FObject.create();

          // Relay 'installAxiom' events from parent class.
          parent.pubsub_ && parent.pubsub_.sub(
            'installAxiom',
            function(_, a1, a2, a3) { cls.pubsub_.pub(a1, a2, a3); });
        }
      }

      cls.installModel(this);

      return cls;
    },

    function start() {
      /* Start the bootstrap process. */

      var buildClass = this.buildClass;

      // Will be replaced in phase2.
      foam.CLASS = function(m) {
        m.id = m.package + '.' + m.name;
        var cls = buildClass.call(m);

        foam.assert(
          ! m.refines,
          'Refines is not supported in early bootstrap');

        foam.register(cls);

        // Register the class in the global package path.
        foam.package.registerClass(cls);

        return cls;
      };
    },

    /** Start second phase of bootstrap process. */
    function phase2() {
      // Upgrade to final CLASS() definition.
      /* Creates a Foam class from a plain-old-object definition:
          (1) Determine the class of model for the new class's model;
          (2) Construct and validate the new class's model;
          (3) Construct and validate the new class.
          @method CLASS
          @memberof module:foam */
      foam.CLASS = function(m, skipRegistration) {
        var cls   = m.class ? foam.lookup(m.class) : foam.core.Model;
        var model = cls.create(m);
        model.validate();
        // cls was: class-for-model-construction;
        // cls is: class-constructed-from-model.
        cls = model.buildClass();
        cls.validate();

        if ( skipRegistration ) return cls;

        if ( ! m.refines ) {
          // Register class in global context.
          foam.register(cls);

          // Register the class in the global package path.
          foam.package.registerClass(cls);
        } else {
          // Register refinement id in global context.
          // If duplicate names are being registered and the system complains,
          // find the offending refinement and give it a package and name.
          foam.register(cls, model.id);
        }

        return cls;
      };

      // Upgrade existing classes to real classes.
      for ( var key in foam.core ) {
        var m = foam.lookup(key).model_;

        // classModel.buildClass() expects 'refines' if we are upgrading an
        // existing class.
        m.refines = m.id;

        foam.CLASS(m, true);
      }
    },

    function phase3() {
      // Substitute foam.core.installModel() with simpler axiom-only version.
      foam.core.FObject.installModel = function installModel(m) {
        if ( m.source ) m.axioms_.forEach(function(a) { a.source = m.source; });
        this.installAxioms(m.axioms_);
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

      delete foam.boot;

      console.log('core boot time: ', Date.now() - this.startTime);
    }
  ]
});


foam.boot.start();
