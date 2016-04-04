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

foam.CLASS({
  package: 'foam.pattern',
  name: 'With',
  axioms: [ foam.pattern.Singleton.create() ],
  methods: [
    {
      name: 'with',
      code: function(f, opt_source) {
        opt_source = opt_source || this;
        var argNames = foam.fn.argsArray(f);
        var args = [];
        for ( var i = 0 ; i < argNames.length ; i++ ) {
          var a = opt_source[argNames[i]];
          if ( typeof a === "function" ) a = a.bind(opt_source);
          args.push(a);
        }
        return f.apply(this, args);
      }
    }
  ]
});

/** Causes an class to pool its instances. create() will pull from the pool,
 and destroy() will return instances to the pool. Object pools can be found
 in <code>foam.__objectPools__</code>. */
foam.CLASS({
  package: 'foam.pattern',
  name: 'Pooled',
  axioms: [ foam.pattern.Singleton.create() ],

  methods: [
    function installInClass(cls) {
      // Keeping the object pools in an accessible location allows them
      // to be cleared out.
      if ( ! foam.__objectPools__ ) { foam.__objectPools__ = {}; }
      var pool = foam.__objectPools__[cls];
      if ( ! pool ) {
        pool = foam.__objectPools__[cls] = [];
      }

      var oldCreate = cls.create;
      cls.create = function(args, X) {
        var nu;
        // Pull from the pool, run the usual init process that .create() would
        // do. TODO: Alter create to accept the base object so we don't duplicate
        // this init code?
        if ( pool.length ) {
          nu = pool.splice(-1, 1)[0];
          nu.destroyed = false;
          nu.initArgs(args, X);
          nu.init && nu.init();
        } else {
          nu = oldCreate.apply(this, arguments);
        }
        return nu;
      }

      var oldDestroy = cls.prototype.destroy;
      cls.prototype.destroy = function() {
        if ( this.destroyed ) return;

        // Run destroy process on the object, but leave its privates empty but intact
        // to avoid reallocating them
        var inst_ = this.instance_;
        var priv_ = this.private_;

        oldDestroy.apply(this, arguments);

        for ( var ikey in inst_ ) { delete inst_[ikey]; }
        for ( var pkey in priv_ ) { delete priv_[pkey]; }
        this.instance_ = inst_;
        this.private_ = priv_;

        // put the empty husk into the pool
        pool.push(this);
      }
    },
  ]
});
