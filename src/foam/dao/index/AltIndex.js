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

  Index: Alt[ID, TreeA, TreeB]
  IndexNodes: [id, a,b], [id, a], [id, b], [id, a], [id]
*/
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
      name: 'delegates',
      factory: function() { return []; }
    },
    {
      /** factory quick lookup */
      name: 'delegateMap_',
      factory: function() { return {}; }
    },
  ],

  methods: [

    /** Returns smallest estimate from the delegates */
    function estimate(size, sink, skip, limit, order, predicate) {
      var cost = Number.MAX_VALUE;
      for ( var i = 0; i < this.delegates.length; i++ ) {
        cost = Math.min(
          cost,
          this.delegates[i].estimate(
            size, sink, skip, limit, order, predicate)
        );
      }
      return cost;
    },

    function toPrettyString(indent) {
      var ret = "";
      for ( var i = 0; i < this.delegates.length; i++ ) {
          ret += this.delegates[i].toPrettyString(indent + 1);
      }
      return ret;
    },

    function toString() {
      return 'Alt([' + (this.delegates.join(',')) + '])';
    },
  ]
});

foam.CLASS({
  package: 'foam.dao.index',
  name: 'AltIndexNode',
  extends: 'foam.dao.index.IndexNode',

  properties: [
    {
      /** the delegate instances for each Alt instance */
      class: 'Simple',
      name: 'delegates'
    },
  ],

  methods: [
    function init() {
      this.delegates = this.delegates || [ this.creator.delegates[0].createNode() ];
    },

    function addIndex(index) {
      // check for existing factory
      var dfmap = this.creator.delegateMap_;
      var indexKey = index.toString();
      if ( ! dfmap[indexKey] ) {
        this.creator.delegates.push(index);
        dfmap[indexKey] = index;
      } else {
        // ensure all tails are using the same factory instance
        index = dfmap[indexKey];
      }

      var newSubInst = index.createNode();
      this.delegates[0].plan(newSubInst).execute([], newSubInst);
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

    function pickDelegate(order, cache) {
      // NOTE: this assumes one of the delegates is capable of ordering
      //  properly for a scan. We should not be asked for a select unless
      //  a previous estimate indicated one of our options was sorted properly.
      // NOTE: unbuilt portions of the index will be built immediately
      //  if picked for ordering.
      var delegates = this.delegates;
      if ( ! order ) return delegates[0];

      var c = cache[this];
      // if no cached index estimates, generate estimates
      // for each factory for this ordering
      if ( ! c ) {
        var nullSink = this.creator.NullSink.create();
        var dfs = this.creator.delegates;
        var bestEst = Number.MAX_VALUE;
        // Pick the best factory for the ordering, cache it
        for ( var i = 0; i < dfs.length; i++ ) {
          var est = dfs[i].estimate(1000, nullSink, undefined, undefined, order);
          if ( est < bestEst ) {
            c = dfs[i];
            bestEst = est;
          }
        }
        cache[this] = c;
      }

      // check if we have a delegate instance for the best factory
      for ( var i = 0; i < delegates.length; i++ ) {
        // if we do, it's the best one
        if ( delegates[i].creator === c ) return delegates[i];
      }

      // we didn't have the right delegate generated, so add and populate it
      // as per addIndex, but we skip checking the factory as we know it's stored
      var newSubInst = c.createNode();
      this.delegates[0].plan(newSubInst).execute([], newSubInst);
      this.delegates.push(newSubInst);

      return newSubInst;
    },


    function select(sink, skip, limit, order, predicate, cache) {
      // find and cache the correct subindex to use
      this.pickDelegate(order, cache)
        .select(sink, skip, limit, order, predicate, cache);
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

    function plan(sink, skip, limit, order, predicate, root) {
      var bestPlan;
      for ( var i = 0 ; i < this.delegates.length ; i++ ) {
        var p = this.delegates[i].plan(sink, skip, limit, order, predicate, root);
        if ( p.cost <= this.creator.GOOD_ENOUGH_PLAN ) {
          bestPlan = p;
          break;
        }
        if ( ! bestPlan || p.cost < bestPlan.cost ) {
          bestPlan = p;
        }
      }
      if ( ! bestPlan ) {
        return this.creator.NoPlan.create();
      }
      return bestPlan;
    },

    function size() { return this.delegates[0].size(); },

    function toString() {
      return 'Alt([' + (this.creator.delegates.join(',')) + this.size() + '])';
    },
  ]
});
