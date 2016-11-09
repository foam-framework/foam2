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
  Provides for hetergenious indexes, where not all potential delegates
  of this AltIndex actually get populated for each instance. Each instance
  always populates an ID index, so it can serve queries even if no
  delegate indexes are explicitly added.

  Factory: LazyAlt[ID, TreeA, TreeB]
  instances: [id, a,b], [id, a], [id, b], [id, a], [id]
*/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'LazyAltIndex',
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
      /** factory quick lookup*/
      name: 'delegateFactoryMap_',
      factory: function() { return {}; }
    },
    {
      /** the delegate instances for each Alt instance */
      class: 'foam.pattern.progenitor.PerInstance',
      name: 'delegates',
      factory: function() {
        return [ this.delegateFactories[0].spawn() ];
      }
    },
  ],

  methods: [

    function addIndex(index) {
      // assert( ! index.progenitor )
      // This method should be called on an instance
      
      // check for existing factory
      var indexKey = index.toString();
      if ( ! this.delegateFactoryMap_[indexKey] ) {
        this.delegateFactories.push(index);
        this.delegateFactoryMap_[indexKey] = index;
      } else {
        // ensure all tails are using the same factory instance
        index = this.delegateFactoryMap_[indexKey];        
      }

      var newSubInst = index.spawn();
      this.plan(newSubInst).execute([], newSubInst);
      this.delegates.push(newSubInst);
    },

    function bulkLoad(a) {
      for ( var i = 0 ; i < this.delegates.length ; i++ ) {
        this.delegates[i].bulkLoad(a);
      }
    },

    function get(key) {
      return this.delegates[0].get(key);
    },

    function getAltForOrderDirs(orderDirs) {
      // NOTE: this assumes one of the delegates is capable of ordering
      //  properly for a scan. We should not be asked for a select unless
      //  a previous estimate indicated one of our options was sorted properly.
      // TODO: will this even work? Tree asks for estimate to determine sortability,
      //  one of the Alt factories supports it. But if that delegate is missing on
      //  some of the results, they will fall back to ID index and not sort...
      var delegates = this.delegates;
      if ( ! orderDirs ) return delegates[0];

      var cache = orderDirs.tags[this];
      // if no cached index estimates, generate estimates
      // for each factory for this ordering
      if ( ! cache ) {
        var order = orderDirs.srcOrder;
        var nullSink = this.NullSink.create();
        var dfs = this.delegateFactories;
        var bestEst = Number.MAX_VALUE;
        // Pick the best factory for the ordering, cache it
        for ( var i = 0; i < dfs.length; i++ ) {
          var est = dfs[i].estimate(1000, nullSink, undefined, undefined, order);
          if ( est < bestEst ) {
            cache = dfs[i];
            bestEst = est;
          }
        }
        orderDirs.tags[this] = cache;
      }

      // check if we have a delegate instance for the best factory
      for ( var i = 0; i < delegates.length; i++ ) {
        // if we do, it's the best one
        if ( delegates[i].progenitor === cache ) return delegates[i];
      }
      
      // we didn't have the right delegate generated, so add and populate it
      // as per addIndex, but we skip checking the factory as we know it's stored
      var newSubInst = cache.spawn();
      this.plan(newSubInst).execute([], newSubInst);
      this.delegates.push(newSubInst);
      
      return newSubInst;
    },

    function select(sink, skip, limit, orderDirs, predicate) {
      // find and cache the correct subindex to use
      this.getAltForOrderDirs(orderDirs)
        .select(sink, skip, limit, orderDirs, predicate);
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
    }
  ]
});
