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
      factory: function() { return []; },
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
    'foam.dao.FlowControl'
  ],

  methods: [
    /**
      Executes sub-plans, limiting results from each, then merges results,
      removes duplicates, sorts, skips, and limits.
    */
    function execute(promise, sink, skip, limit, order, predicate) {
      // quick linked list
      var NodeProto = { next: null, data: null };

      var head = Object.create(NodeProto);
      // TODO: track list size, cut off if above skip+limit

      var sp = this.subPlans;
      var predicates = predicate ? predicate.args : [];
      var subLimit = ( limit ? limit + ( skip ? skip : 0 ) : undefined );
      var compare = order ? order.compare.bind(order) : foam.util.compare;
      var promises = []; // track any async subplans
      //console.assert(predicates.length == sp.length);

      // Each plan inserts into the list
      for ( var i = 0 ; i < sp.length ; ++i) {
        // reset new insert position to head
        var insertAfter = head;
        // TODO: refactor with insertAfter as a property of a new class
        var insertPlanSink = foam.dao.QuickSink.create({
          putFn: function(o) {
            // o may be larger or equal to insertAfter.data. Equality is only
            //  checked on the property being ordered, so a deduplicating
            //  FObject.equals check ensures the exact same object is not
            //  inserted twice.
            while ( ( ! insertAfter.data ) ||
                    ( compare(o, insertAfter.data) >= 0 &&
                       ! foam.core.FObject.equals(o, insertAfter.data) ) ) {
              var next = insertAfter.next;
              // if end-of-list or found a larger item, insert
              if ( ( ! next ) || compare(o, next.data) < 0 ) {
                var nu = Object.create(NodeProto);
                nu.next = insertAfter.next;
                nu.data = o;
                insertAfter.next = nu;
                insertAfter = nu;
                break; // insert done, next new item will put() again
              } else {
                // New item is larger, move forward in the list and
                //   try again
                insertAfter = next;
              }
            }
          }
        });
        // restart the promise chain, if a promise is added we collect it
        var nuPromiseRef = [];
        sp[i].execute(
          nuPromiseRef,
          insertPlanSink,
          undefined,
          subLimit,
          order,
          predicates[i]
        );
        if ( nuPromiseRef[0] ) promises.push(nuPromiseRef[0]);
      }

      // result reading may by async, so define it but don't call it yet
      var resultSink = this.decorateSink_(sink, skip, limit);
      var fc = this.FlowControl.create();
      function scanResults() {
        // The list starting at head now contains the results plus possible
        //  overflow of skip+limit
        var node = head.next;
        while ( node && ( ! fc.stopped ) ) {
          resultSink.put(node.data, fc);
          node = node.next;
        }
      }

      // if there is an async index in the above, wait for it to finish
      //   before reading out the results.
      if ( promises.length ) {
        var thisPromise = Promise.all(promises).then(scanResults);
        // if an index above us is also async, chain ourself on
        promise[0] = promise[0] ? promise[0].then(thisPromise) : thisPromise;
      } else {
        // In the syncrhonous case we don't have to wait on our subplans,
        //  and can ignore promise[0] as someone else is responsible for
        //  waiting on it if present.
        scanResults();
      }
    },

    /** TODO: Share with AbstractDAO? We never need to use predicate or order
      @private */
    function decorateSink_(sink, skip, limit) {
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

      return sink;
    },

  ]
});

