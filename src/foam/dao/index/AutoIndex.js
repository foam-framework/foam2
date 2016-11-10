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
    'foam.dao.index.LazyAltIndex',
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
        if ( this.lazy ) {
          return this.LazyAltIndex.create({ delegateFactories: [ this.idIndexFactory ] });
        } else {
          return this.AltIndex.create({ delegateFactories: [ this.idIndexFactory ] });
        }
      }
    },
    {
      name: 'previousPlanFor',
      factory: function() { return {}; }
    },
    {
      class: 'Boolean',
      name: 'lazy',
      value: ( global.window && global.window.location.href.indexOf('lazy') > -1 ) //HACK remove
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
      if ( ! this.lazy ) {
        if ( root.size() > this.PoliteIndex.SMALL_ENOUGH_SIZE ) {
          index = this.PoliteIndex.create({ delegateFactory: index });
        }
        this.delegateFactory.addIndex(index, root);
      } else {
        console.assert(this.progenitor, "Must call addIndex() on AutoIndex instance if in lazy mode");
        this.delegate.addIndex(index, root);
      }
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

      if ( this.size() < this.GOOD_ENOUGH_PLAN ||
           ! order &&
           ( ! predicate ||
             this.True.isInstance(predicate) ||
             this.False.isInstance(predicate)
           )
         ) {
        return this.delegate.plan(sink, skip, limit, order, predicate, root);
      }

      var ARBITRARY_INDEX_CREATE_FACTOR = 1.5;
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
      if ( this.lazy ||
           ( ! prev.sink && ! prev.skip && ! prev.limit && ! prev.order &&
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
console.log(self.$UID, "AutoEst OLD:", bestCost, this.delegate.toString().substring(0,20));
        if ( bestCost < this.GOOD_ENOUGH_PLAN ) {
          return this.delegate.plan(sink, skip, limit, order, predicate, root);
        }

        if ( predicate ) {
          var candidate = predicate.toIndex(
            this.cls_.create({ idIndexFactory: this.idIndexFactory }));
          if ( candidate ) {
            var candidateCost = candidate.estimate(this.delegate.size(), sink,
              skip, limit, order, predicate)
              * ARBITRARY_INDEX_CREATE_FACTOR
              + ARBITRARY_INDEX_CREATE_CONSTANT;

console.log(self.$UID, "AutoEst PRD:", candidateCost, candidate.toString().substring(0,20));
            //TODO: must beat by factor of X? or constant?
            if ( bestCost > candidateCost ) {
              newIndex = candidate;
              bestCost = candidateCost;
            }
          }
        }

        // TODO: order cost will always be the same, don't bother asking!...
        //  Except: the order index.estimate gets the order AND predicate,
        //   so the predicate might make this index worse
        if ( order ) {
          var candidate = order.toIndex(
            this.cls_.create({ idIndexFactory: this.idIndexFactory }));
          if ( candidate ) {
            var candidateCost = candidate.estimate(this.delegate.size(), sink,
              skip, limit, order, predicate)
              * ARBITRARY_INDEX_CREATE_FACTOR
              + ARBITRARY_INDEX_CREATE_CONSTANT;
console.log(self.$UID, "AutoEst ORD:", candidateCost, candidate.toString().substring(0,20));
            if ( bestCost > candidateCost ) {
              newIndex = candidate;
              bestCost = candidateCost;
            }
          }
        }
      }

      if ( newIndex ) {
        return this.CustomPlan.create({
          cost: bestCost,
          customExecute: function autoIndexAdd(apromise, asink, askip, alimit, aorder, apredicate) {

console.log(self.$UID, "BUILDING INDEX", bestCost, newIndex.toString());
console.log(self.$UID, "ROOT          ", root.progenitor.toString(), "\n\n");

            // TODO: PoliteIndex sometimes when ordering?
            //  NOTE: revise this note in case of LazyAltIndex
            //  When ordering, the cost of sorting will depend on the total
            //  size of the DAO (index create cost) versus the size of the
            //  result set at this index node. It might be cheap enough to
            //  async create the index and let the current sort happen the
            //  hard way, or it could be worthwhile to just wait
            //  for the new index that supports the sort.
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



