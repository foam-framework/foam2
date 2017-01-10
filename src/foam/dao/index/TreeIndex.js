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
  flags: { noWarnOnRefinesAfterCreate: true },
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
  flags: { noWarnOnRefinesAfterCreate: true },
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
  flags: { noWarnOnRefinesAfterCreate: true },
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
  flags: { noWarnOnRefinesAfterCreate: true },
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
    'foam.dao.ArraySink',
    'foam.dao.index.AltPlan',
    'foam.dao.index.CountPlan',
    'foam.dao.index.CustomPlan',
    'foam.dao.index.NotFoundPlan',
    'foam.dao.index.NullTreeNode',
    'foam.dao.index.TreeNode',
    'foam.dao.index.ValueIndex',
    'foam.mlang.order.Desc',
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
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Explain',
  ],

  properties: [
    {
      class: 'Simple',
      name: 'prop'
    },
    {
      class: 'Simple',
      name: 'selectCount'
    },
    {
      class: 'Simple',
      name: 'root'
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
    /** Initialize simple properties, since they ignore factories. */
    function init() {

      this.selectCount = 0;
      this.root = this.nullNode;

      // TODO: replace with bound methods when available
      this.dedup = this.dedup.bind(this); //foam.Function.bind(this.dedup, this);
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
      if ( this.ValueIndex.isInstance(this.tailFactory.create()) ) {
        a.sort(toCompare(this.prop));
        this.root = this.root.bulkLoad_(a, 0, a.length-1, this.prop.f);
      } else {
        for ( var i = 0 ; i < a.length ; i++ ) {
          this.put(a[i]);
        }
      }
    },

    /** Set the value's property to be the same as the key in the index.
        This saves memory by sharing objects. */
    function dedup(obj, value) {
      obj[this.prop.name] = value;
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

    function select(sink, skip, limit, order, predicate) {
      this.root.select(sink, skip, limit, order, predicate);
    },

    function selectReverse(sink, skip, limit, order, predicate) {
      this.root.selectReverse(sink, skip, limit, order, predicate);
    },

    function size() { return this.root.size; },

    function compare(o1, o2) {
      return foam.util.compare(o1, o2);
    },

    function plan(sink, skip, limit, order, predicate) {
      var index = this;

      if ( index.False.isInstance(predicate) ) return this.NotFoundPlan.create();

      if ( ! predicate && index.Count.isInstance(sink) ) {
        var count = this.size();
        //        console.log('**************** COUNT SHORT-CIRCUIT ****************', count, this.toString());
        return index.CountPlan.create({ count: count });
      }

      //    if ( limit != null && skip != null && skip + limit > this.size() ) return foam.dao.index.NoPlan.create();

      var prop = this.prop;

      var isExprMatch = function(model) {
        if ( ! model ) return undefined;
        if ( predicate ) {
          // util.equals catches Properties that were cloned if the predicate has
          //  been cloned.
          if ( model.isInstance(predicate) &&
              ( predicate.arg1 === prop || foam.util.equals(predicate.arg1, prop) )
          ){
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
           Math.log(this.size())/Math.log(2) * arg2.length < this.size() ) {
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

      // Restrict the subtree to search as necessary
      var subTree = this.root;

      arg2 = isExprMatch(this.Gt);
      if ( arg2 ) subTree = subTree.gt(arg2.f(), this.compare);

      arg2 = isExprMatch(this.Gte);
      if ( arg2 ) subTree = subTree.gte(arg2.f(), this.compare);

      arg2 = isExprMatch(this.Lt);
      if ( arg2 ) subTree = subTree.lt(arg2.f(), this.compare);

      arg2 = isExprMatch(this.Lte);
      if ( arg2 ) subTree = subTree.lte(arg2.f(), this.compare);

      cost = subTree.size;
      var sortRequired = false;
      var reverseSort = false;

      if ( order ) {
        if ( order === prop ) {
          // sort not required
        } else if ( index.Desc.isInstance(order) && order.arg1 === prop ) {
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

/** TODO: move to stdlib */
var toCompare = function toCompare(c) {
  if ( Array.isArray(c) ) return CompoundComparator.apply(null, c);

  return c.compare ? c.compare.bind(c) : c;
};


/** TODO: move to stdlib */
var CompoundComparator = function CompoundComparator() {
  var args = Array.from(arguments);
  var cs = [];

  // Convert objects with .compare() methods to compare functions.
  for ( var i = 0 ; i < args.length ; i++ )
    cs[i] = toCompare(args[i]);

  var f = function(o1, o2) {
    for ( var i = 0 ; i < cs.length ; i++ ) {
      var r = cs[i](o1, o2);
      if ( r !== 0 ) return r;
    }
    return 0;
  };

  f.toString = f.toSQL;

  return f;
};
