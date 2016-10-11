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
    /** Estimates the performance of this index given the number of items
      it will hold and the  */
    function estimate(forSize, forPredicate) {
      return Number.MAX_VALUE;
    }
  ]
});

foam.CLASS({
  refines: 'foam.dao.index.TreeIndex',

  methods: [
    /** Estimates the performance of this index given the number of items
      it will hold and the  */
    function estimate(forSize, forPredicate) {
      predicate = forPredicate.clone();

      var isExprMatch = function(model) {
        if ( ! model ) return undefined;
        if ( predicate ) {
          if ( model.isInstance(predicate) && predicate.arg1 === prop ) {
            var arg2 = predicate.arg2;
            predicate = undefined;
            return arg2;
          }
          if ( this.And.isInstance(predicate) ) {
            for ( var i = 0 ; i < predicate.args.length ; i++ ) {
              var q = predicate.args[i];
              if ( model.isInstance(q) && q.arg1 === prop ) {
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

      var arg2 = isExprMatch(this.In);
      if ( arg2 ) {
        // tree depth * number of compares
        return ( Math.log(forSize) / Math.log(2) ) * arg2.length;
      }

      arg2 = isExprMatch(this.Eq);
      if ( arg2 ) {
        // tree depth
        return ( Math.log(forSize) / Math.log(2) );
      }

      // These cases are just slightly better scans, but we can't estimate
      // how much better
//       arg2 = isExprMatch(this.Gt);
//       arg2 = isExprMatch(this.Gte);
//       arg2 = isExprMatch(this.Lt);
//       arg2 = isExprMatch(this.Lte);

      return forSize;
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
      this.delegate = this.delegateFactory_.create();
    },

    function addPropertyIndex(prop, root) {
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
      this.addIndex(prop.toIndex(this.idIndexFactory), root);
    },
    function addIndex(index, root) {
      this.delegate.addIndex(index, root);
    },
    // TODO: mlang comparators should support input collection for
    //   index-building cases like this
    function plan(sink, skip, limit, order, predicate, root) {
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



