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
    { name: 'cost', value: 0 }
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

  properties: [
    {
      class: 'Class',
      name: 'of',
      required: true
    }
  ],

  methods: [
    /**
      Executes sub-plans, limiting results from each, then merges results,
      removes duplicates, sorts, skips, and limits.
    */
    function execute(promise, sink, skip, limit, order, predicate) {
      if ( order ) return this.executeOrdered.apply(this, arguments);
      return this.executeFallback.apply(this, arguments);
    },

    function executeOrdered(promise, sink, skip, limit, order, predicate) {
      /**
       * Executes a merge where ordering is specified, therefore
       * results from the subPlans are also sorted, and can be merged
       * efficiently.
       */

      // quick linked list
      var NodeProto = { next: null, data: null };

      var head = Object.create(NodeProto);
      // TODO: track list size, cut off if above skip+limit

      var sp = this.subPlans;
      var predicates = predicate ? predicate.args : [];
      var subLimit = ( limit ? limit + ( skip ? skip : 0 ) : undefined );
      var promises = []; // track any async subplans
      var dedupCompare = this.of.ID.compare.bind(this.of.ID);
      // TODO: FIX In the case of no external ordering, a sort must be imposed
      //   (fall back to old dedupe sink impl?)
      var compare = order ? order.compare.bind(order) : foam.util.compare;

      // Each plan inserts into the list
      for ( var i = 0 ; i < sp.length ; ++i) {
        var insertPlanSink;
        (function() { // capture new insertAfter for each sink
          // set new insert position to head.
          // Only bump insertAfter forward when the next item is smaller,
          //   since we need to scan all equal items every time a new item
          //   comes in.
          // If the next item is larger, we insert before it
          //   and leave the insertion point where it is, so the next
          //   item can check if it is equal to the just-inserted item.
          var insertAfter = head;
          // TODO: refactor with insertAfter as a property of a new class?
          insertPlanSink = foam.dao.QuickSink.create({
            putFn: function(o) {
              function insert() {
                var nu = Object.create(NodeProto);
                nu.next = insertAfter.next;
                nu.data = o;
                insertAfter.next = nu;
              }

              // Skip past items that are less than our new item
              while ( insertAfter.next &&
                      compare(o, insertAfter.next.data) > 0 ) {
                 insertAfter = insertAfter.next;
              }

              if ( ! insertAfter.next ) {
                // end of list case, no equal items, so just append
                insert();
                return;
              } else if ( compare(o, insertAfter.next.data) === 0 ) {
                // equal items case, check for dupes
                // scan through any items that are equal, dupe check each
                var dupeAfter = insertAfter;
                while ( dupeAfter.next &&
                        compare(o, dupeAfter.next.data) === 0 ) {
                  if ( dedupCompare(o, dupeAfter.next.data) === 0 ) {
                    // duplicate found, ignore the new item
                    return;
                  }
                  dupeAfter = dupeAfter.next;
                }
                // No dupes found, so insert at position dupeAfter
                // dupeAfter.next is either end-of-list or a larger item
                var nu = Object.create(NodeProto);
                nu.next = dupeAfter.next;
                nu.data = o;
                dupeAfter.next = nu;
                dupeAfter = null;
                return;
              } else { // comp < 0
                 // existing-is-greater-than-new case, insert before it
                 insert();
              }
            }
          });
        })();
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

      var sub = foam.core.FObject.create();
      var detached = false;
      sub.onDetach(function() { detached = true; });

      function scanResults() {
        // The list starting at head now contains the results plus possible
        //  overflow of skip+limit
        var node = head.next;
        while ( node && ! detached ) {
          resultSink.put(node.data, sub);
          node = node.next;
        }
      }

      // if there is an async index in the above, wait for it to finish
      //   before reading out the results.
      if ( promises.length ) {
        var thisPromise = Promise.all(promises).then(scanResults);
        // if an index above us is also async, chain ourself on
        promise[0] = promise[0] ? promise[0].then(function() {
          return thisPromise;
        }) : thisPromise;
      } else {
        // In the syncrhonous case we don't have to wait on our subplans,
        //  and can ignore promise[0] as someone else is responsible for
        //  waiting on it if present.
        scanResults();
      }
    },

    function executeFallback(promise, sink, skip, limit, order, predicate) {
       /**
        * Executes a merge where ordering is unknown, therefore no
        * sorting is done and deduplication must be done separately.
        */
       var resultSink = this.DedupSink.create({
         delegate: this.decorateSink_(sink, skip, limit)
       });

       var sp = this.subPlans;
       var predicates = predicate ? predicate.args : [];
       var subLimit = ( limit ? limit + ( skip ? skip : 0 ) : undefined );

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
       // Since this execute doesn't collect results into a temporary
       // storage list, we don't need to worry about the promises. Any
       // async subplans will add their promise on, and when they are
       // resolved their results will have already put() straight into
       // the resultSink. Only the MDAO calling the first execute() needs
       // to respect the referenced promise chain.
    },

    function decorateSink_(sink, skip, limit) {
      /**
       * TODO: Share with AbstractDAO? We never need to use predicate or order
       * @private
       */
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
