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
    'foam.dao.index.ValueIndex',
    'foam.mlang.predicate.True',
    'foam.mlang.predicate.False',
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
        return this.AltIndex.create({ delegateFactories: [ this.idIndexFactory ] });
      }
    }
  ],

  methods: [
    function estimate(size, sink, skip, limit, order, predicate) {
      return this.delegateFactory.estimate(size, sink, skip, limit, order, predicate);
    },

    function addPropertyIndex(prop, root) {
      this.addIndex(prop.toIndex(this.progenitor.cls_.create({
        idIndexFactory: this.progenitor.idIndexFactory
      })), root);
    },
    function addIndex(index, root) {
      console.assert(this.progenitor, "Must call addIndex() on AutoIndex spawned instance.");
      this.delegate.addIndex(index, root);
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
      var existingPlan = this.delegate.plan(sink, skip, limit, order, predicate, root);
      var thisSize = this.size();

      // No need to try to auto-index if:
      //  The existing plan is better than scanning already TODO: how much better?
      //  We are too small to matter
      //  There are no order/predicate constraints to optimize for
      if ( existingPlan.cost < thisSize ||
           thisSize < this.progenitor.GOOD_ENOUGH_PLAN ||
           ! order &&
           ( ! predicate ||
             this.progenitor.True.isInstance(predicate) ||
             this.progenitor.False.isInstance(predicate)
           )
      ) {
        return existingPlan;
      }

      // add autoindex overhead
      existingPlan.cost += 10;

      var ARBITRARY_INDEX_CREATE_FACTOR = 1.5;
      var ARBITRARY_INDEX_CREATE_CONSTANT = 20;

      var self = this;
      var newIndex;

      var bestEstimate = this.delegate.progenitor.estimate(this.delegate.size(), sink, skip, limit, order, predicate);
//console.log(self.$UID, "AutoEst OLD:", bestEstimate, this.delegate.toString().substring(0,20), this.size());
      if ( bestEstimate < this.progenitor.GOOD_ENOUGH_PLAN ) {
        return existingPlan;
      }

      // Base planned cost on the old cost for the plan, to avoid underestimating and making this
      //  index build look too good
      var existingEstimate = bestEstimate;
      var idIndexFactory = this.progenitor.idIndexFactory;

      if ( predicate ) {
        var candidate = predicate.toIndex(
          this.progenitor.cls_.create({ idIndexFactory: idIndexFactory }));
        if ( candidate ) {
          var candidateEst = candidate.estimate(this.delegate.size(), sink,
            skip, limit, order, predicate)
            * ARBITRARY_INDEX_CREATE_FACTOR
            + ARBITRARY_INDEX_CREATE_CONSTANT;

//console.log(self.$UID, "AutoEst PRD:", candidateEst, candidate.toString().substring(0,20));
          //TODO: must beat by factor of X? or constant?
          if ( bestEstimate > candidateEst ) {
            newIndex = candidate;
            bestEstimate = candidateEst;
          }
        }
      }

      // TODO: order cost will always be the same, don't bother asking!...
      //  Except: the order index.estimate gets the order AND predicate,
      //   so the predicate might make this index worse
      if ( order ) {
        var candidate = order.toIndex(
          this.progenitor.cls_.create({ idIndexFactory: idIndexFactory }));
        if ( candidate ) {
          var candidateEst = candidate.estimate(this.delegate.size(), sink,
            skip, limit, order, predicate)
            * ARBITRARY_INDEX_CREATE_FACTOR
            + ARBITRARY_INDEX_CREATE_CONSTANT;
//console.log(self.$UID, "AutoEst ORD:", candidateEst, candidate.toString().substring(0,20));
          if ( bestEstimate > candidateEst ) {
            newIndex = candidate;
            bestEstimate = candidateEst;
          }
        }
      }


      if ( newIndex ) {
        // Since estimates are only valid compared to other estimates, find the ratio
        //  of our existing index's estimate to our new estimate, and apply that ratio
        //  to the actual cost of the old plan to determine our new index's assumed cost.
        var existingPlanCost = existingPlan.cost;
        var estimateRatio = bestEstimate / existingEstimate;

        return this.progenitor.CustomPlan.create({
          cost: existingPlanCost * estimateRatio,
          customExecute: function autoIndexAdd(apromise, asink, askip, alimit, aorder, apredicate) {

console.log(self.$UID, "BUILDING INDEX", existingPlanCost, estimateRatio, this.cost, predicate && predicate.toString());
//console.log(newIndex.toPrettyString(0));
//console.log(self.$UID, "ROOT          ");
//console.log(root.progenitor.toPrettyString(0));

            self.addIndex(newIndex, root);
            // Avoid a recursive call by hitting our delegate.
            // It should pick the new optimal index.
            self.delegate
              .plan(sink, skip, limit, order, predicate, root)
              .execute(apromise, asink, askip, alimit, aorder, apredicate);
          },
          customToString: function() { return "AutoIndexAdd cost=" + this.cost + ", " + newIndex.cls_.name; }
        });
      } else {
        return existingPlan;
      }
    },

    function toString() {
      return 'AutoIndex(' + (this.progenitor || this).delegateFactory.toString() + ')';
    },

    function toPrettyString(indent) {
      var ret = "";
      ret = "  ".repeat(indent) + "Auto(" + this.$UID + ")\n";
      ret += this.delegateFactory.toPrettyString(indent + 1);
      return ret;
    }

  ]
});



