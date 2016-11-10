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

// TODO: Implement Hetergenious AltIndex to allow incomplete AutoIndexing

// TODO: Consider giving predicates an estimate as well: if an index arrives at
//   ValueIndex, and still must evaluate remaining predicates on each value, the
//   estimated cost may be greater than one for things like CONTAINS, spatial
//   mlangs like WITHIN_RADIUS, or full-text searching. If an index had processed
//   those predicates earlier in the chain, the cost would be much less than a
//   scan-and-filter-all. Default estimate of 1 would be fine for most simple
//   comparison predicates.

foam.CLASS({
  package: 'foam.dao.index',
  name: 'AltIndex',
  extends: 'foam.dao.index.Index',

  requires: [
    'foam.dao.index.NoPlan',
    'foam.mlang.sink.NullSink',
  ],

  constants: {
    /** Maximum cost for a plan which is good enough to not bother looking at the rest. */
    GOOD_ENOUGH_PLAN: 10 // put to 10 or more when not testing
  },

  properties: [
    {
      /** delegate factories */
      name: 'delegateFactories',
      factory: function() { return []; }
    },
    {
      /** the delegate instances for each Alt instance */
      class: 'foam.pattern.progenitor.PerInstance',
      name: 'delegates',
      factory: function() {
        var delegates = [];
        for ( var i = 0; i < this.delegateFactories.length; i++ ) {
          delegates[i] = this.delegateFactories[i].spawn();
        }
        return delegates;
      }
    },
  ],

  methods: [

    function addIndex(index, root) {
      // assert(root)
      // assert( ! index.progenitor )
      // This should be called on the factory, not an instance
      var self = this.progenitor || this;

      self.delegateFactories.push(index);

      function addIndexTo(altInst) {
        // Populate the new index
        var newSubInst = index.spawn();
        altInst.plan(newSubInst).execute([], newSubInst);
        altInst.delegates.push(newSubInst);
        return altInst;
      }

      if ( root === this || root.progenitor === this ) {
        // if we are the root, just call addIndexTo immediately
        addIndexTo(root);
      } else {
        // find all delegates created by this factory, addIndexTo them
        root.mapOver(addIndexTo, self);
      }
    },

    function bulkLoad(a) {
      for ( var i = 0 ; i < this.delegates.length ; i++ ) {
        this.delegates[i].bulkLoad(a);
      }
    },

    function get(key) {
      return this.delegates[0].get(key);
    },

    function getAltForOrderDirs(order, cache) {
      var delegates = this.delegates;
      if ( ! order ) return delegates[0];

      var t = cache[this];
      // if no cached index number, check our delegateFactories the best
      // estimate, considering only ordering
      if ( ! foam.Number.isInstance(t) ) {
        var delegateFactories = this.delegateFactories;
        var bestEst = Number.MAX_VALUE;
        var nullSink = this.NullSink.create();
        var est;
        var t = -1;
        for ( var i = 0; i < delegateFactories.length; i++ ) {
          est = delegateFactories[i].estimate(1000, nullSink, undefined, undefined, order);
          if ( bestEst > est ) {
            t = cache[this] = i;
            bestEst = est;
          }
        }
      }
      return delegates[t];
    },

    function select(sink, skip, limit, order, predicate, cache) {
      // find and cache the correct subindex to use
      this.getAltForOrderDirs(order, cache)
        .select(sink, skip, limit, order, predicate, cache);
    },

    function mapOver(fn, ofIndex) {
      for ( var i = 0 ; i < this.delegates.length ; i++ ) {
        if ( this.delegateFactories[i] == ofIndex) {
          this.delegates[i] = fn(this.delegates[i]);
        } else {
          this.delegates[i].mapOver(fn, ofIndex);
        }
      }
    },

    function put(newValue) {
      for ( var i = 0 ; i < this.delegates.length ; i++ ) {
        this.delegates[i].put(newValue);
      }
    },

    function remove(obj) {
      for ( var i = 0 ; i < this.delegates.length ; i++ ) {
        this.delegates[i].remove(obj);
      }
    },

    /** Returns smallest estimate from the delegateFactories */
    function estimate(size, sink, skip, limit, order, predicate) {
      var cost = Number.MAX_VALUE;
      for ( var i = 0; i < this.delegateFactories.length; i++ ) {
        cost = Math.min(
          cost,
          this.delegateFactories[i].estimate(
            size, sink, skip, limit, order, predicate)
        );
      }
      return cost;
    },

    function plan(sink, skip, limit, order, predicate, root) {
      var bestPlan;
      //    console.log('Planning: ' + (predicate && predicate.toSQL && predicate.toSQL()));
      for ( var i = 0 ; i < this.delegates.length ; i++ ) {
        var plan = this.delegates[i].plan(sink, skip, limit, order, predicate, root);
        // console.log('  plan ' + i + ': ' + plan);
        if ( plan.cost <= this.GOOD_ENOUGH_PLAN ) {
          bestPlan = plan;
          break;
        }
        if ( ! bestPlan || plan.cost < bestPlan.cost ) {
          bestPlan = plan;
        }
      }
      //    console.log('Best Plan: ' + bestPlan);
      if ( ! bestPlan ) {
        return this.NoPlan.create();
      }
      return bestPlan;
    },

    function size() { return this.delegates[0].size(); },

    function toString() {
      return 'Alt([' + this.delegateFactories.join(',') + '])';
    },

    function toPrettyString(indent) {
      var ret = "";
      //ret += "  ".repeat(indent) + this.cls_.name + "([\n";
      for ( var i = 0; i < this.delegateFactories.length; i++ ) {
          ret += this.delegateFactories[i].toPrettyString(indent + 1);
      }
      //ret += "  ".repeat(indent) + "])\n";
      return ret;
    }
  ]
});
