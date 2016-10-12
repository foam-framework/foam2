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
      return Number.MAX_VALUE;
    }
  ]
});

foam.CLASS({
  refines: 'foam.dao.index.TreeIndex',

  methods: [
    function estimate(size, sink, skip, limit, order, predicate) {
      // small sizes don't matter
      if ( size <= 16 ) return Math.log(size) / Math.log(2);

      predicate = predicate ? predicate.clone() : null;
      var property = this.prop;
      // TODO: validate this assumption:
      var nodeCount = Math.floor(size * 0.25); // tree node count will be a quarter the total item count

      // TODO: unify with TreeIndex.plan, but watch performance if dropping
      //   isExprMatch's closure
      var isExprMatch = function(model) {
        if ( ! model ) return undefined;
        if ( predicate ) {
          if ( model.isInstance(predicate) && predicate.arg1 === property ) {
            var arg2 = predicate.arg2;
            predicate = undefined;
            return arg2;
          }
          if ( this.And.isInstance(predicate) ) {
            for ( var i = 0 ; i < predicate.args.length ; i++ ) {
              var q = predicate.args[i];
              if ( model.isInstance(q) && q.arg1 === property ) {
                predicate.args[i] = this.True.create();
                predicate = predicate.partialEval();
                if (  this.True.isInstance(predicate) ) predicate = undefined;
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
        return subEstimate() * arg2.length;
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
        // if sorting required, add the sort cost
        if ( ! order === property &&
             ! ( index.Desc.isInstance(order) && order.arg1 === property ) ) {
          if ( cost > 0 ) cost *= Math.log(cost) / Math.log(2);
        }
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
    function estimate(size, sink, skip, limit, order, predicate) {


      return this.delegates[0].estimate(
        size, sink, skip, limit, order, predicate
      );
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
  ],

  properties: [
    {
      /** Used to create the delegate ID index for new instances of AutoIndex */
      name: 'idIndexFactory',
      required: true
    },
    {
      name: 'delegateFactory_',
      factory: function() {
        return this.AltIndex.create({ delegates: [ this.idIndexFactory ] });
      }
    }
  ],

  methods: [
    function initInstance() {
      this.delegate = this.delegateFactory_.spawn();
    },

    function addPropertyIndex(prop, root) {
      this.addIndex(prop.toIndex(this.cls_.create({ idIndexFactory: this.idIndexFactory })), root);
    },
    function addIndex(index, root) {
      this.delegate.addIndex(index, root);
    },
    // TODO: mlang comparators should support input collection for
    //   index-building cases like this
    function plan(sink, skip, limit, order, predicate, root) {
      var index = this;
      var existingPlan = this.delegate.plan(sink, skip, limit, order, predicate, root);
      var bestCost = existingPlan.cost;

      var newIndex;
      if ( predicate ) {
        var candidate = predicate.toIndex(this.cls_.create({ idIndexFactory: this.idIndexFactory }));
        var candidateCost = candidate.estimate(this.delegate.size(), sink, skip, limit, order, predicate);
        //TODO: must beat by factor of X? or constant?
        if ( bestCost > candidateCost ) {
          newIndex = candidate;
          bestCost = candidateCost;
        }
      }

      if ( order ) {
        var candidate = order.toIndex(this.cls_.create({ idIndexFactory: this.idIndexFactory }));
        var candidateCost = candidate.estimate(this.delegate.size(), sink, skip, limit, order, predicate);
        if ( bestCost > candidateCost ) {
          newIndex = candidate;
          bestCost = candidateCost;
        }
      }

      if ( newIndex ) {
        return this.CustomPlan.create({
          cost: bestCost, // TODO: add some construction cost? reduce over time to simulate amortization?
          customExecute: function autoIndexAdd(apromise, asink, askip, alimit, aorder, apredicate) {
            // TODO: use promise to async delay when loading slowly
            // TODO: could be a long operation, PoliteIndex to delay load?
            index.addIndex(newIndex);
            // avoid a recursive call by hitting delegate, should pick the new optimal index
            this.delegate
              .plan(sink, skip, limit, order, predicate, root)
              .execute(apromise, asink, askip, alimit, aorder, apredicate);
          }
        });
      } else {
        return existingPlan;
      }
    },

    function toString() {
      return 'AutoIndex()';
    },

  ]
});



