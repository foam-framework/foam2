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

/* Indexed Memory-based DAO. */

/*
 * TODO:
 *  update(oldValue, newValue)
 *  reuse plans
 *  add ability for indices to pre-populate data
 */

/** The Index interface for an ordering, fast lookup, single value,
  index multiplexer, or any other MDAO select() assistance class. */
foam.CLASS({
  package: 'foam.dao.index',
  name: 'Index',

  methods: [
    /** JS-prototype based 'Flyweight' constructor. Creates plain
      javascript objects that are __proto__'d to a modeled instance. */
    function create(args) {
      var c = Object.create(this);
      args && c.copyFrom(args);
      c.init && c.init();
      return c;
    },

    /** Adds or updates the given value in the index */
    function put(/*o*/) {},

    /** Removes the given value from the index */
    function remove(/*o*/) {},

    /** @return a Plan to execute a select with the given parameters */
    function plan(/*sink, skip, limit, order, predicate*/) {},

    /** @return the stored value for the given key. */
    function get(/*key*/) {},

    /** @return the integer size of this index. */
    function size() {},

    /** Selects matching items from the index and puts them into sink */
    function select(/*sink, skip, limit, order, predicate*/) { },

    /** Selects matching items in reverse order from the index and puts
      them into sink */
    function selectReverse(/*sink, skip, limit, order, predicate*/) { },

    /** Efficiently (if possible) loads the contents of the given DAO into the index */
    function bulkLoad(/*dao*/) {},
  ]
});

foam.CLASS({
  package: 'foam.dao.index',
  name: 'ProxyIndex',
  extends: 'foam.dao.index.Index',

  properties: [
    {
      name: 'delegate',
      required: true
    }
  ],

  methods: [
    function put(o) { return this.delegate.put(o); },

    function remove(o) { return this.delegate.remove(o); },

    function plan(sink, skip, limit, order, predicate) {
      return this.delegate.plan(sink, skip, limit, order, predicate);
    },

    function get(key) { return this.delegate.get(key); },

    function size() { return this.delegate.size(); },

    function select(sink, skip, limit, order, predicate) {
      return this.delegate.select(sink, skip, limit, order, predicate);
    },

    function selectReverse(sink, skip, limit, order, predicate) {
      return this.delegate.selectReverse(sink, skip, limit, order, predicate);
    },

    function bulkLoad(dao) { return this.delegate.bulkLoad(dao); },
  ]
});


