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

foam.CLASS({
  refines: 'foam.dao.index.Index',

  methods: [
    // TODO: estimate is a class (static) method. Declare as such when possible
    /** Estimates the performance of this index given the number of items
      it will hold and the planned parameters. */
    function estimate(size, sink, skip, limit, order, predicate) {
      return size * 2;
    }
  ]
});

foam.CLASS({
  refines: 'foam.dao.index.TreeIndex',

  methods: [
    function estimate(size, sink, skip, limit, order, predicate) {
      // small sizes don't matter
      if ( size <= 16 ) return Math.log(size) / Math.log(2);

      var self = this;
      predicate = predicate ? predicate.clone() : null;
      var property = this.prop;
      // TODO: validate this assumption:
      var nodeCount = Math.floor(size * 0.25); // tree node count will be a quarter the total item count

      // TODO: unify with TreeIndex.plan, but watch performance if dropping
      //   isExprMatch's closure
      var isExprMatch = function(model) {
        if ( ! model ) return undefined;
        if ( predicate ) {
          if ( model.isInstance(predicate) &&
              ( predicate.arg1 === property || foam.util.equals(predicate.arg1, property) )
          ){
            var arg2 = predicate.arg2;
            predicate = undefined;
            return arg2;
          }
          if ( self.And.isInstance(predicate) ) {
            for ( var i = 0 ; i < predicate.args.length ; i++ ) {
              var q = predicate.args[i];
              if ( model.isInstance(q) && q.arg1 === property ) {
                predicate.args[i] = self.True.create();
                predicate = predicate.partialEval();
                if (  self.True.isInstance(predicate) ) predicate = undefined;
                return q.arg2;
              }
            }
          }
        }
        return undefined;
      };
      var tailFactory = this.tailFactory;
      var subEstimate = ( tailFactory ) ? function() {
          return Math.log(nodeCount) / Math.log(2) +
            tailFactory.estimate(size / nodeCount, sink, skip, limit, order, predicate);
        } :
        function() { return Math.log(nodeCount) / Math.log(2); };

      var arg2 = isExprMatch(this.In);
      if ( arg2 ) {
        // tree depth * number of compares
        return subEstimate() * arg2.f().length;
      }

      arg2 = isExprMatch(this.Eq);
      if ( arg2 ) {
        // tree depth
        return subEstimate();
      }

      arg2 = isExprMatch(this.ContainsIC);
      if ( arg2 !== undefined ) ic = true;
      arg2 = arg2 || isExprMatch(this.Contains);
      if ( arg2 ) {
        // TODO: this isn't quite right. Tree depth * query string length?
        // If building a trie to help with this, estimate becomes easier.
        return subEstimate() * arg2.f().length;
      }

      // These cases are just slightly better scans, but we can't estimate
      //   how much better...
      //       arg2 = isExprMatch(this.Gt);
      //       arg2 = isExprMatch(this.Gte);
      //       arg2 = isExprMatch(this.Lt);
      //       arg2 = isExprMatch(this.Lte);

      var cost = size;

      // Ordering
      if ( order ) {
        var ordProp = this.Property.isInstance(order) ? order : order.arg1;

        // if sorting required, add the sort cost
        if ( ordProp !== property ) {
          if ( cost > 0 ) cost *= Math.log(cost) / Math.log(2);
        }

        cost += tailFactory.estimate(size / nodeCount, sink, skip, limit,
          order.tailOrder(), predicate);
      }

      return cost;
    }
  ]
});

foam.CLASS({
  refines: 'foam.dao.index.ValueIndex',

  methods: [
    function estimate(size, sink, skip, limit, order, predicate) {
      return 1;
    }
  ]
});

// Note: ProxyIndex can't estimate() statically. Specific types of proxy that
// know their sub-index factory can implement it.

foam.CLASS({
  refines: 'foam.dao.index.AltIndex',

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
    }
  ]
});

