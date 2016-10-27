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
  A Singleton Axiom, when added to a Class, makes it implement
  the Singleton Pattern, meaning that all calls to create()
  will return the same (single) instance.
*/
foam.CLASS({
  package: 'foam.pattern',
  name: 'Singleton',

  properties: [
    [ 'name', 'Singleton' ]
  ],

  methods: [
    function installInClass(cls) {
      var oldCreate = cls.create;
      cls.create = function() {
        return this.private_.instance_ ||
            ( this.private_.instance_ = oldCreate.apply(this, arguments) );
      }
    },
    function clone() { return this; },
    function equals(other) { return other === this; }
  ]
});

// We only need one Singleton, so make it a Singleton.
foam.CLASS({
  refines: 'foam.pattern.Singleton',
  axioms: [ foam.pattern.Singleton.create() ]
});


/**
  A Multiton Axiom, when added to a Class, makes it implement
  the Multiton Pattern, meaning that calls to create() with
  the same value for the specified 'property', will return the
  same instance.
*/
foam.CLASS({
  package: 'foam.pattern',
  name: 'Multiton',

  properties: [
    {
      // FUTURE: switch to 'properties' to support multiple keys when/if needed.
      name: 'property'
    },
    [ 'name', 'Multiton' ]
  ],

  methods: [
    function installInClass(cls) {
      var property  = this.property;
      var oldCreate = cls.create;
      cls.create = function(args) {
        var instances = this.private_.instances ||
            ( this.private_.instances = {} );
        var key = args[property];
        return instances[key] || ( instances[key] = oldCreate.apply(this, arguments) );
      }
    },
    function clone() { return this; },
    function equals(other) { return other === this; }
  ]
});


/**
  Progenitors spawn many lightweight instances of themselves, sharing
  properties when indicated. Spawning an instance costs virtually nothing.
*/
foam.CLASS({
  package: 'foam.pattern',
  name: 'Progenitor',

  properties: [
    [ 'name', 'Progenitor' ]
//     {
//       /** An map of functions to apply when spawning each instance.
//         Keys with null will be pulled from args if available. */
//       name: 'protoFactories',
//       factory: function() { return Object.create(null); }
//     },
//     {
//       /** An map of functions to apply when spawning each instance.
//         Keys with null will be pulled from args if available. */
//       name: 'protoValues',
//       factory: function() { return Object.create(null); }
//     },
//     {
//       /** The keys of protoInits, to avoid 'for(key in protoInits)' */
//       name: 'protoValidProps_',
//       factory: function() { return []; }
//     },
  ],

  methods: [
    function installInClass(cls) {

      cls.installAxioms([
        foam.core.Method.create({
          name: 'spawn',
          code: function create(args) {
            var spawnProto = this.getProgenitorProto_();
            var c = Object.create(spawnProto);
            var defaults = spawnProto.propertyDefaults_;
            // init or copy properties
            if ( args ) {
              var props = defaults.protoValidProps_;
              for ( var i = 0; i < props.length; i++ ) {
                var prop = props[i];
                if ( args && ( args[prop] !== undefined ) ) {
                  c[prop] = args[prop];
                } else if ( defaults.protoFactories[prop] ) {
                  c[prop] = defaults.protoFactories[prop].call(this);
                }
              }
            } else {
              // no args, just run factories
              var props = defaults.protoFactoryProps_;
              for ( var i = 0; i < props.length; i++ ) {
                var prop = props[i];
                c[prop] = defaults.protoFactories[prop].call(this);
              }
            }
            // user defined init
            this.initInstance && this.initInstance.call(c);
            return c;
          }
        }),
        foam.core.Method.create({
          name: 'getProgenitorProto_',
          code: function() {
            var p = this.getPrivate_('progenitorPrototype_');
            if ( ! p ) {
              p = Object.create(this);

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

              // block non-instance functions
              p.getProgenitorProto_ = null;
              p.spawn = null;
              p.progenitor = this;
              p.clone = function() {
                return this.progenitor.spawn(this);
              }

              // block per-instance properties that might be accidentally set
              //   on the progenitor
              var props = pp.protoValidProps_;
              for ( var i = 0; i < props.length; i++ ) {
                var pName = props[i];
                p[pName] = pp.protoValues[pName];
              }
              this.setPrivate_('progenitorPrototype_', p);
            }
            return p;
          }
        }),
        foam.core.Method.create({
          name: 'describe',
          code: function() {
            if (  this.progenitor ) console.log("Spawn of progenitor", this.progenitor.$UID);
            this.SUPER();
          }
        }),
      ]);
    },
  ]

});

/**
  Indicates properties of a progenitor that belong to each spawned
  instance. Because these are plain untyped properties, they only have limited
  features available.
  'value can be used to set the default value, and factory.
*/
foam.CLASS({
  package: 'foam.pattern.progenitor',
  name: 'PerInstance',
  extends: 'foam.core.Property',

  requires: [ 'foam.pattern.Progenitor' ],

  // handled specially 'value', 'factory'
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

