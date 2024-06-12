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
  name: 'PropertyToIndexRefinement',
  refines: 'foam.core.Property',

  requires: [
    'foam.dao.index.TreeIndex'
  ],

  methods: [
    function toIndex(tail) {
      /** Creates the correct type of index for this property, passing in the
          tail factory (sub-index) provided. */
      return this.TreeIndex.create({ prop: this, tail: tail });
    }
  ]
});


foam.CLASS({
  package: 'foam.dao.index',
  name: 'FObjectArrayToIndexRefinement',
  refines: 'foam.core.FObjectArray',

  requires: [
    'foam.dao.index.SetIndex'
  ],

  methods: [
    function toIndex(tail) {
       return this.SetIndex.create({ prop: this, tail: tail });
    }
  ]
});


foam.CLASS({
  package: 'foam.dao.index',
  name: 'AxiomArrayToIndexRefinement',
  refines: 'foam.core.AxiomArray',

  requires: [
    'foam.dao.index.SetIndex'
  ],

  methods: [
    function toIndex(tail) {
       return this.SetIndex.create({ prop: this, tail: tail });
    }
  ]
});


foam.CLASS({
  package: 'foam.dao.index',
  name: 'StringArrayToIndexRefinement',
  refines: 'foam.core.StringArray',

  requires: [
    'foam.dao.index.SetIndex'
  ],

  methods: [
    function toIndex(tail) {
       return this.SetIndex.create({ prop: this, tail: tail });
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
    'foam.dao.index.MergePlan',
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
      var self = this.index || this;
      if ( predicate && model && prop ) {
        // util.equals catches Properties that were cloned if the predicate has
        //  been cloned.
        if ( model.isInstance(predicate) &&
            ( predicate.arg1 === prop || foam.util.equals(predicate.arg1, prop) )
        ) {
          var arg2 = predicate.arg2;
          predicate = undefined;
          return { arg2: arg2, predicate: predicate };
        }

        if ( predicate.args && self.And.isInstance(predicate) ) {
          for ( var i = 0 ; i < predicate.args.length ; i++ ) {
            var q = predicate.args[i];
            // Util.equals to catch clones again
            if ( model.isInstance(q) &&
                (q.arg1 === prop || foam.util.equals(q.arg1, prop)) ) {
              predicate = predicate.clone();
              predicate.args[i] = self.True.create();
              predicate = predicate.partialEval();
              if ( self.True.isInstance(predicate) ) predicate = undefined;
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
      name: 'prop',
      required: true
    },
    {
      name: 'nullNode',
      factory: function() {
        var nn = this.NullTreeNode.create({
          tail: this.tail,
          treeNode: this.treeNode
        });
        return nn;
      }
    },
    {
      name: 'treeNode',
      factory: function() { return this.TreeNode; }
    },
    {
      name: 'tail',
      required: true
    }
  ],

  methods: [
    function init() {
      this.dedup = this.dedup.bind(this, this.prop.name);
    },

    /** Set the value's property to be the same as the key in the index.
        This saves memory by sharing objects. */
    function dedup(propName, obj, value) {
      obj[propName] = value;
    },

    function compare(o1, o2) {
      return foam.util.compare(o1, o2);
    },

    function isOrderSelectable(order) {
      // no ordering, no problem
      if ( ! order ) return true;

      // if this index can sort, it's up to our tail to sub-sort
      // TODO: the following code breaks things, fix. KGR
      if ( false /*foam.util.equals(order.orderPrimaryProperty, this.prop)*/ ) {
        // If the subestimate is less than sort cost (N*lg(N) for a dummy size of 1000)
        return 9965 >
          this.tail.estimate(1000, this.NullSink.create(), 0, 0, order.orderTail())
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

      var tail = this.tail;
      var subEstimate = ( tail ) ? function() {
          return Math.log(nodeCount) / Math.log(2) +
            tail.estimate(size / nodeCount, sink, skip, limit, order, predicate);
        } :
        function() { return Math.log(nodeCount) / Math.log(2); };

      var expr = isExprMatch(this.In);
      if ( expr ) {
        var numCmp = expr.arg2 ? expr.arg2.f().length : 0;
        // tree depth * number of compares
        return subEstimate() * numCmp;
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

    function toString() {
      return '[' + this.cls_.name + ': ' + this.prop.name + ' ' + this.tail.toString() + ']';
    },

    function toPrettyString(indent) {
      var ret = '';
      //ret += "  ".repeat(indent) + this.cls_.name + "( " + this.prop.name + "\n";
      //ret += this.tail.toPrettyString(indent + 1);
      //ret += "  ".repeat(indent) + ")\n";
      var tail = this.tail.toPrettyString(indent + 1);
      ret = '  '.repeat(indent) + this.prop.name + '(' + this.$UID + ')\n';
      if ( tail.trim().length > 0 ) ret += tail;
      return ret;
    }
  ]
});


/** A tree-based Index. Defaults to an AATree (balanced binary search tree) **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'TreeIndexNode',
  extends: 'foam.dao.index.IndexNode',

  properties: [
    {
      class: 'Simple',
      name: 'selectCount',
    },
    {
      class: 'Simple',
      name: 'root',
    }
  ],

  methods: [
    function init() {
      this.root = this.root || this.index.nullNode;
      this.selectCount = this.selectCount || 0;
    },

    /**
     * Bulk load an unsorted array of objects.
     * Faster than loading individually, and produces a balanced tree.
     **/
    function bulkLoad(a) {
      a = a.array || a;
      this.root = this.index.nullNode;

      // Only safe if children aren't themselves trees
      // TODO: should this be !TreeIndex.isInstance? or are we talking any
      // non-simple index, and is ValueIndex the only simple index?
      // It's the default, so ok for now
      if ( this.index.ValueIndex.isInstance(this.tail) ) {
        var prop = this.index.prop;
        a.sort(prop.compare.bind(prop));
        this.root = this.root.bulkLoad_(a, 0, a.length-1, prop.f);
      } else {
        for ( var i = 0 ; i < a.length ; i++ ) {
          this.put(a[i]);
        }
      }
    },

    function put(newValue) {
      this.root = this.root.putKeyValue(
          this.index.prop.f(newValue),
          newValue,
          this.index.compare,
          this.index.dedup,
          this.selectCount > 0);
    },

    function remove(value) {
      this.root = this.root.removeKeyValue(
          this.index.prop.f(value),
          value,
          this.index.compare,
          this.selectCount > 0,
          this.index.nullNode);
    },

    function get(key) {
      // does not delve into sub-indexes
      return this.root.get(key, this.index.compare);
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

    function plan(sink, skip, limit, order, predicate, root) {
      var index = this;
      var m     = this.index;

      if ( m.False.isInstance(predicate) ) return m.NotFoundPlan.create();

      if ( ! predicate && m.Count.isInstance(sink) ) {
        var count = this.size();
        //        console.log('**************** COUNT SHORT-CIRCUIT ****************', count, this.toString());
        return m.CountPlan.create({ count: count });
      }

      var prop = m.prop;

      if ( foam.mlang.sink.GroupBy.isInstance(sink) && sink.arg1 === prop ) {
      // console.log('**************** GROUP-BY SHORT-CIRCUIT ****************');
      // TODO: allow sink to split up, for GroupBy passing one sub-sink to each tree node
      //  for grouping. Allow sink to suggest order, if order not defined
      //    sink.subSink(key) => sink
      //    sink.defaultOrder() => Comparator
      }

      var result, subPlan, cost;

      var isExprMatch = m.IS_EXPR_MATCH_FN.bind(this, predicate, prop);

      var expr = isExprMatch(m.In);
      if ( expr ) {
        predicate = expr.predicate;
        // Marshalled empty array may be undefined.
        var keys = expr.arg2.f() || [];
        // Just scan if that would be faster.
        if ( Math.log(this.size()) / Math.log(2) * keys.length < this.size() ) {
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

          if ( subPlans.length === 0 ) return m.NotFoundPlan.create();

          return m.MergePlan.create({
            subPlans: subPlans,
            prop: prop
          });
        }
      }

      expr = isExprMatch(m.Eq);
      if ( expr ) {
        predicate = expr.predicate;
        var key = expr.arg2.f();
        result = this.get(key, this.index.compare);

        if ( ! result ) return m.NotFoundPlan.create();

        subPlan = result.plan(sink, skip, limit, order, predicate, root);

        return subPlan;
      }

      var ic = false;
      expr = isExprMatch(m.ContainsIC);
      if ( expr ) ic = true;
      expr = expr || isExprMatch(m.Contains);
      if ( expr ) {
        predicate = expr.predicate;
        var key = ic ? expr.arg2.f().toLowerCase() : expr.arg2.f();

        // Substring comparison function:
        // returns 0 if nodeKey contains masterKey.
        // returns -1 if nodeKey is shorter than masterKey
        // returns 1 if nodeKey is longer or equal length, but does not contain masterKey
        var compareSubstring = function compareSubstring(nodeKey, masterKey) {
          // nodeKey can't contain masterKey if it's too short
          if ( ( ! nodeKey ) || ( ! nodeKey.indexOf ) || ( nodeKey.length < masterKey.length ) ) return -1;

          if ( ic ) nodeKey = nodeKey.toLowerCase(); // TODO: handle case-insensitive better

          return nodeKey.indexOf(masterKey) > -1 ? 0 : 1;
        }

        var indexes = [];
        if ( ! key || key.length === 0 ) {
          // everything contains 'nothing'
          this.root.getAll('', function() { return 0; }, indexes);
        } else {
          this.root.getAll(key, compareSubstring, indexes);
        }
        var subPlans = [];
        // iterate over all keys
        for ( var i = 0; i < indexes.length; i++ ) {
          subPlans.push(indexes[i].plan(sink, skip, limit, order, predicate, root));
        }

        return m.MergePlan.create({
          subPlans: subPlans,
          prop: prop
        });
      }

      // Restrict the subtree to search as necessary
      var subTree = this.root;

      expr = isExprMatch(m.Gt);
      if ( expr ) subTree = subTree.gt(expr.arg2.f(), this.index.compare);

      expr = isExprMatch(m.Gte);
      if ( expr ) subTree = subTree.gte(expr.arg2.f(), this.index.compare, this.index.nullNode);

      expr = isExprMatch(m.Lt);
      if ( expr ) subTree = subTree.lt(expr.arg2.f(), this.index.compare);

      expr = isExprMatch(m.Lte);
      if ( expr ) subTree = subTree.lte(expr.arg2.f(), this.index.compare, this.index.nullNode);

      cost = subTree.size;
      var sortRequired = ! this.index.isOrderSelectable(order);
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

      return m.CustomPlan.create({
        cost: cost,
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          if ( sortRequired ) {
            var arrSink = m.ArraySink.create();
            index.selectCount++;
            subTree.select(arrSink, null, null, null, predicate, {});
            index.selectCount--;
            var a = arrSink.array;
            a.sort(order.compare.bind(order));

            skip = skip || 0;
            limit = Number.isFinite(limit) ? limit : a.length;
            limit += skip;
            limit = Math.min(a.length, limit);

            var sub = foam.core.FObject.create();
            var detached = false;
            sub.onDetach(function() { detached = true; });
            for ( var i = skip; i < limit; i++ ) {
              sink.put(a[i], sub);
              if ( detached ) break;
            }
          } else {
            index.selectCount++;
            // Note: pass skip and limit by reference, as they are modified in place
            reverseSort ?
              subTree.selectReverse(
                sink,
                skip  != null ? [skip]  : null,
                limit != null ? [limit] : null,
                order, predicate, {}) :
              subTree.select(
                sink,
                skip  != null ? [skip]  : null,
                limit != null ? [limit] : null,
                order, predicate, {}) ;
            index.selectCount--;
          }
        },
        customToString: function() {
          return 'scan(key=' + prop.name + ', cost=' + this.cost +
              ', sorting=' + ( sortRequired ? order.toString() : 'none' ) +
              ', reverseScan=' + reverseSort +
              (predicate && predicate.toSQL ? ', predicate: ' + predicate.toSQL() : '') +
              ')';
        }
      });
    },

    function toString() {
      return 'TreeIndex(' + (this.index || this).prop.name + ', ' + (this.index || this).tail + ')';
    }
  ]
});


/** Case-Insensitive TreeIndex **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'CITreeIndex',
  extends: 'foam.dao.index.TreeIndex'
});


foam.CLASS({
  package: 'foam.dao.index',
  name: 'CITreeIndexNode',
  extends: 'foam.dao.index.TreeIndexNode',

  methods: [
    function put(newValue) {
      this.root = this.root.putKeyValue(
          this.index.prop.f(newValue).toLowerCase(),
          newValue,
          this.index.compare,
          this.index.dedup,
          this.selectCount > 0);
    },

    function remove(value) {
      this.root = this.root.removeKeyValue(
          this.index.prop.f(value).toLowerCase(),
          value,
          this.index.compare,
          this.selectCount > 0,
          this.index.nullNode);
    },

    /**
     * Do not optimize bulkload
     **/
    function bulkLoad(a) {
      a = a.array || a;
      this.root = this.index.nullNode;
      for ( var i = 0 ; i < a.length ; i++ ) {
        this.put(a[i]);
      }
    }
  ]
});


/** An Index for storing multi-valued properties. **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'SetIndex',
  extends: 'foam.dao.index.TreeIndex',
});


foam.CLASS({
  package: 'foam.dao.index',
  name: 'SetIndexNode',
  extends: 'foam.dao.index.TreeIndexNode',

  methods: [
    // TODO: see if this can be done some other way
    function dedup() {
      // NOP, not safe to do here
    },

    /**
     * Do not optimize bulkload to SetIndex
     **/
    function bulkLoad(a) {
      a = a.array || a;
      this.root = this.index.nullNode;
      for ( var i = 0 ; i < a.length ; i++ ) {
        this.put(a[i]);
      }
    },

    function put(newValue) {
      var a = this.index.prop.f(newValue);

      if ( a.length ) {
        for ( var i = 0 ; i < a.length ; i++ ) {
          this.root = this.root.putKeyValue(
              a[i],
              newValue,
              this.index.compare,
              this.index.dedup);
        }
      } else {
        this.root = this.root.putKeyValue('', newValue, this.index.compare, this.index.dedup);
      }
    },

    function remove(value) {
      var a = this.index.prop.f(value);

      if ( a.length ) {
        for ( var i = 0 ; i < a.length ; i++ ) {
          this.root = this.root.removeKeyValue(a[i], value, this.index.compare, this.index.nullNode);
        }
      } else {
        this.root = this.root.removeKeyValue('', value, this.index.compare, this.index.nullNode);
      }
    }
  ]
});