/**
  An Index which holds only a single value. This class also functions as its
  own execution Plan, since it only has to return the single value.
**/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'ValueIndex',
  extends: 'foam.dao.index.Index',
  implements: [ 'foam.dao.index.Plan' ],

  properties: [
    { class: 'Simple',  name: 'value' },
    { name: 'cost', value: 1 }
  ],

  methods: [
    // from plan
    function execute(promise, sink, skip, limit, order, predicate) {
      /** Note that this will put(undefined) if you remove() the item but
        leave this ValueIndex intact. Most usages of ValueIndex will clean up
        the ValueIndex itself when the value is removed. */
      if ( predicate && ! predicate.f(this.value) ) return;
      if ( skip && skip[0]-- > 0 ) return;
      if ( limit && limit[0]-- <= 0 ) return;
      sink.put(this.value);
    },

    function toString() {
      return "ValueIndex_Plan(cost=1, value:" + this.value + ")";
    },

    // from Index
    function put(s) { this.value = s; },
    function remove() { this.value = undefined; },
    function get() { return this.value; },
    function size() { return typeof this.value === 'undefined' ? 0 : 1; },
    function plan() { return this; },

    function select(sink, skip, limit, order, predicate) {
      if ( predicate && ! predicate.f(this.value) ) return;
      if ( skip && skip[0]-- > 0 ) return;
      if ( limit && limit[0]-- <= 0 ) return;
      sink.put(this.value);
    },

    function selectReverse(sink, skip, limit, order, predicate) {
      this.select(sink, skip, limit, order, predicate);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao.index',
  name: 'AltIndex',
  extends: 'foam.dao.index.Index',

  requires: [
    'foam.dao.index.NoPlan',
  ],

  constants: {
    /** Maximum cost for a plan which is good enough to not bother looking at the rest. */
    GOOD_ENOUGH_PLAN: 10 // put to 10 or more when not testing
  },

  properties: [
    {
      name: 'delegates',
      factory: function() { return []; }
    }
  ],

  methods: [
    function addIndex(index) {
      // Populate the index
      var a = foam.dao.ArraySink.create();
      this.plan(a).execute([], a);

      index.bulkLoad(a);
      this.delegates.push(index);

      return this;
    },

    function bulkLoad(a) {
      for ( var i = 0 ; i < this.delegates.length ; i++ ) {
        this.delegates[i].bulkLoad(a);
      }
    },

    function get(key) {
      return this.delegates[0].get(key);
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

    function plan(sink, skip, limit, order, predicate) {
      var bestPlan;
      //    console.log('Planning: ' + (predicate && predicate.toSQL && predicate.toSQL()));
      for ( var i = 0 ; i < this.delegates.length ; i++ ) {
        var plan = this.delegates[i].plan(sink, skip, limit, order, predicate);
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
      return 'Alt(' + this.delegates.join(',') + ')';
    }
  ]
});

/**
  ORIndex runs multiple plans over the clauses of the OR predicate, and
  combines the results. Typically an AltIndex will be used under the ORIndex
  to optimize the various sub-queries the OR executes.
*/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'OrIndex',
  extends: 'foam.dao.index.ProxyIndex',

  requires: [
    'foam.mlang.predicate.Or',
    'foam.dao.index.MergePlan'
  ],

  methods: [
    function plan(sink, skip, limit, order, predicate) {
      if ( ! predicate || ! this.Or.isInstance(predicate) ) {
        return this.delegate.plan(sink, skip, limit, order, predicate);
      }

      // TODO: check how ordering is handled in existing TreeIndex etc.
      //   compound comparators should be handled better than forcing our
      //   sink to re-sort.

      // if there's a limit, add skip to make sure we get enough results
      //   from each subquery. Our sink will throw out the extra results
      //   after sorting.
      var subLimit = ( limit ? limit + ( skip ? skip : 0 ) : undefined );

      // This is an instance of OR, break up into separate queries
      var args = predicate.args;
      var plans = [];
      for ( var i = 0; i < args.length; i++ ) {
        // NOTE: we pass sink here, but it's not going to be the one eventually
        // used.
        plans.push(
          this.delegate.plan(sink, undefined, subLimit, undefined, args[i])
        );
      }

      return this.MergePlan.create({ subPlans: plans });
    },

    function toString() {
      return 'OrIndex('+this.delegate.toString()+')';
    }

  ]

});


// foam.CLASS({
//   package: 'foam.dao.index',
//   name: 'Journal',
//   extends: 'foam.dao.index.Index',
//
//   requires: [
//     'foam.dao.index.NoPlan'
//   ],
//
//   properties: [
//     {
//       class: 'String',
//       name: 'basename'
//     },
//     {
//       class: 'Int',
//       name: 'journalNo',
//       value: 0
//     },
//     {
//       class: 'Int',
//       name: 'limit',
//       value: 50000
//     },
//     {
//       class: 'Int',
//       name: 'recordCount',
//       value: 0
//     },
//     {
//       name: 'journal',
//       factory: function() {
//         return require('fs').createWriteStream(
//           this.basename + this.journalNo + '.dat',
//           { flags: 'a' });
//       }
//     }
//   ],
//
//   methods: [
//     function put(obj) {
//       this.journal.write('dao.put(foam.json.parse(');
//       this.journal.write(foam.json.Storage.stringify(obj));
//       this.journal.write('));\r\n');
//       this.recordCount += 1;
//       this.rollover();
//     },
//
//     function remove(obj) {
//       this.journal.write('dao.remove(model.create(');
//       this.journal.write(foam.json.Storage.stringify(obj));
//       this.journal.write('));\r\n');
//       this.recordCount += 1;
//       this.rollover();
//     },
//
//     function plan() {
//       return this.NoPlan.create();
//     },
//
//     function bulkLoad() {
//     },
//
//     function rollover() {
//       if ( this.recordCount > this.limit ) {
//         this.journal.end();
//         this.recordCount = 0;
//         this.journalNo += 1;
//         this.journal = undefined;
//       }
//     },
//
//     function compact() {
//     }
//   ]
// });
