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

/** The Index interface for an ordering, fast lookup, single value,
  index multiplexer, or any other MDAO select() assistance class. */
foam.CLASS({
  package: 'foam.dao.index',
  name: 'Index',

  axioms: [ foam.pattern.Progenitor.create() ],

  methods: [
    /** Adds or updates the given value in the index */
    function put(/*o*/) {},

    /** Removes the given value from the index */
    function remove(/*o*/) {},

    /** @return a Plan to execute a select with the given parameters */
    function plan(/*sink, skip, limit, order, predicate, root*/) {},

    /** @return the tail index instance for the given key. */
    function get(/*key*/) {},

    /** executes the given function for each index that was created from the given
      index factory (targetInstance.__proto__ === ofIndex). Function should take an index
      instance argument and return the index instance to replace it with.

      NOTE: size() is not allowed to change with this operation,
        since changing the type of index is not actually removing
        or adding items.
        Therefore: tail.size() == fn(tail).size() must hold.
    */
    function mapOver(fn, ofIndex) {},

    /** @return the integer size of this index. */
    function size() {},

    /** Selects matching items from the index and puts them into sink.

      <p>Note: orderDirs has replaced selectReverse().
      myOrder.tailOrderDirection() will provide an orderDirs object for
      a given foam.mlang.order.Comparator. */
    function select(/*sink, skip, limit, orderDirs, predicate*/) { },

    /** Returns true if the given ordering will be respected by a
      select() on this index. */
    function isOrderSelectable(/*order*/) { },

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
      name: 'delegateFactory',
      required: true,
    },
    {
      class: 'foam.pattern.progenitor.PerInstance',
      name: 'delegate',
      factory: function() {
        return this.delegateFactory.spawn();
      }
    },
  ],

  methods: [
    function put(o) { return this.delegate.put(o); },

    function remove(o) { return this.delegate.remove(o); },

    function plan(sink, skip, limit, order, predicate, root) {
      return this.delegate.plan(sink, skip, limit, order, predicate, root);
    },

    function get(key) { return this.delegate.get(key); },

    function mapOver(fn, ofIndex) {
      if ( this.delegate.progenitor === ofIndex ) {
        this.delegate = fn(this.delegate);
      } else {
        return this.delegate.mapOver(fn, ofIndex);
      }
    },

    function size() { return this.delegate.size(); },

    function select(sink, skip, limit, orderDirs, predicate) {
      return this.delegate.select(sink, skip, limit, orderDirs, predicate);
    },

    function isOrderSelectable(order) {
      return this.delegateFactory.isOrderSelectable(order);
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
    { class: 'foam.pattern.progenitor.PerInstance',  name: 'value' },
    { name: 'cost', value: 1 }
  ],

  methods: [
    // from plan
    function execute(promise, sink) {
      /** Note that this will put(undefined) if you remove() the item but
        leave this ValueIndex intact. Most usages of ValueIndex will clean up
        the ValueIndex itself when the value is removed. */
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
    function mapOver(fn, ofIndex) { },
    function isOrderSelectable(order) { return true; },

    function select(sink, skip, limit, orderDirs, predicate) {
      if ( predicate && ! predicate.f(this.value) ) return;
      if ( skip && skip[0]-- > 0 ) return;
      if ( limit && limit[0]-- <= 0 ) return;
      sink.put(this.value);
    },

    function selectReverse(sink, skip, limit, orderDirs, predicate) {
      this.select(sink, skip, limit, orderDirs, predicate);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao.index',
  name: 'AltIndex',
  extends: 'foam.dao.index.Index',

  requires: [
    'foam.dao.index.NoPlan'
  ],

  constants: {
    /** Maximum cost for a plan which is good enough to not bother looking at the rest. */
    GOOD_ENOUGH_PLAN: 10 // put to 10 or more when not testing
  },

  properties: [
    {
      /** delegate factories (TODO: rename) */
      name: 'delegates',
      factory: function() { return []; }
    },
    {
      /** the delegate instances for each Alt instance */
      class: 'foam.pattern.progenitor.PerInstance',
      name: 'instances',
      factory: function() {
        var instances = [];
        for ( var i = 0; i < this.delegates.length; i++ ) {
          instances[i] = this.delegates[i].spawn();
        }
        return instances;
      }
    },
  ],

  methods: [

    function addIndex(index, root) {
      // assert(root)
      // assert( ! index.progenitor )
      // This should be called on the factory, not an instance
      var self = this.progenitor || this;

      self.delegates.push(index);

      function addIndexTo(altInst) {
        // Populate the new index
        var newSubInst = index.spawn();
        altInst.plan(newSubInst).execute([], newSubInst);
        altInst.instances.push(newSubInst);
        return altInst;
      }

      if ( root === this || root.progenitor === this ) {
        // if we are the root, just call addIndexTo immediately
        addIndexTo(root);
      } else {
        // find all instances created by this factory, addIndexTo them
        root.mapOver(addIndexTo, self);
      }
    },

    function bulkLoad(a) {
      for ( var i = 0 ; i < this.instances.length ; i++ ) {
        this.instances[i].bulkLoad(a);
      }
    },

    function get(key) {
      return this.instances[0].get(key);
    },

    function getAltForOrderDirs(orderDirs) {
      var instances = this.instances;
      if ( ! orderDirs ) return instances[0];

      var t = orderDirs.tags[this];
      if ( ! foam.Number.isInstance(t) ) {
        t = orderDirs.tags[this] = 0;
        var order = orderDirs.srcOrder;
        for ( var i = 1 ; i < instances.length ; i++ ) {
          if ( instances[i].isOrderSelectable(order) ) {
            t = orderDirs.tags[this] = i;
            break;
          }
        }
      }
      return instances[t];
    },

    function select(sink, skip, limit, orderDirs, predicate) {
      // find and cache the correct subindex to use
      this.getAltForOrderDirs(orderDirs)
        .select(sink, skip, limit, orderDirs, predicate);
    },

    function isOrderSelectable(order) {
      // TODO: check delegates, cache which one can handle the ordering for
      //   use in select()

      for ( var i = 0 ; i < this.delegates.length ; i++ ) {
        if ( this.delegates[i].isOrderSelectable(order) ) {
          return true;
        }
      }
      return false;
    },

    function mapOver(fn, ofIndex) {
      for ( var i = 0 ; i < this.instances.length ; i++ ) {
        if ( this.delegates[i] == ofIndex) {
          this.instances[i] = fn(this.instances[i]);
        } else {
          this.instances[i].mapOver(fn, ofIndex);
        }
      }
    },

    function put(newValue) {
      for ( var i = 0 ; i < this.instances.length ; i++ ) {
        this.instances[i].put(newValue);
      }
    },

    function remove(obj) {
      for ( var i = 0 ; i < this.instances.length ; i++ ) {
        this.instances[i].remove(obj);
      }
    },

    function plan(sink, skip, limit, order, predicate, root) {
      var bestPlan;
      //    console.log('Planning: ' + (predicate && predicate.toSQL && predicate.toSQL()));
      for ( var i = 0 ; i < this.instances.length ; i++ ) {
        var plan = this.instances[i].plan(sink, skip, limit, order, predicate, root);
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

    function size() { return this.instances[0].size(); },

    function toString() {
      return 'Alt([' + this.delegates.join(',') + '])';
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
