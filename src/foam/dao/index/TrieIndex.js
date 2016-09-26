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
  refines: 'foam.mlang.predicate.Contains',
  
  requires: [
    'foam.dao.index.TrieIndex',
  ],

  methods: [
    function toIndexSignature() {
      if ( this.arg1 ) {
        return this.arg1.toIndexSignature()+"+substr";
      } else {
        return;
      }
    },
    function toIndex(tailFactory) {
      return this.TrieIndex.create({ prop: this.arg1, tailFactory: tailFactory });
    }
  ]
});
foam.CLASS({
  refines: 'foam.mlang.predicate.ContainsIC',

  requires: [
    'foam.dao.index.CITrieIndex',
  ],

  methods: [
    function toIndexSignature() {
      if ( this.arg1 ) {
        return this.arg1.toIndexSignature()+"+substr+IC";
      } else {
        return;
      }
    },
    function toIndex(tailFactory) {
      return this.CITrieIndex.create({ prop: this.arg1, tailFactory: tailFactory });
    }
  ]
});

/** A trie-based Index to support Contains and ContainsIC substring matching. **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'TrieIndex',
  extends: 'foam.dao.index.TreeIndex',

  requires: [
    'foam.dao.ArraySink',
    'foam.dao.index.AltPlan',
    'foam.dao.index.CountPlan',
    'foam.dao.index.CustomPlan',
    'foam.dao.index.NotFoundPlan',
    'foam.dao.index.NullTrieNode',
    'foam.dao.index.TrieNode',
    'foam.dao.index.ValueIndex',
    'foam.mlang.order.Desc',
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.Eq',
    'foam.mlang.predicate.False',
    'foam.mlang.predicate.Or',
    'foam.mlang.predicate.True',
    'foam.mlang.predicate.In',
    'foam.mlang.predicate.Contains',
    'foam.mlang.predicate.ContainsIC',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Explain',
  ],

  properties: [
    {
      name: 'treeNodeFactory',
      factory: function() {
        return this.TrieNode.create();
      }
    },
    {
      /** If true, indexes every substring of each key */
      class: 'Boolean',
      name: 'indexSubStrings',
      value: true
    }
  ],

  methods: [
    function init() {
      this.selectCount = 0;
      this.root = this.treeNodeFactory.create();

      this.dedup = null;
      
    },
    
    /**
     * Bulk load an unsorted array of objects.
     **/
    function bulkLoad(a) {
      a = a.a || a;
      for ( var i = 0 ; i < a.length ; i++ ) {
        this.put(a[i]);
      }
    },
    
    function extractKey(obj) {
      return this.prop.f(obj).split("");
    },

    function put(newValue) {
      var tailRef = [];
      key = this.extractKey(newValue);
      
      for ( var start = 0; start < key.length; start++ ) {
        this.root = this.root.putKeyValue(
          key,
          newValue,
          start,
          this.treeNodeFactory,
          this.tailFactory,
          this.selectCount > 0,
          tailRef);

        // only continue adding substring references if we add a new index
        if ( ! tailRef[0] ) break; 
      }
      
      
    },

    function remove(value) {
      key = this.extractKey(value);
      var tailRef = [];
      
      for ( var start = 0; start < key.length; start++ ) {
        this.root = this.root.removeKeyValue(
          key,
          value,
          start,
          this.selectCount > 0,
          tailRef);
        // only clean up substring references if we add a removed the entire index
        if ( ! tailRef[0] ) break; 
      }
    },

    function get(key) {
      //TODO: repeat for each suffix?
      // does not delve into sub-indexes
      //console.log("Get for ", key);
      key = key.split("");
      indexes = this.root.get(key, 0)
      // for ( var start = 0; start < key.length; start++ ) {
      //   var r = this.root.get(key, start);
      //   if ( r ) indexes = indexes.concat(r);
      // }
      
      // dedup return array
      // var ret = [];
//       for ( var d = 0; d < indexes.length - 1; d++ ) {
//         var idx = indexes[d];
//         for ( var e = d+1; e < indexes.length; e++ ) {
//           if ( idx === ret[e] ) {
//             console.log("Trie found dupe!");
//             idx = null;
//             break;
//           }
//         }
//         if ( idx ) ret.push(idx);
//       }
//
      return indexes;
    },


    function plan(sink, skip, limit, order, predicate) {
      var index = this;

      if ( index.False.isInstance(predicate) ) return this.NotFoundPlan.create();

      if ( ! predicate && index.Count.isInstance(sink) ) {
        var count = this.size();
        //        console.log('**************** COUNT SHORT-CIRCUIT ****************', count, this.toString());
        return index.CountPlan.create({ count: count });
      }

      var prop = this.prop;

      var isExprMatch = function(model) {
        if ( ! model ) return undefined;

        if ( predicate ) {

          if ( model.isInstance(predicate) && predicate.arg1 === prop ) {
            var arg2 = predicate.arg2;
            predicate = undefined;
            return arg2;
          }

          if ( index.And.isInstance(predicate) ) {
            for ( var i = 0 ; i < predicate.args.length ; i++ ) {
              var q = predicate.args[i];
              if ( model.isInstance(q) && q.arg1 === prop ) {
                predicate = predicate.clone();
                predicate.args[i] = index.True.create();
                predicate = predicate.partialEval();
                if (  index.True.isInstance(predicate) ) predicate = undefined;
                return q.arg2;
              }
            }
          }
        }

        return undefined;
      };

      // if ( sink.model_ === GroupByExpr && sink.arg1 === prop ) {
      // console.log('**************** GROUP-BY SHORT-CIRCUIT ****************');
      // TODO:
      // }
      var result, subPlan, cost;

      var arg2 = isExprMatch(this.In);
      if ( arg2 &&
           // Just scan if that would be faster.
           Math.log(this.size())/Math.log(2) * arg2.length < this.size() ) { // TODO: fix this expression for trie
        var keys = arg2;
        var subPlans = [];
        cost = 1;

        for ( var i = 0 ; i < keys.length ; ++i) {
          result = this.get(keys[i]);

          if ( result ) { // TODO: could refactor this subindex recursion into .plan()
            subPlan = result.plan(sink, skip, limit, order, predicate);

            cost += subPlan.cost;
            subPlans.push(subPlan);
          }
        }

        if ( subPlans.length === 0 ) return index.NotFoundPlan.create();

        return index.AltPlan.create({
          subPlans: subPlans,
          prop: prop
        });
      }

      arg2 = isExprMatch(this.Eq);
      if ( arg2 !== undefined ) {
        var key = arg2.f();
        result = this.get(key, this.compare);

        if ( ! result ) return index.NotFoundPlan.create();

        subPlan = result.plan(sink, skip, limit, order, predicate);

        return index.AltPlan.create({
          subPlans: [subPlan],
          prop: prop
        });
      }

      arg2 = isExprMatch(this.Contains);
      if ( arg2 !== undefined && this.indexSubStrings ) {
        var key = arg2.f();
        result = this.get(key);

        if ( ! result ) return index.NotFoundPlan.create();

        if ( ! foam.Array.is(result) ) {
          result = [result];
        }

        var subPlans = [];
        for ( var i = 0 ; i < result.length ; ++i) {
          subPlans.push(result[i].plan(sink, skip, limit, order, predicate));
        }
        return index.AltPlan.create({
          subPlans: subPlans,
          prop: prop
        });
      }

      arg2 = isExprMatch(this.ContainsIC);
      if ( arg2 !== undefined && this.indexSubStrings ) {
        var key = arg2.f();
        result = this.get(key);

        if ( ! result ) return index.NotFoundPlan.create();

        if ( ! foam.Array.is(result) ) {
          result = [result];
        }

        var subPlans = [];
        for ( var i = 0 ; i < result.length ; ++i) {
          subPlans.push(result[i].plan(sink, skip, limit, order, predicate));
        }
        return index.AltPlan.create({
          subPlans: subPlans,
          prop: prop
        });
      }


      // Restrict the subtree to search as necessary
      var subTree = this.root;
      cost = subTree.size;
      var sortRequired = false;
      var reverseSort = false;

      if ( order ) {
        if ( index.Desc.isInstance(order) && order.arg1 === prop ) {
          // reverse-sort, sort not required
          reverseSort = true;
        } else {
          sortRequired = true;
          if ( cost !== 0 ) cost *= Math.log(cost) / Math.log(2);
        }
      }

      if ( ! sortRequired ) {
        if ( skip ) cost -= skip;
        if ( limit ) cost = Math.min(cost, limit);
      }

      return index.CustomPlan.create({
        cost: cost,
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          if ( sortRequired ) {
            var arrSink = index.ArraySink.create();
            index.selectCount++;
            subTree.select(arrSink, null, null, null, predicate);
            index.selectCount--;
            var a = arrSink.a;
            a.sort(toCompare(order));

            skip = skip || 0;
            limit = Number.isFinite(limit) ? limit : a.length;
            limit += skip;
            limit = Math.min(a.length, limit);

            for ( var i = skip; i < limit; i++ )
              sink.put(a[i]);
          } else {
            index.selectCount++;
            reverseSort ? // Note: pass skip and limit by reference, as they are modified in place
              subTree.selectReverse(sink, [skip], [limit], order, predicate) :
              subTree.select(sink, [skip], [limit], order, predicate) ;
            index.selectCount--;
          }
        },
        customToString: function() {
          return 'trie_scan(key=' + prop.name + ', cost=' + this.cost +
              (predicate && predicate.toSQL ? ', predicate: ' + predicate.toSQL() : '') +
              ')';
        }
      });
    },

    function toString() {
      return 'TrieIndex(' + this.prop.name + ', ' + this.tailFactory + ')';
    }
  ]
});

/** Case-Insensitive TreeIndex **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'CITrieIndex',
  extends: 'foam.dao.index.TrieIndex',

  methods: [
    
    function extractKey(obj) {
      return this.prop.f(obj).toLowerCase().split("");
    },
    
    function get(key) {
      //TODO: repeat for each suffix?
      // does not delve into sub-indexes
      return this.SUPER(key.toLowerCase());
    },

    
  ]
});