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
foam.CLASS({
  package: 'foam.dao',
  name: 'MDAO',
  label: 'Indexed DAO',
  extends: 'foam.dao.AbstractDAO',

  requires: [
    'foam.dao.ArraySink',
    'foam.dao.ExternalException',
    'foam.dao.InternalException',
    'foam.dao.ObjectNotFoundException',
    'foam.dao.index.AltIndex',
    'foam.dao.index.AutoIndex',
    'foam.dao.index.SetIndex',
    'foam.dao.index.TreeIndex',
    'foam.dao.index.ValueIndex',
    'foam.mlang.predicate.Eq',
    'foam.mlang.predicate.True',
    'foam.mlang.predicate.Or',
    'foam.mlang.sink.Explain',
    'foam.dao.index.MergePlan'
  ],

  properties: [
    {
      class: 'Class2',
      name:  'of',
      required: true
    },
    {
      class: 'Boolean',
      name: 'autoIndex',
      value: false
    },
    {
      name: 'idIndex'
    },
    {
      /** The spawned root instance of our index. */
      name: 'index'
    }
  ],

  methods: [
    function init() {
      // adds the primary key(s) as an index, and stores it for fast find().
      this.addPropertyIndex();
      this.idIndex = this.index;

      if ( this.autoIndex ) {
        this.addIndex(this.AutoIndex.create({ mdao: this }));
      }
    },

    /**
     * Add a non-unique index
     * args: one or more properties
     **/
    function addPropertyIndex() {
      var props = Array.from(arguments);

      // Add ID to make each sure the object is uniquely identified
      props.push(this.of$cls.ID);

      return this.addUniqueIndex_.apply(this, props);
    },

    /**
     * Add a unique index
     * args: one or more properties
     * @private
     **/
    function addUniqueIndex_() {
      var index = this.ValueIndex.create();

      for ( var i = arguments.length-1 ; i >= 0 ; i-- ) {
        var prop = arguments[i];

        // Pass previous index as the sub-index of the next level up.
        // (we are working from leaf-most index up to root index in the list)
        index = prop.toIndex(index);
      }

      return this.addIndex(index);
    },

    function addIndex(index) {
      if ( ! this.index ) {
        this.index = index.spawn();
        return this;
      }

      // Upgrade single Index to an AltIndex if required.
      if ( ! this.AltIndex.isInstance(this.index.progenitor) ) {
        this.index = this.AltIndex.create({
          delegates: [ this.index.progenitor ], // create factory
          instances: [ this.index ] // create an instance
        });
      }

      this.index.addIndex(index, this.index);

      return this;
    },

    /**
     * Bulk load data from another DAO.
     * Any data already loaded into this DAO will be lost.
     * @arg sink (optional) eof is called when loading is complete.
     **/
    function bulkLoad(dao) {
      var self = this;
      var sink = self.ArraySink.create();
      return dao.select(sink).then(function() {
        var a = sink.a;
        self.index.bulkLoad(a);
        for ( var i = 0; i < a.length; ++i ) {
          var obj = a[i];
        }
      });
    },

    function put(obj) {
      var oldValue = this.find_(obj.id);
      if ( oldValue ) {
        this.index.remove(oldValue);
      }
      this.index.put(obj);
      this.pub('on', 'put', obj);
      return Promise.resolve(obj);
    },

    function find(key) {
      if ( key === undefined ) {
        return Promise.reject(this.InternalException.create({ id: key })); // TODO: err
      }

      var obj = this.find_(key);

      if ( obj )
        return Promise.resolve(obj);
      else
        return Promise.reject(this.ObjectNotFoundException.create({ id: key }));
    },

    /** internal, synchronous version of find, does not throw */
    function find_(key) {
      var index = this.idIndex;
      index = index.get(key);

      if ( index && index.get() ) return index.get();

      return;
    },

    function remove(obj) {
      if ( ! obj || obj.id === undefined ) {
        return Promise.reject(this.ExternalException.create({ id: 'no_id' })); // TODO: err
      }

      var id   = obj.id;
      var self = this;

      var obj = this.find_(id);
      if ( obj ) {
        self.index.remove(obj);
        self.pub('on', 'remove', obj);
        return Promise.resolve();
      } else {
        // object not found is ok, remove post-condition still met
        return Promise.resolve();
      }
    },

    function removeAll(skip, limit, order, predicate) {
      if ( ! predicate ) predicate = this.True.create();
      var self = this;
      return self.where(predicate).select(self.ArraySink.create()).then(
        function(sink) {
          var a = sink.a;
          for ( var i = 0 ; i < a.length ; i++ ) {
            self.index.remove(a[i]);
            self.pub('on', 'remove', a[i]);
          }
          return Promise.resolve();
        }
      );
    },

    function select(sink, skip, limit, order, predicate) {
      sink = sink || this.ArraySink.create();
      var plan;

      if ( this.Explain.isInstance(sink) ) {
        plan = this.index.plan(sink.arg1, skip, limit, order, predicate, this.index);
        sink.plan = 'cost: ' + plan.cost + ', ' + plan.toString();
        sink && sink.eof && sink.eof();
        return Promise.resolve(sink);
      }

      predicate = predicate && predicate.toDisjunctiveNormalForm();
      if ( ! predicate || ! this.Or.isInstance(predicate) ) {
        plan = this.index.plan(sink, skip, limit, order, predicate, this.index);
      } else {
        plan = this.planForOr(sink, skip, limit, order, predicate);
      }

      var promise = [Promise.resolve()];
      plan.execute(promise, sink, skip, limit, order, predicate);
      return promise[0].then(
        function() {
          sink && sink.eof && sink.eof();
          return Promise.resolve(sink);
        },
        function(err) {
          sink && sink.error && sink.error(err);
          return Promise.reject(err);
        }
      );
    },

    function planForOr(sink, skip, limit, order, predicate) {
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
          this.index.plan(sink, undefined, subLimit, undefined, args[i], this.index)
        );
      }

      return this.MergePlan.create({ subPlans: plans });
    },

    function toString() {
      return 'MDAO(' + this.cls_.name + ',' + this.index + ')';
    }
  ]
});


// DNF transform // TODO: move to mlangs
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
      var args = this.args;
      for (var i = 0; i < args.length; i++ ) {
        var arg = args[i];
        var idx = arg.toIndex(tailFactory);
        if ( ! idx ) continue;

        var idxCost = Math.floor(idx.estimate(
           1000, undefined, undefined, undefined, undefined, arg));
        // make unique with a some extra digits
        sortedArgs[idxCost + i / 1000.0] = arg;
      }
      console.log("Sorted AND args: ", sortedArgs);

      // Sort, build list up starting at the end (most expensive
      //   will end up deepest in the index)
      var tail = tailFactory;
      var keys = Object.keys(sortedArgs).sort();
      for ( var i = keys.length - 1; i >= 0; i-- ) {
        var arg = sortedArgs[keys[i]];
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
    'foam.dao.index.AltIndex'
  ],

  methods: [
    function toIndex(tailFactory) {
      // return an OR index with Alt index spanning each possible index
      var subIndexes = [];
      for ( var i = 0; i < this.args.length; i++ ) {
        var index = this.args[i].toIndex(tailFactory);
        index && subIndexes.push(index);
      }
      // TODO: This should be an OrIndex that returns a MergePlan.
      // Since MDAO does the DNF and handles the Or, this .toIndex() is
      // not a common case.
      return this.AltIndex.create({
        delegates: subIndexes
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

