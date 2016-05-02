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

  methods: [
    function installInClass(cls) {
      var instance;
      var oldCreate = cls.create;
      cls.create = function() {
        return instance || ( instance = oldCreate.apply(this, arguments) );
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
      // TODO: swith to 'properties' and add support
      // for compound keys.
      name: 'property'
    }
  ],

  methods: [
    function installInClass(cls) {
      var instances = {};
      var property = this.property;
      var oldCreate = cls.create;
      cls.create = function(args) {
        var key = args[property];
        return instances[key] || ( instances[key] = oldCreate.apply(this, arguments) );
      }
    },
    function clone() { return this; },
    function equals(other) { return other === this; }
  ]
});


/** Causes an class to pool its instances. create() will pull from the pool,
 and destroy() will return instances to the pool. Object pools can be found
 in <code>foam.__objectPools__</code>. */
foam.CLASS({
  package: 'foam.pattern',
  name: 'Pooled',
  axioms: [ foam.pattern.Singleton.create() ],
  requires: [ 'foam.core.Method' ],

  properties: [
    {
      name: 'pooledClasses',
      factory: function() { return {}; }
    }
  ],

  methods: [
    /** Frees up any retained objects in all object pools. */
    function clearPools() {
      for ( var key in this.pooledClasses ) {
        if ( key.__objectPool__ ) key.__objectPool__ = [];
      }
    },

    function installInClass(cls) {
      // Keeping the object pools in an accessible location allows them
      // to be cleared out.
      this.pooledClasses[cls] = true;

      if ( ! cls.__objectPool__ ) cls.__objectPool__ = [];

      var oldCreate = cls.create;
      cls.create = function(args, X) {
        var nu;
        var pool = this.__objectPool__;
        // Pull from the pool, run the usual init process that .create() would
        // do. TODO: Alter create to accept the base object so we don't duplicate
        // this init code?
        if ( pool.length ) {
          nu = pool[pool.length - 1];
          --pool.length
          nu.destroyed = false;
          nu.initArgs(args, X);
          nu.init && nu.init();
        } else {
          nu = oldCreate.apply(this, arguments);
        }
        return nu;
      }

      cls.installAxiom(this.Method.create({
        name: 'destroy',
        code: function() {
          if ( this.destroyed ) return;

          // Run destroy process on the object, but leave its privates empty but intact
          // to avoid reallocating them
          var inst_ = this.instance_;
          var priv_ = this.private_;

          this.SUPER.apply(this, arguments);

          for ( var ikey in inst_ ) delete inst_[ikey];
          for ( var pkey in priv_ ) delete priv_[pkey];
          this.instance_ = inst_;
          this.private_ = priv_;

          // put the empty husk into the pool
          this.cls_.__objectPool__.push(this);
        }
      }));
    }
  ]
});
