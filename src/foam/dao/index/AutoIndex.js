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
  extends: 'foam.dao.index.Index',

  requires: [
    'foam.core.Property',
    'foam.dao.index.NoPlan',
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.Or',
  ],

  properties: [
    {
      name: 'existingIndexes',
      factory: function() { return {}; }
    },
    {
      name: 'mdao'
    }
  ],

  methods: [
    function put() { },

    function remove() { },

    function bulkLoad() { return 'auto'; },

    function addIndex(prop) {
      if ( foam.mlang.order.Desc && foam.mlang.order.Desc.isInstance(prop) ) {
        prop = prop.arg1;
      }
      console.log('Adding AutoIndex : ', prop.id);
      this.existingIndexes[prop.name] = prop;
      this.mdao.addPropertyIndex(prop);
    },
    // TODO: mlang comparators should support input collection for
    //   index-building cases like this
    function plan(sink, skip, limit, order, predicate) {
      if ( predicate ) {
        if ( this.existingIndexes[predicate] ) {
          // already seen this exact predicate, nothing to do
          return this.NoPlan.create();
        }
        this.existingIndexes[predicate] = true;

        // create the index to optimize the predicate, if none existing
        // from similar predicates
        var signature = predicate.toIndexSignature();
        if ( ! this.existingIndexes[signature] ) {

          var newIndex = predicate.toIndex(this.mdao.idIndexFactory);

          this.mdao.addIndex(newIndex);

          this.existingIndexes[signature] = true;
          console.log("inputs: ", predicate.toIndexSignature());
        }
      }
      if ( order ) {
        // TODO: compound comparator case
        // find name of property to order by
        var name = ( this.Property.isInstance(order) ) ? order.name :
          ( order.arg1 && order.arg1.name ) || null;
        // if no index added for it yet, add one
        if ( name && ! this.existingIndexes[name] ) {
          this.addIndex(order);
        }
      }
      return this.NoPlan.create();
    },

    function toString() {
      return 'AutoIndex()';
    },

  ]
});

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
  refines: 'foam.mlang.predicate.Nary',

  methods: [
    function toIndexSignature() {
      if ( this.args ) {
        var args = this.args;
        var sigs = []; // to be sorted
        for (var i = 0; i < args.length; i++ ) {
          var sig = args[i].toIndexSignature();
          sig && sigs.push(sig);
        }
        // reverse sort leaves *AND,*OR at the end
        sigs.sort(function(a,b) { return -foam.util.compare(a.name, b.name); });

        var ret = "*"+this.cls_.name + "{" + sigs.join(',') + "}";
        return ret;
      } else {
        return "*"+this.cls_.name+"{}";
      }
    }
  ]
});

foam.CLASS({
  refines: 'foam.mlang.predicate.Binary',

  methods: [
    function toIndexSignature() {
      if ( this.arg1 ) {
        return this.arg1.toIndexSignature();
      } else {
        return;
      }
    },
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
    function toIndexSignature() {
      if ( this.arg1 ) {
        return this.arg1.toIndexSignature();
      } else {
        return;
      }
    },
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
  refines: 'foam.core.Property',

  methods: [
    function toIndexSignature() {
      return this.name;
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
      // Find DNF, if we were already in it, proceed
      var self = this.toDisjunctiveNormalForm();
      if ( self !== this ) return self.toIndex(tailFactory);

      var args = this.args;
      var tail = tailFactory;
      for (var i = 0; i < args.length; i++ ) {
        var idx = args[i].toIndex(tail);
        if ( idx ) {
          tail = idx;
        }
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

        var activeOrIdxs = new Array(orArgs.length).fill(0);
        var active = true;
        var idx = activeOrIdxs.length - 1;
        activeOrIdxs[idx] = -1; // compensate for intial ++activeOrIdxs[idx]
        while ( active ) {
          while ( ++activeOrIdxs[idx] >= orArgs[idx].args.length ) {
            // reset array index count, carry the one
            if ( idx === 0 ) { active = false; break; }
            activeOrIdxs[idx] = 0;
            idx--;
          }
          idx = activeOrIdxs.length - 1;
          if ( ! active ) break;

          // for the last group iterated, read back up the indexes
          // to get the result set
          var newAndArgs = [];
          for ( var j = activeOrIdxs.length - 1; j >= 0; j-- ) {
            newAndArgs.push(orArgs[j].args[activeOrIdxs[j]]);
          }
          newAndGroups.push(
            this.cls_.create({ args: newAndArgs.concat(andArgs) })
          );
        }
        return this.Or.create({ args: newAndGroups });
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
      var self = this.toDisjunctiveNormalForm();
console.log("Pre: ", this.toString());
console.log("DNF: ", self.toString());

      // return an OR index with Alt index spanning each possible index
      // TODO: this may duplicate indexes for the same set of properties
      //   Use signature to dedup
      var subIndexes = [];
      for ( var i = 0; i < this.args.length; i++ ) {
        var index = this.args[i].toIndex(tailFactory);
        index && subIndexes.push(index);
      }
      return this.OrIndex.create({ delegate:
        this.AltIndex.create({
          delegates: subIndexes
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


