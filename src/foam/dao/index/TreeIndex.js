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
  refines: 'foam.core.Property',
  requires: [
    'foam.dao.index.TreeIndex',
  ],
  methods: [
    function toIndex(tailFactory) {
      /** Creates the correct type of index for this property, passing in the
          tail factory (sub-index) provided. */
      return this.TreeIndex.create({ prop: this, tailFactory: tailFactory });
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.FObjectArray',
  requires: [
    'foam.dao.index.SetIndex',
  ],
  methods: [
    function toIndex(tailFactory) {
       return this.SetIndex.create({ prop: this, tailFactory: tailFactory });
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.AxiomArray',
  requires: [
    'foam.dao.index.SetIndex',
  ],
  methods: [
    function toIndex(tailFactory) {
       return this.SetIndex.create({ prop: this, tailFactory: tailFactory });
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.StringArray',
  requires: [
    'foam.dao.index.SetIndex',
  ],
  methods: [
    function toIndex(tailFactory) {
       return this.SetIndex.create({ prop: this, tailFactory: tailFactory });
    }
  ]
});


/** A tree-based Index. Defaults to an AATree (balanced binary search tree) **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'TreeIndex',
  extends: 'foam.dao.index.Index',

  requires: [
    'foam.core.Property',
    'foam.dao.ArraySink',
    'foam.mlang.sink.NullSink',
    'foam.dao.index.AltPlan',
    'foam.dao.index.CountPlan',
    'foam.dao.index.CustomPlan',
    'foam.dao.index.NotFoundPlan',
    'foam.dao.index.NullTreeNode',
    'foam.dao.index.TreeNode',
    'foam.dao.index.ValueIndex',
    'foam.mlang.order.Desc',
    'foam.mlang.order.Comparator',
    'foam.mlang.order.ThenBy',
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.Eq',
    'foam.mlang.predicate.False',
    'foam.mlang.predicate.Gt',
    'foam.mlang.predicate.Gte',
    'foam.mlang.predicate.Lt',
    'foam.mlang.predicate.Lte',
    'foam.mlang.predicate.Or',
    'foam.mlang.predicate.True',
    'foam.mlang.predicate.In',
    'foam.mlang.predicate.Contains',
    'foam.mlang.predicate.ContainsIC',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Explain',
  ],

  constants: {
    IS_EXPR_MATCH_FN: function isExprMatch(predicate, prop, model) {
      if ( predicate && model && prop ) {
        // util.equals catches Properties that were cloned if the predicate has
        //  been cloned.
        if ( model.isInstance(predicate) &&
            ( predicate.arg1 === prop || foam.util.equals(predicate.arg1, prop) )
        ){
          var arg2 = predicate.arg2;
          predicate = undefined;
          return { arg2: arg2, predicate: predicate };
        }

        if ( predicate.args && this.And.isInstance(predicate) ) {
          for ( var i = 0 ; i < predicate.args.length ; i++ ) {
            var q = predicate.args[i];
            if ( model.isInstance(q) && q.arg1 === prop ) {
              predicate = predicate.clone();
              predicate.args[i] = this.True.create();
              predicate = predicate.partialEval();
              if (  this.True.isInstance(predicate) ) predicate = undefined;
              return { arg2: q.arg2, predicate: predicate };
            }
          }
        }
      }
      return undefined;
    }
  },

  properties: [
    {
      name: 'prop'
    },
    {
      class: 'foam.pattern.progenitor.PerInstance',
      name: 'selectCount',
      value: 0
    },
    {
      class: 'foam.pattern.progenitor.PerInstance',
      name: 'root',
      factory: function() { return this.nullNode; }
    },
    {
      name: 'nullNode',
      factory: function() {
        var nn = this.NullTreeNode.create({
          tailFactory: this.tailFactory,
          treeNodeFactory: this.treeNodeFactory
        });
        this.treeNodeFactory.nullNode = nn; // don't finite loop between factories
        return nn;
      }
    },
    {
      name: 'treeNodeFactory',
      factory: function() {
        return this.TreeNode.create(); // don't set nullNode here, infinite loop!
      }
    },
    {
      name: 'tailFactory'
    }
  ],

  methods: [
    function init() {

      // TODO: replace with bound methods when available
      this.dedup = this.dedup.bind(this, this.prop.name); //foam.Function.bind(this.dedup, this);
      //this.compare = foam.Function.bind(this.compare, this);
    },

    /**
     * Bulk load an unsorted array of objects.
     * Faster than loading individually, and produces a balanced tree.
     **/
    function bulkLoad(a) {
      a = a.a || a;
      this.root = this.nullNode;

      // Only safe if children aren't themselves trees
      // TODO: should this be !TreeIndex.isInstance? or are we talking any
      // non-simple index, and is ValueIndex the only simple index?
      // It's the default, so ok for now
      if ( this.ValueIndex.isInstance(this.tailFactory) ) {
        a.sort(this.prop.compare.bind(this.prop));
        this.root = this.root.bulkLoad_(a, 0, a.length-1, this.prop.f);
      } else {
        for ( var i = 0 ; i < a.length ; i++ ) {
          this.put(a[i]);
        }
      }
    },

    /** Set the value's property to be the same as the key in the index.
        This saves memory by sharing objects. */
    function dedup(propName, obj, value) {
      obj[propName] = value;
    },

    function put(newValue) {
      this.root = this.root.putKeyValue(
          this.prop.f(newValue),
          newValue,
          this.compare,
          this.dedup,
          this.selectCount > 0);
    },

    function remove(value) {
      this.root = this.root.removeKeyValue(
          this.prop.f(value),
          value,
          this.compare,
          this.selectCount > 0);
    },

    function get(key) {
      // does not delve into sub-indexes
      return this.root.get(key, this.compare);
    },

    function mapOver(fn, ofIndex) {
      if ( this.tailFactory === ofIndex ) {
        return this.root.mapTail(fn);
      } else {
        return this.root.mapOver(fn, ofIndex);
      }
    },

    function select(sink, skip, limit, order, predicate, cache) {
      // AATree node will extract orderDirs.next for the tail index
      if ( order && order.orderDirection() < 0 ) {
        this.root.selectReverse(sink, skip, limit, order, predicate, cache);
      } else {
        this.root.select(sink, skip, limit, order, predicate, cache);
      }
    },

    function size() { return this.root.size; },

    function compare(o1, o2) {
      return foam.util.compare(o1, o2);
    },

    function isOrderSelectable(order) {
      // no ordering, no problem
      if ( ! order ) return true;

      // if this index can sort, it's up to our tail to sub-sort
      if ( foam.util.equals(order.orderPrimaryProperty(), this.prop) ) {
        // If the subestimate is less than sort cost (N*lg(N) for a dummy size of 1000)
        return 9965 >
          this.tailFactory.estimate(1000, this.NullSink.create(), 0, 0, order.orderTail())
      }
      // can't use select() with the given ordering
      return false;
    },

    function estimate(size, sink, skip, limit, order, predicate) {
      // small sizes don't matter
      if ( size <= 16 ) return Math.log(size) / Math.log(2);

      // if only estimating by ordering, just check if we can scan it
      //  otherwise return the sort cost.
      // NOTE: This is conceptually the right thing to do, but also helps
      //   speed up isOrderSelectable() calls on this:
      //   a.isOrderSelectable(o) -> b.estimate(..o) -> b.isOrderSelectable(o) ...
      //   Which makes it efficient but removes the need for Index to
      //   have an isOrderSelectable() method forwarding directly.
      if ( order && ! ( predicate || skip || limit ) ) {
        return this.isOrderSelectable(order) ? size :
          size * Math.log(size) / Math.log(2);
      }

      var self = this;
      predicate = predicate ? predicate.clone() : null;
      var property = this.prop;
      // TODO: validate this assumption:
      var nodeCount = Math.floor(size * 0.25); // tree node count will be a quarter the total item count

      var isExprMatch = this.IS_EXPR_MATCH_FN.bind(this, predicate, property);

      var tailFactory = this.tailFactory;
      var subEstimate = ( tailFactory ) ? function() {
          return Math.log(nodeCount) / Math.log(2) +
            tailFactory.estimate(size / nodeCount, sink, skip, limit, order, predicate);
        } :
        function() { return Math.log(nodeCount) / Math.log(2); };

      var expr = isExprMatch(this.In);
      if ( expr ) {
        // tree depth * number of compares
        return subEstimate() * expr.arg2.f().length;
      }

      expr = isExprMatch(this.Eq);
      if ( expr ) {
        // tree depth
        return subEstimate();
      }

      expr = isExprMatch(this.ContainsIC);
      if ( expr ) ic = true;
      expr = expr || isExprMatch(this.Contains);
      if ( expr ) {
        // TODO: this isn't quite right. Tree depth * query string length?
        // If building a trie to help with this, estimate becomes easier.
        return subEstimate() * expr.arg2.f().length;
      }

      // At this point we are going to scan all or part of the tree
      //  with select()
      var cost = size;

      // These cases are just slightly better scans, but we can't estimate
      //   how much better... maybe half
      if ( isExprMatch(this.Gt) || isExprMatch(this.Gte) ||
          isExprMatch(this.Lt) || isExprMatch(this.Lte) ) {
        cost /= 2;
      }

      // Ordering
      // if sorting required, add the sort cost
      if ( ! this.isOrderSelectable(order) ) {
        // this index or a tail index can't sort this ordering,
        // manual sort required
        if ( cost > 0 ) cost *= Math.log(cost) / Math.log(2);
      }

      return cost;
    },

    function plan(sink, skip, limit, order, predicate, root) {
      var index = this;

      if ( index.False.isInstance(predicate) ) return this.NotFoundPlan.create();

      if ( ! predicate && index.Count.isInstance(sink) ) {
        var count = this.size();
        //        console.log('**************** COUNT SHORT-CIRCUIT ****************', count, this.toString());
        return index.CountPlan.create({ count: count });
      }

      var prop = this.prop;

      // if ( sink.model_ === GroupByExpr && sink.arg1 === prop ) {
      // console.log('**************** GROUP-BY SHORT-CIRCUIT ****************');
      // TODO: allow sink to split up, for GroupBy passing one sub-sink to each tree node
      //  for grouping. Allow sink to suggest order, if order not defined
      //    sink.subSink(key) => sink
      //    sink.defaultOrder() => Comparator
      // }

      var result, subPlan, cost;

      var isExprMatch = this.IS_EXPR_MATCH_FN.bind(this, predicate, prop);

      var expr = isExprMatch(this.In);
      if ( expr ) {
        predicate = expr.predicate;
           // Just scan if that would be faster.
        if ( Math.log(this.size())/Math.log(2) * expr.arg2.length < this.size() ) {
          var keys = expr.arg2;
          var subPlans = [];
          cost = 1;

          for ( var i = 0 ; i < keys.length ; ++i) {
            result = this.get(keys[i]);

            if ( result ) { // TODO: could refactor this subindex recursion into .plan()
              subPlan = result.plan(sink, skip, limit, order, predicate, root);

              cost += subPlan.cost;
              subPlans.push(subPlan);
            }
          }

          if ( subPlans.length === 0 ) return index.NotFoundPlan.create();

          // TODO: If ordering, AltPlan may need to sort like MergePlan.
          return index.AltPlan.create({
            subPlans: subPlans,
            prop: prop
          });
        }
      }

      expr = isExprMatch(this.Eq);
      if ( expr ) {
        predicate = expr.predicate;
        var key = expr.arg2.f();
        result = this.get(key, this.compare);

        if ( ! result ) return index.NotFoundPlan.create();

        subPlan = result.plan(sink, skip, limit, order, predicate, root);

        // TODO: If ordering, AltPlan may need to sort like MergePlan.
        return index.AltPlan.create({
          subPlans: [subPlan],
          prop: prop
        });
      }

      var ic = false;
      expr = isExprMatch(this.ContainsIC);
      if ( expr ) ic = true;
      expr = expr || isExprMatch(this.Contains);
      if ( expr ) {
        predicate = expr.predicate;
        var key = ic ? expr.arg2.f().toLowerCase() : expr.arg2.f();

        // Substring comparison function:
        // returns 0 if nodeKey contains masterKey.
        // returns -1 if nodeKey is shorter than masterKey
        // returns 1 if nodeKey is longer or equal length, but does not contain masterKey
        var compareSubstring = function compareSubstring(nodeKey, masterKey) {
          // nodeKey can't contain masterKey if it's too short
          if ( nodeKey.length < masterKey.length ) return -1;
          // iterate over substrings
          if ( ic ) nodeKey = nodeKey.toLowerCase(); // TODO: handle case-insensitive better
          for ( var start = 0; start < (nodeKey.length - masterKey.length + 1); start++ ) {
            if ( nodeKey.substring(start, start + masterKey.length) === masterKey ) {
              return 0;
            }
          }
          return 1;
        }

        var indexes = [];
        this.root.getAll(key, compareSubstring, indexes);
        var subPlans = [];
        // iterate over all keys
        for ( var i = 0; i < indexes.length; i++ ) {
          subPlans.push(indexes[i].plan(sink, skip, limit, order, predicate, root));
        }

        // TODO: If ordering, AltPlan may need to sort like MergePlan.
        return index.AltPlan.create({
          subPlans: subPlans,
          prop: prop
        });
      }

      // Restrict the subtree to search as necessary
      var subTree = this.root;

      expr = isExprMatch(this.Gt);
      if ( expr ) subTree = subTree.gt(expr.arg2.f(), this.compare);

      expr = isExprMatch(this.Gte);
      if ( expr ) subTree = subTree.gte(expr.arg2.f(), this.compare);

      expr = isExprMatch(this.Lt);
      if ( expr ) subTree = subTree.lt(expr.arg2.f(), this.compare);

      expr = isExprMatch(this.Lte);
      if ( expr ) subTree = subTree.lte(expr.arg2.f(), this.compare);

      cost = subTree.size;
      var sortRequired = ! this.isOrderSelectable(order);
      var reverseSort = false;

      var subOrder;
      var orderDirections;
      if ( order && ! sortRequired ) {
        // we manage the direction of the first scan directly,
        // tail indexes will use the order.orderTail()
        if ( order.orderDirection() < 0 ) reverseSort = true;
      }

      if ( ! sortRequired ) {
        if ( skip ) cost -= skip;
        if ( limit ) cost = Math.min(cost, limit);
      } else {
        // add sort cost
        if ( cost !== 0 ) cost *= Math.log(cost) / Math.log(2);
      }

      return index.CustomPlan.create({
        cost: cost,
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          if ( sortRequired ) {
            var arrSink = index.ArraySink.create();
            index.selectCount++;
            subTree.select(arrSink, null, null, null, predicate, {});
            index.selectCount--;
            var a = arrSink.a;
            a.sort(order.compare.bind(order));

            skip = skip || 0;
            limit = Number.isFinite(limit) ? limit : a.length;
            limit += skip;
            limit = Math.min(a.length, limit);

            for ( var i = skip; i < limit; i++ )
              sink.put(a[i]);
          } else {
            index.selectCount++;
            // Note: pass skip and limit by reference, as they are modified in place
            reverseSort ?
              subTree.selectReverse(sink, [skip], [limit],
                order, predicate, {}) :
              subTree.select(sink, [skip], [limit],
                order, predicate, {}) ;
            index.selectCount--;
          }
        },
        customToString: function() {
          return 'scan(key=' + prop.name + ', cost=' + this.cost +
              (predicate && predicate.toSQL ? ', predicate: ' + predicate.toSQL() : '') +
              ')';
        }
      });
    },

    function toString() {
      return 'TreeIndex(' + this.prop.name + ', ' + this.tailFactory + ')';
    }
  ]
});


