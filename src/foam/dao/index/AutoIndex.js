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
    'foam.dao.index.OrIndex',
    'foam.dao.index.AltIndex',
    'foam.dao.index.ValueIndex',
  ],

  properties: [
    {
      name: 'existingIndexes',
      factory: function() { return []; }
    },
    {
      name: 'mdao'
    },
    {
      name: 'baseAltIndex',
      expression: function(mdao) {
        if ( ! mdao ) return;
        var index = this.OrIndex.create({
          delegate: this.AltIndex.create({
            delegates: [ mdao.idIndex ]
          })
        });
        mdao.addIndex(index);
        return index.delegate;
      }
    }
  ],

  methods: [
    function put() { },

    function remove() { },

    function bulkLoad() { return 'auto'; },

    function addPropertyIndex(prop) {
      if ( foam.mlang.order.Desc && foam.mlang.order.Desc.isInstance(prop) ) {
        prop = prop.arg1;
      }
      var name = prop.name;
      for ( var j = 0; j < this.existingIndexes.length; j++ ) {
        if ( this.existingIndexes[j][0] === name ) { // check first item of each existing index
          return; // the first prop matches, we can rely this index
        }
      }
      console.log('Adding 1 sig: ', [name]);

      this.existingIndexes.push([name]);
      //this.mdao.addPropertyIndex(prop);
      this.addIndex(prop.toIndex(this.mdao.idIndexFactory));
    },
    function addIndex(index) {
      this.baseAltIndex.addIndex(index);
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
        var dnf = predicate; //.toDisjunctiveNormalForm(); // TODO: settle on where to do this, or cache it
        if ( this.Or.isInstance(dnf) ) {
          for ( var i = 0; i < dnf.args.length; i++ ) {
            this.dispatchPredicate_(dnf.args[i]);
          }
        } else {
          this.dispatchPredicate_(dnf);
        }
      }
      if ( order ) {
        // TODO: compound comparator case
        // find name of property to order by
        var name = ( this.Property.isInstance(order) ) ? order.name :
          ( order.arg1 && order.arg1.name ) || null;
        // if no index added for it yet, add one
        if ( name ) {
          this.addPropertyIndex(order);
        }
      }
      return this.NoPlan.create();
    },

    /** @private */
    function dispatchPredicate_(dnf) {
      if ( this.And.isInstance(dnf) ) {
        this.processAndPredicate_(dnf);
      } else if ( this.Property.isInstance(dnf) ||
          dnf.arg1 && this.Property.isInstance(dnf.arg1) ) {
        this.addPropertyIndex(dnf.arg1 || dnf);
      } else {
        console.log("AutoIndex found unknown predicate: " + dnf.toString());
      }
    },

    /** @private */
    function processAndPredicate_(predicate) {
      // one AND clause. For now make a string for comparison
      // TODO[meta]: use an index to remember what indexes we made?

      // check for duplicates (different mlangs referencing the same
      //   property that will create the same index)
      var args = predicate.args;
      var dedupedArgs = [];
      for ( var k = 0; k < args.length; k++ ) {
        var sig = args[k].toIndexSignature();
        for ( var l = k+1; l < args.length; l++ ) {
          // check against remaning items
          var oSig = args[l].toIndexSignature();//TODO: memoize
          if ( sig === oSig ) {
            sig = null;
            break;
          }
        }
        if ( sig ) dedupedArgs.push(sig);
      }
      // // if args were removed, recreate the predicate
//       if ( dedupedArgs.length !== args.length ) {
//         predicate = predicate.cls_.create({ args: dedupedArgs });
//       }

      // Find existing indexes whose prefix contains at least all the properties in our predicate
      var signature = {};
      var sigArr = dedupedArgs; //predicate.toIndexSignature();
      for ( var i = 0; i < sigArr.length; i++ ) {
        signature[sigArr[i]] = true;
      }
      var newIndex;
      for ( var j = 0; j < this.existingIndexes.length; j++ ) {
        var existing = this.existingIndexes[j];
        var matched = 0;
        for ( var i = 0; i < existing.length; i++ ) {
          var existingProp = existing[i];
          if ( signature[existingProp] ) {
            matched++;
          } else {
            break; // as soon as we don't want one of the existing props, stop
          }
        }
        // ok if the prefix is exactly our props (in any order, but must be the first props)
        if ( matched === sigArr.length ) {
          newIndex = existing;
          break;
        }
      }
      // if nothing found, create a new index
      if ( ! newIndex ) {
         newIndex = predicate.toIndex(this.mdao.idIndexFactory);
         if ( newIndex ) {
           this.mdao.addIndex(newIndex);
           // set a key for each property we index
           var newSig = [];
           //newSig.index = newIndex;
           for ( var key in signature ) {
             newSig.push(key)
           }
           this.existingIndexes.push(newSig);
           console.log("Adding sig", newSig);
         }
      }
      
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
      var sigs = [];
      var args = this.args;
      sigs.name = this.cls_.name; // mark what kind of signature
      for (var i = 0; i < args.length; i++ ) {
        var sig = args[i].toIndexSignature();
        sig && sigs.push(sig);
      }
      sigs.sort();
      return sigs;
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

  properties: [
    {
      name: 'dnf_',
      expression: function(args) {
        // TODO: depend on each arg
        return this.toDisjunctiveNormalForm_();
      }
    }
  ],

  methods: [
    function toIndex(tailFactory) {
      // Find DNF, if we were already in it, proceed
      //var self = this.toDisjunctiveNormalForm();
      //if ( self !== this ) return self.toIndex(tailFactory);

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
      return this.dnf_;
    },

    function toDisjunctiveNormalForm_() {
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

  properties: [
    {
      name: 'dnf_',
      expression: function(args) {
        return this.toDisjunctiveNormalForm_();
      }
    }
  ],

  methods: [
    function toIndex(tailFactory) {
      //var self = this.toDisjunctiveNormalForm();
//console.log("Pre: ", this.toString());
//console.log("DNF: ", self.toString());

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
      return this.dnf_;
    },

    function toDisjunctiveNormalForm_() {
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