/** An Index which adds other indices as needed. **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'AutoIndex',
  extends: 'foam.dao.index.ProxyIndex',

  requires: [
    'foam.core.Property',
    'foam.dao.index.NoPlan',
    'foam.dao.index.CustomPlan',
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.Or',
    'foam.dao.index.AltIndex',
    'foam.dao.index.ValueIndex',
    'foam.mlang.predicate.True',
    'foam.mlang.predicate.False',
    'foam.dao.index.PoliteIndex',
  ],

  constants: {
    /** Maximum cost for a plan which is good enough to not bother looking at the rest. */
    GOOD_ENOUGH_PLAN: 20
  },

  properties: [
    {
      /** Used to create the delegate ID index for new instances of AutoIndex */
      name: 'idIndexFactory',
      required: true
    },
    {
      name: 'delegateFactory',
      factory: function() {
        return this.AltIndex.create({ delegates: [ this.idIndexFactory ] });
      }
    },
    {
      name: 'inertia',
      value: 0,
      preSet: function(old, nu) {
        return Math.max(nu, 0);
      }
    },
    {
      name: 'previousPlanFor',
      factory: function() { return {}; }
    }
  ],

  methods: [
    function estimate(size, sink, skip, limit, order, predicate) {
      return this.delegateFactory.estimate(size, sink, skip, limit, order, predicate);
    },

    function addPropertyIndex(prop, root) {
      this.addIndex(prop.toIndex(this.cls_.create({ idIndexFactory: this.idIndexFactory })), root);
    },
    function addIndex(index, root) {
      // Use PoliteIndex if this DAO is big
      if ( root.size() > this.PoliteIndex.SMALL_ENOUGH_SIZE ) {
        index = this.PoliteIndex.create({ delegateFactory: index });
      }
      this.delegateFactory.addIndex(index, root);
    },
    function put(val) {
      this.inertia++;
      this.delegate.put(val);
    },
    function remove(val) {
      this.inertia--;
      this.delegate.remove(val);
    },

    // TODO: mlang comparators should support input collection for
    //   index-building cases like this
    function plan(sink, skip, limit, order, predicate, root) {
      // NOTE: Using the existing index's plan as its cost when comparing
      //  against estimates is bad. An optimistic estimate from an index
      //  will cause it to always appear better than its real world
      //  performance, leading AutoIndex to keep creating new instances
      //  of the offending index. Comparing estimates to estimates is much
      //  more consistent and allows estimate() to be arbitrarily bad
      //  as long as it is indicative of relative performance of each
      //  index type.

      if ( ! order &&
           ( ! predicate ||
             this.True.isInstance(predicate) ||
             this.False.isInstance(predicate)
           )
         ) {
        return this.delegate.plan(sink, skip, limit, order, predicate, root);
      }

      var ARBITRARY_INDEX_CREATE_FACTOR = 2.0;
      var ARBITRARY_INDEX_CREATE_CONSTANT = 10; // this.inertia;

      // TODO: root.size() is the size of the entire DAO, and representative
      //   of the cost of creating a new index.

      var self = this;

      var newIndex;

      // NOTE: If this plan() was triggered by an AltPlan, there will
      //  be multiple concurrent AutoIndex autoIndexAdd plans executing
      //  to add effectively the same new index.

      // if we haven't been called yet for this particular query
      // (if our parent is sub-planning, we will be called on to plan
      //  multiple times for the same query)
      var prev = this.progenitor.previousPlanFor;
      if ( ( ! prev.sink && ! prev.skip && ! prev.limit && ! prev.order &&
            ! prev.predicate && ! prev.root ) ||
           ( sink      !== prev.sink ||
             skip      !== prev.skip ||
             limit     !== prev.limit ||
             order     !== prev.order ||
             predicate !== prev.predicate ||
             root      !== prev.root )
      ) {
        prev.sink = sink;
        prev.skip = skip;
        prev.limit = limit;
        prev.order = order;
        prev.predicate = predicate;
        prev.root = root;

        var bestCost = this.delegate.estimate(this.delegate.size(), sink, skip, limit, order, predicate);
//console.log(self.$UID, "AutoEst OLD:", bestCost, this.delegate.toString().substring(0,20));
        if ( bestCost < this.GOOD_ENOUGH_PLAN ) {
          return this.delegate.plan(sink, skip, limit, order, predicate, root);
        }

        if ( predicate ) {
          var candidate = predicate.toIndex(this.cls_.create({ idIndexFactory: this.idIndexFactory }));
          if ( candidate ) {
            var candidateCost = candidate.estimate(this.delegate.size(), sink,
              skip, limit, order, predicate)
              * ARBITRARY_INDEX_CREATE_FACTOR
              + ARBITRARY_INDEX_CREATE_CONSTANT;

//console.log(self.$UID, "AutoEst PRD:", candidateCost, candidate.toString().substring(0,20));
            //TODO: must beat by factor of X? or constant?
            if ( bestCost > candidateCost ) {
              newIndex = candidate;
              bestCost = candidateCost;
            }
          }
        }

        if ( order ) {
          var candidate = order.toIndex(this.cls_.create({ idIndexFactory: this.idIndexFactory }));
          if ( candidate ) {
            var candidateCost = candidate.estimate(this.delegate.size(), sink,
              skip, limit, order, predicate)
              * ARBITRARY_INDEX_CREATE_FACTOR
              + ARBITRARY_INDEX_CREATE_CONSTANT;
//console.log(self.$UID, "AutoEst ORD:", candidateCost, candidate.toString().substring(0,20));
            if ( bestCost > candidateCost ) {
              newIndex = candidate;
              bestCost = candidateCost;
            }
          }
        }
      }
//       else {
// console.log(this.$UID, "Dupe reject");
//       }
//       this.inertia *= 0.75;

      if ( newIndex ) {
        return this.CustomPlan.create({
          cost: bestCost,
          customExecute: function autoIndexAdd(apromise, asink, askip, alimit, aorder, apredicate) {
console.log(self.$UID, "BUILDING INDEX", bestCost, newIndex.toString());
console.log(self.$UID, "ROOT          ", root.progenitor.toString(), "\n\n");

            // TODO: PoliteIndex sometimes when ordering?
            //  When ordering, the cost of sorting will depend on the total
            //  size of the DAO (index create cost) versus the size of the
            //  result set at this index node. It might be cheap enough to
            //  async create the index and let the current sort happen the
            //  hard way, or it could be worthwhile to just wait
            //  for the new index that supports the sort.
            self.inertia = root.size(); // reset inertia
            self.addIndex(newIndex, root);
            // avoid a recursive call by hitting delegate, should pick the new optimal index
            self.delegate
              .plan(sink, skip, limit, order, predicate, root)
              .execute(apromise, asink, askip, alimit, aorder, apredicate);
          }
        });
      } else {
        return this.delegate.plan(sink, skip, limit, order, predicate, root);
      }
    },

    function toString() {
      return 'AutoIndex(' + this.delegateFactory.toString() + ')';
    },

  ]
});