/** Case-Insensitive TreeIndex **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'CITreeIndex',
  extends: 'foam.dao.index.TreeIndex',

  methods: [
    function put(newValue) {
      this.root = this.root.putKeyValue(
          this.prop.f(newValue).toLowerCase(),
          newValue,
          this.compare,
          this.dedup,
          this.selectCount > 0);
    },

    function remove(value) {
      this.root = this.root.removeKeyValue(
          this.prop.f(value).toLowerCase(),
          value,
          this.compare,
          this.selectCount > 0);
    },

    /**
     * Do not optimize bulkload
     **/
    function bulkLoad(a) {
      a = a.a || a;
      this.root = this.nullNode;
      for ( var i = 0 ; i < a.length ; i++ ) {
        this.put(a[i]);
      }
    },
  ]
});


/** An Index for storing multi-valued properties. **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'SetIndex',
  extends: 'foam.dao.index.TreeIndex',

  methods: [
    // TODO: see if this can be done some other way
    function dedup() {
      // NOP, not safe to do here
    },

    /**
     * Do not optimize bulkload to SetIndex
     **/
    function bulkLoad(a) {
      a = a.a || a;
      this.root = this.nullNode;
      for ( var i = 0 ; i < a.length ; i++ ) {
        this.put(a[i]);
      }
    },

    function put(newValue) {
      var a = this.prop.f(newValue);

      if ( a.length ) {
        for ( var i = 0 ; i < a.length ; i++ ) {
          this.root = this.root.putKeyValue(
              a[i],
              newValue,
              this.compare,
              this.dedup);
        }
      } else {
        this.root = this.root.putKeyValue('', newValue, this.compare, this.dedup);
      }
    },

    function remove(value) {
      var a = this.prop.f(value);

      if ( a.length ) {
        for ( var i = 0 ; i < a.length ; i++ ) {
          this.root = this.root.removeKeyValue(a[i], value, this.compare);
        }
      } else {
        this.root = this.root.removeKeyValue('', value, this.compare);
      }
    }
  ]
});

