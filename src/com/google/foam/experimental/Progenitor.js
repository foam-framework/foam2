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

// TODO: this will change, LightweightFactory? Potential changes to proto
//   and management thereof. In the end this just models native javascript
//   objects in a one-level proto heirarchy.

// NOTE the requirements of these lightweights:

// - A factory that can create them at close to zero cost

// - Each instance needs a reference to its factory (important for
//     hetergeneous indexes)

// - Using a different name for the factory's creation method (such as spawn())
//     eliminates confusion when dealing with both:
//       someFac.create().spawn() -> definitely a spawned instance
//       someFac.create().create() -> confusing
//       classOrFactory.create() -> what did I just make

/**
  Progenitors spawn many lightweight instances of themselves, sharing
  properties when indicated. Spawning an instance costs virtually nothing,
  only depending on the number of user defined PerInstance properties
  with factories.

  To use, add the Progenitor axiom to your class and specify normal (shared)
  properties and PerInstance properties. Note that you can't set types
  or other useful postSet/expression/required attributes on PerInstance
  properties, only 'value' and 'factory' to initialize them:

  <code>
  foam.CLASS({
    package: 'myPackage',
    name: 'ProgClass',

    axioms: [ foam.pattern.Progenitor.create() ],

    properties: [
      {
        class: 'foam.pattern.progenitor.PerInstance',
        name: 'first',
        value: 0
      },
      {
        class: 'foam.pattern.progenitor.PerInstance',
        name: 'second',
        factory: function() { return []; }
      },
      {
        class: 'String',
        name: 'sharedProp',
        adapt: function(old, nu) {
          return nu + "!";
        }
      }
    ]
  });
  </code>

  Then create a progenitor instance, and spawn lightweight instances from
  it:

  <code>
    // Create the progenitor, which is a full featured FObject:
    var prog = myPackage.ProgClass.create({ sharedProp: "Hello" });

    // Spawn lightweights quickly, but with limited features:
    var spawn1 = prog.spawn({ first: 3 });
    var spawn2 = prog.spawn();

    spawn1.first == 3;
    spawn2.first == 0;

    assert(spawn1.sharedProp == "Hello!");
    assert(spawn2.sharedProp == "Hello!");

    spawn1.sharedProp = "Bye";
    assert(spawn2.sharedProp == "Bye!");
  </code>
*/
foam.CLASS({
  package: 'foam.pattern',
  name: 'Progenitor',

  properties: [
    [ 'name', 'ProgenitorAxiom' ]
  ],

  constants: {
    // Avoid "SUPER" conflict by not putting this code inside installInClass
    DESCRIBE_FUNC: function describeSpawn() {
      if (  this.progenitor ) console.log("Spawn of progenitor", this.progenitor.$UID);
      this.SUPER();
    },

    GET_PROTO_FUNC: function getProgenitorProto_() {
      var p = this.getPrivate_('progenitorPrototype_');
      if ( ! p ) {
        p = { progenitor: this };

        // grab list of property values and factories
        var pp = {
          protoFactories: Object.create(null),
          protoValues:  Object.create(null),
          protoValidProps_: [].slice(),
          protoFactoryProps_: [].slice()
        }
        var props = this.cls_.getAxiomsByClass(foam.pattern.progenitor.PerInstance);
        for ( var i = 0; i < props.length; i++ ) {
          var prop = props[i];
          // TODO: generate a single function from strings?
          if ( prop.factory ) {
            pp.protoFactories[prop.name] = prop.factory;
            pp.protoFactoryProps_.push(prop.name);
          } else if ( prop.value ) {
            pp.protoValues[prop.name] = prop.value;
          }
          pp.protoValidProps_.push(prop.name);
        }
        p.propertyDefaults_ = pp;

        // TODO: separate the spawn methods from normal ones
        var methods = this.cls_.getAxiomsByClass(foam.core.Method);
        for ( var i = 0; i < methods.length; i++ ) {
          p[methods[i].name] = methods[i].code;
        }

        this.setPrivate_('progenitorPrototype_', p);
      }
      return p;
    },

    SPAWN_FUNC: function spawn(args) {
      var spawnProto = this.getProgenitorProto_();
      var c = Object.create(spawnProto);
      var defaults = spawnProto.propertyDefaults_;
      // copy properties or run factories
      if ( args ) {
        var props = defaults.protoValidProps_;
        for ( var i = 0; i < props.length; i++ ) {
          var prop = props[i];
          if ( args && ( args[prop] !== undefined ) ) {
            c[prop] = args[prop];
          } else if ( defaults.protoFactories[prop] ) {
            c[prop] = defaults.protoFactories[prop].call(c);
          }
        }
      } else {
        // no args, just run factories
        var props = defaults.protoFactoryProps_;
        for ( var i = 0; i < props.length; i++ ) {
          var prop = props[i];
          c[prop] = defaults.protoFactories[prop].call(c);
        }
      }
      // user defined init
      this.initInstance && this.initInstance.call(c);
      return c;
    }
  },

  methods: [
    function installInClass(cls) {

      cls.installAxioms([
        foam.core.Method.create({
          name: 'spawn',
          code: this.SPAWN_FUNC
        }),
        foam.core.Method.create({
          name: 'getProgenitorProto_',
          code: this.GET_PROTO_FUNC
        }),
        foam.core.Method.create({
          name: 'describe',
          code: this.DESCRIBE_FUNC
        }),
      ]);
    },
  ]

});

/**
  Indicates properties of a progenitor that belong to each spawned
  instance. Because these are plain untyped properties, they only have limited
  features available. Normal properties of a Progenitor are shared between
  spawned instances.

  'value' can be used to set the default value on the progenitor's instance
  prototype, and 'factory' can supply a function to run each time a new
  instance is spawned.
*/
foam.CLASS({
  package: 'foam.pattern.progenitor',
  name: 'PerInstance',
  extends: 'foam.core.Property',

  // Progenitor only accepts: 'value', 'factory'
  properties: [
    { name: 'adapt',       setter: function() { throw "PerInstance property does not support adapt() in " + this.name; } },
    { name: 'preSet',      setter: function() { throw "PerInstance property does not support preSet() in " + this.name; } },
    { name: 'assertValue', setter: function() { throw "PerInstance property does not support assertValue() in " + this.name; } },
    { name: 'postSet',     setter: function() { throw "PerInstance property does not support postSet() in " + this.name; } },
    { name: 'expression',  setter: function() { throw "PerInstance property does not support expression() in " + this.name; } },
    { name: 'getter',      setter: function() { throw "PerInstance property does not support getter() in " + this.name; } },
    { name: 'setter',      setter: function() { throw "PerInstance property does not support setter() in " + this.name; } },
    { name: 'final',       setter: function() { throw "PerInstance property does not support final() in " + this.name; } },
    { name: 'required',    setter: function() { throw "PerInstance property does not support required() in " + this.name; } },
  ],

  methods: [
    function installInProto() {
      // nop
    },
  ]
});

