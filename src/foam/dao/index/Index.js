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

    // TODO: estimate is a class (static) method. Declare as such when possible
    /** Estimates the performance of this index given the number of items
      it will hold and the planned parameters. */
    function estimate(size, sink, skip, limit, order, predicate) {
      return size * size;
    },

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
      myOrder.orderDirection() will provide an orderDirs object for
      a given foam.mlang.order.Comparator. */
    function select(/*sink, skip, limit, orderDirs, predicate*/) { },

    /** Efficiently (if possible) loads the contents of the given DAO into the index */
    function bulkLoad(/*dao*/) {},
  ]
});

// TODO: add 'refines' to Interfaces
// foam.INTERFACE({
//   refines: 'foam.mlang.predicate.Predicate',
//   methods: [
//     {
//       name: 'toIndex',
//       args: [
//         {
//           name: 'tailFactory',
//           javaType: 'foam.dao.index.Index'
//         }
//       ],
//       javaReturns: 'foam.dao.index.Index'
//     },
//     {
//       name: 'toDisjunctiveNormalForm',
//       javaReturns: 'foam.mlang.predicate.Predicate'
//     }
//   ]
// });

foam.CLASS({
  refines: 'foam.mlang.predicate.AbstractPredicate',

  methods: [
    function toIndex(/*tailFactory*/) {
      return undefined;
    },
    function toDisjunctiveNormalForm() {
      return this;
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Binary',

  methods: [
    function toIndex(tailFactory) {
      if ( this.arg1 ) {
        return this.arg1.toIndex(tailFactory);
      } else {
        return;
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.Unary',

  methods: [
    function toIndex(tailFactory) {
      if ( this.arg1 ) {
        return this.arg1.toIndex(tailFactory);
      } else {
        return;
      }
    }
  ]
});

foam.CLASS({
  refines: 'foam.mlang.order.Desc',

  methods: [
    function toIndex(tailFactory) {
      if ( this.arg1 ) {
        return this.arg1.toIndex(tailFactory);
      } else {
        return;
      }
    }
  ]
});

foam.CLASS({
  refines: 'foam.mlang.order.ThenBy',

  methods: [
    function toIndex(tailFactory) {
      if ( this.arg1 && this.arg2 ) {
        return this.arg1.toIndex(this.arg2.toIndex(tailFactory));
      } else {
        return;
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.mlang.predicate.And',

  requires: [
    'foam.mlang.predicate.Or'
  ],

  methods: [
    function toIndex(tailFactory) {
      // TODO: sort by index uniqueness (put the most indexable first):
      //   This prevents dropping to scan mode too early, and restricts
      //   the remaning set more quickly.
      // EQ, IN,... CONTAINS, ... LT, GT...

      // generate indexes, find costs, toss these initial indexes
      var sortedArgs = Object.create(null);
      var costs = [];
      var args = this.args;
      for (var i = 0; i < args.length; i++ ) {
        var arg = args[i];
        var idx = arg.toIndex(tailFactory);
        if ( ! idx ) continue;

        var idxCost = Math.floor(idx.estimate(
           1000, undefined, undefined, undefined, undefined, arg));
        // make unique with a some extra digits
        var costKey = idxCost + i / 1000.0;
        sortedArgs[costKey] = arg;
        costs.push(costKey);
      }
      costs = costs.sort(foam.Number.compare);

      // Sort, build list up starting at the end (most expensive
      //   will end up deepest in the index)
      var tail = tailFactory;
      for ( var i = costs.length - 1; i >= 0; i-- ) {
        var arg = sortedArgs[costs[i]];
        //assert(arg is a predicate)
        tail = arg.toIndex(tail);
      }

      return tail;
    },

    function toDisjunctiveNormalForm() {
      // for each nested OR, multiply:
      // AND(a,b,OR(c,d),OR(e,f)) -> OR(abce,abcf,abde,abdf)

      var andArgs = [];
      var orArgs = [];
      var oldArgs = this.args;
      for (var i = 0; i < oldArgs.length; i++ ) {
        var a = oldArgs[i].toDisjunctiveNormalForm();
        if ( this.Or.isInstance(a) ) {
          orArgs.push(a);
        } else {
          andArgs.push(a);
        }
      }

      if ( orArgs.length > 0 ) {
        var newAndGroups = [];
        // Generate every combination of the arguments of the OR clauses
        // orArgsOffsets[g] represents the array index we are lookig at
        // in orArgs[g].args[offset]
        var orArgsOffsets = new Array(orArgs.length).fill(0);
        var active = true;
        var idx = orArgsOffsets.length - 1;
        orArgsOffsets[idx] = -1; // compensate for intial ++orArgsOffsets[idx]
        while ( active ) {
          while ( ++orArgsOffsets[idx] >= orArgs[idx].args.length ) {
            // reset array index count, carry the one
            if ( idx === 0 ) { active = false; break; }
            orArgsOffsets[idx] = 0;
            idx--;
          }
          idx = orArgsOffsets.length - 1;
          if ( ! active ) break;

          // for the last group iterated, read back up the indexes
          // to get the result set
          var newAndArgs = [];
          for ( var j = orArgsOffsets.length - 1; j >= 0; j-- ) {
            newAndArgs.push(orArgs[j].args[orArgsOffsets[j]]);
          }
          newAndArgs = newAndArgs.concat(andArgs);

          newAndGroups.push(
            this.cls_.create({ args: newAndArgs })
          );
        }
        return this.Or.create({ args: newAndGroups }).partialEval();
      } else {
        // no OR args, no DNF transform needed
        return this;
      }
    }
  ]
});

foam.CLASS({
  refines: 'foam.mlang.predicate.Or',

  requires: [
    'foam.dao.index.OrIndex',
    'foam.dao.index.AltIndex'
  ],

  methods: [
    function toIndex(tailFactory) {
      // return an OR index with Alt index spanning each possible index
      var subIndexes = [tailFactory];
      for ( var i = 0; i < this.args.length; i++ ) {
        var index = this.args[i].toIndex(tailFactory);
        index && subIndexes.push(index);
      }
      return this.OrIndex.create({
        delegateFactory: this.AltIndex.create({
          delegateFactories: subIndexes
        })
      });
    },

    function toDisjunctiveNormalForm() {
      // TODO: memoization around this process
      // DNF our args, note if anything changes
      var oldArgs = this.args;
      var newArgs = [];
      var changed = false;
      for (var i = 0; i < oldArgs.length; i++ ) {
        var a = oldArgs[i].toDisjunctiveNormalForm();
        if ( a !== oldArgs[i] ) changed = true;
        newArgs[i] = a;
      }

      // partialEval will take care of nested ORs
      var self = this;
      if ( changed ) {
        self = this.clone();
        self.args = newArgs;
        self = self.partialEval();
      }

      return self;
    }
  ]
});


