/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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
  package: 'foam.dao.index',
  name: 'Plan',

  properties: [
    {
      name: 'cost',
      value: 0
    }
  ],

  methods: [
    function execute(promise, state, sink, skip, limit, order, predicate) {},
    function toString() { return this.cls_.name+"(cost="+this.cost+")"; }
  ]
});


/** Plan indicating that there are no matching records. **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'NotFoundPlan',
  extends: 'foam.dao.index.Plan',

  axioms: [ foam.pattern.Singleton.create() ],

  properties: [
    { name: 'cost', value: Number.MAX_VALUE }
  ],

  methods: [
    function toString() { return 'no-match(cost=0)'; }
  ]
});


/** Plan indicating that an index has no plan for executing a query. **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'NoPlan',
  extends: 'foam.dao.index.Plan',

  axioms: [ foam.pattern.Singleton.create() ],

  properties: [
    { name: 'cost', value: Number.MAX_VALUE }
  ],

  methods: [
    function toString() { return 'no-plan'; }
  ]
});


/** Convenience wrapper for indexes that want to create a closure'd function
    for each plan instance */
foam.CLASS({
  package: 'foam.dao.index',
  name: 'CustomPlan',
  extends: 'foam.dao.index.Plan',

  properties: [
    {
      class: 'Function',
      name: 'customExecute'
    },
    {
      class: 'Function',
      name: 'customToString'
    }
  ],

  methods: [
    function execute(promise, state, sink, skip, limit, order, predicate) {
      this.customExecute.call(
          this,
          promise,
          state,
          sink,
          skip,
          limit,
          order,
          predicate);
    },

    function toString() {
      return this.customToString.call(this);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao.index',
  name: 'CountPlan',
  extends: 'foam.dao.index.Plan',

  properties: [
    {
      class: 'Int',
      name: 'count'
    }
  ],

  methods: [
    function execute(promise, sink /*, skip, limit, order, predicate*/) {
      sink.value += this.count;
    },

    function toString() {
      return 'short-circuit-count(' + this.count + ')';
    }
  ]
});


foam.CLASS({
  package: 'foam.dao.index',
  name: 'AltPlan',
  extends: 'foam.dao.index.Plan',

  properties: [
    {
      name: 'subPlans',
      postSet: function(o, nu) {
        this.cost = 1;
        for ( var i = 0; i < nu.length; ++i ) {
          this.cost += nu[i].cost;
        }
      }
    },
    'prop'
  ],

  methods: [
    function execute(promise, sink, skip, limit, order, predicate) {
      var sp = this.subPlans;
      for ( var i = 0 ; i < sp.length ; ++i) {
        sp[i].execute(promise, sink, skip, limit, order, predicate);
      }
    },

    function toString() {
      return ( ! this.subPlans || this.subPlans.length <= 1 ) ?
        'IN(key=' + ( this.prop && this.prop.name ) + ', cost=' + this.cost + ', ' +
          ', size=' + ( this.subPlans ? this.subPlans.length : 0 ) + ')' :
        'lookup(key=' + this.prop && this.prop.name + ', cost=' + this.cost + ', ' +
          this.subPlans[0].toString();
    }
  ]
});

/**
  Merges results from multiple sub-plans and deduplicates, sorts, and
  filters the results.

  TODO: account for result sorting in cost?
*/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'MergePlan',
  extends: 'foam.dao.index.AltPlan',

  requires: [
    'foam.dao.DedupSink',
    'foam.dao.LimitedSink',
    'foam.dao.SkipSink',
    'foam.dao.OrderedSink',
  ],

  methods: [
    /**
      Executes sub-plans, limiting results from each, then merges results,
      removes duplicates, sorts, skips, and limits.
    */
    function execute(promise, sink, skip, limit, order, predicate) {
      // TODO: Investigate pre-sorted results from subqueries being
      //   zipped together quickly

      var resultSink = this.DedupSink.create({
        delegate: this.decorateSink_(sink, skip, limit, order)
      });

      var sp = this.subPlans;
      var predicates = predicate.args;
      var subLimit = ( limit ? limit + ( skip ? skip : 0 ) : undefined );
      //console.assert(predicates.length == sp.length);
      for ( var i = 0 ; i < sp.length ; ++i) {
        sp[i].execute(
          promise,
          resultSink,
          undefined,
          subLimit,
          order,
          predicates[i]
        );
      }
    },

    /** TODO: Share with AbstractDAO. We never need to use predicate.
      @private */
    function decorateSink_(sink, skip, limit, order) {
      if ( limit != undefined ) {
        sink = this.LimitedSink.create({
          limit: limit,
          delegate: sink
        });
      }
      if ( skip != undefined ) {
        sink = this.SkipSink.create({
          skip: skip,
          delegate: sink
        });
      }
      if ( order != undefined ) {
        sink = this.OrderedSink.create({
          comparator: order,
          delegate: sink
        });
      }

      return sink;
    },

  ]
});

