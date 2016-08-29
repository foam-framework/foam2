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

/*
 * TODO:
 *  update(oldValue, newValue)
 *  reuse plans
 *  add ability for indices to pre-populate data
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


foam.CLASS({
  package: 'foam.dao.index',
  name: 'Plan',

  properties: [
    {
      name: 'cost',
      value: 0
    },
  ],

  methods: [
    function execute(/*promise, sink, skip, limit, order, predicate*/) {},
    function toString() { return this.cls_.name+"(cost="+this.cost+")"; }
  ]
});


/** Plan indicating that there are no matching records. **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'NotFoundPlan',
  extends: 'foam.dao.index.Plan',

  axioms: [ foam.pattern.Singleton.create() ],

  properties: [
    { name: 'cost', value: Number.MAX_VALUE }
  ],

  methods: [
    function toString() { return 'no-match(cost=MAX)'; }
  ]
});


/** Plan indicating that an index has no plan for executing a query. **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'NoPlan',
  extends: 'foam.dao.index.Plan',

  axioms: [ foam.pattern.Singleton.create() ],

  properties: [
    { name: 'cost', value: Number.MAX_VALUE }
  ],

  methods: [
    function toString() { return 'no-plan'; }
  ]
});

/** Plan for a synchronous index that just needs to select() on itself. **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'SelectingPlan',
  extends: 'foam.dao.index.Plan',

  properties: [
    { name: 'cost', value: 0 },
    { name: 'index', required: true },
  ],

  methods: [
    function execute(promise, sink, skip, limit, order, predicate) {
      // TODO: account for reverse ordering
      this.index.select(sink, skip, limit, order, predicate);
    },
  ]
});

/** Convenience wrapper for indexes that want to create a closure'd function
    for each plan instance */
foam.CLASS({
  package: 'foam.dao.index',
  name: 'CustomPlan',
  extends: 'foam.dao.index.Plan',

  properties: [
    {
      class: 'Function',
      name: 'customExecute'
    },
    {
      class: 'Function',
      name: 'customToString'
    }
  ],

  methods: [
    function execute(promise, sink, skip, limit, order, predicate) {
      this.customExecute.call(
          this,
          promise,
          sink,
          skip,
          limit,
          order,
          predicate);
    },

    function toString() {
      return this.customToString.call(this);
    }
  ]
});


foam.CLASS({
  package: 'foam.dao.index',
  name: 'CountPlan',
  extends: 'foam.dao.index.Plan',

  properties: [
    {
      class: 'Int',
      name: 'count'
    }
  ],

  methods: [
    function execute(promise, sink /*, skip, limit, order, predicate*/) {
      sink.value += this.count;
    },

    function toString() {
      return 'short-circuit-count(' + this.count + ')';
    }
  ]
});


foam.CLASS({
  package: 'foam.dao.index',
  name: 'AltPlan',
  extends: 'foam.dao.index.Plan',

  properties: [
    {
      name: 'subPlans',
      postSet: function(o, nu) {
        this.cost = 1;
        for ( var i = 0; i < nu.length; ++i ) {
          this.cost += nu[i].cost;
        }
      }
    },
    'prop'
  ],

  methods: [
    function execute(promise, sink, skip, limit, order, predicate) {
      var sp = this.subPlans;
      for ( var i = 0 ; i < sp.length ; ++i) {
        sp[i].execute(promise, sink, skip, limit, order, predicate);
      }
    },

    function toString() {
      return ( this.subPlans.length <= 1 ) ?
        'IN(key=' + this.prop && this.prop.name + ', cost=' + this.cost + ", " +
          ', size=' + this.subPlans.length + ')' :
        'lookup(key=' + this.prop && this.prop.name + ', cost=' + this.cost + ", " +
          this.subPlans[0].toString();
    }
  ]
});


/** The Index interface for an ordering, fast lookup, single value,
  index multiplexer, or any other MDAO select() assistance class. */
foam.CLASS({
  package: 'foam.dao.index',
  name: 'Index',

  methods: [
    /** JS-prototype based 'Flyweight' constructor. Creates plain
      javascript objects that are __proto__'d to a modeled instance. */
    function create(args) {
      var c = Object.create(this);
      args && c.copyFrom(args);
      c.init && c.init();
      return c;
    },

    /** Adds or updates the given value in the index */
    function put() {},

    /** Removes the given value from the index */
    function remove() {},

    /** @return a Plan to execute a select with the given parameters */
    function plan(/*sink, skip, limit, order, predicate*/) {},

    /** @return the stored value for the given key. */
    function get() {},

    /** @return the integer size of this index. */
    function size() {},

    /** Selects matching items from the index and puts them into sink */
    function select(/*sink, skip, limit, order, predicate*/) { },

    /** Selects matching items in reverse order from the index and puts
      them into sink */
    function selectReverse(/*sink, skip, limit, order, predicate*/) { },
  ]
});


/** An Index which holds only a single value. **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'ValueIndex',
  extends: 'foam.dao.index.Index',
  implements: [ 'foam.dao.index.Plan' ],

  properties: [
    { class: 'Simple',  name: 'value' },
    { name: 'cost', value: 1 }
  ],

  methods: [
    // from plan
    function execute(promise, sink) {
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

    function select(sink, skip, limit, order, predicate) {
      if ( predicate && ! predicate.f(this.value) ) return;
      if ( skip && skip[0]-- > 0 ) return;
      if ( limit && limit[0]-- <= 0 ) return;
      sink.put(this.value);
    },

    function selectReverse(sink, skip, limit, order, predicate) {
      this.select(sink, skip, limit, order, predicate);
    }
  ]
});


/** A tree-based Index. Defaults to an AATree (balanced binary search tree) **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'TreeIndex',
  extends: 'foam.dao.index.Index',

  requires: [
    'foam.dao.index.TreeNode',
    'foam.dao.index.NullTreeNode',
    'foam.dao.index.ValueIndex',
    'foam.dao.index.NotFoundPlan',
    'foam.dao.index.CountPlan',
    'foam.dao.index.AltPlan',
    'foam.dao.index.CustomPlan',
    'foam.dao.ArraySink',
    'foam.mlang.predicate.True',
    'foam.mlang.predicate.False',
    'foam.mlang.predicate.And',
    'foam.mlang.Constant',
    'foam.mlang.predicate.Contains',
    'foam.mlang.predicate.ContainsIC',
    'foam.mlang.predicate.Eq',
    'foam.mlang.predicate.Gt',
    'foam.mlang.predicate.Gte',
    'foam.mlang.predicate.Has',
    'foam.mlang.predicate.In',
    'foam.mlang.predicate.Lt',
    'foam.mlang.predicate.Lte',
    'foam.mlang.predicate.Neq',
    'foam.mlang.predicate.Not',
    'foam.mlang.predicate.Or',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Max',
    'foam.mlang.sink.Map',
    'foam.mlang.sink.Explain',
    'foam.mlang.order.Desc'
  ],

  properties: [
    {
      class: 'Simple', // TODO: why not shared?
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

    function findPos(key, incl) {
      return this.root.findPos(key, incl);
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
                predicate.args[i] = index.True;
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
    }
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


foam.CLASS({
  package: 'foam.dao.index',
  name: 'AltIndex',
  //extends: 'foam.dao.index.Index',

  requires: [
    'foam.dao.index.NoPlan',
  ],

  constants: {
    /** Maximum cost for a plan which is good enough to not bother looking at the rest. */
    GOOD_ENOUGH_PLAN: 10 // put to 10 or more when not testing
  },

  properties: [
    {
      name: 'delegates',
      factory: function() { return []; }
    }
  ],

  methods: [
    function addIndex(index) {
      // Populate the index
      var a = foam.dao.ArraySink.create();
      this.plan(a).execute([Promise.resolve()], a);

      index.bulkLoad(a);
      this.delegates.push(index);

      return this;
    },

    function bulkLoad(a) {
      for ( var i = 0 ; i < this.delegates.length ; i++ ) {
        this.delegates[i].bulkLoad(a);
      }
    },

    function get(key) {
      return this.delegates[0].get(key);
    },

    function put(newValue) {
      for ( var i = 0 ; i < this.delegates.length ; i++ ) {
        this.delegates[i].put(newValue);
      }
    },

    function remove(obj) {
      for ( var i = 0 ; i < this.delegates.length ; i++ ) {
        this.delegates[i].remove(obj);
      }
    },

    function plan(sink, skip, limit, order, predicate) {
      var bestPlan;
      //    console.log('Planning: ' + (predicate && predicate.toSQL && predicate.toSQL()));
      for ( var i = 0 ; i < this.delegates.length ; i++ ) {
        var plan = this.delegates[i].plan(sink, skip, limit, order, predicate);
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

    function size() { return this.delegates[0].size(); },

    function toString() {
      return 'Alt(' + this.delegates.join(',') + ')';
    }
  ]
});


/** An Index which adds other indices as needed. **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'AutoIndex',
  extends: 'foam.dao.index.Index',

  requires: [
    'foam.core.Property',
    'foam.dao.index.NoPlan'
  ],

  properties: [
    {
      name: 'properties',
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
      this.properties[prop.name] = true;
      this.mdao.addIndex(prop);
    },

    function plan(sink, skip, limit, order, predicate) {
      if (
          order &&
          this.Property.isInstance(order) && ! this.properties[order.name]
      ) {
        this.addIndex(order);
      } else if ( predicate ) {
        // TODO: check for property in predicate
      }
      return this.NoPlan.create();
    },
    function toString() {
      return 'AutoIndex()';
    }
  ]
});


foam.CLASS({
  package: 'foam.dao.index',
  name: 'Journal',
  extends: 'foam.dao.index.Index',

  requires: [
    'foam.dao.index.NoPlan'
  ],

  properties: [
    {
      class: 'String',
      name: 'basename'
    },
    {
      class: 'Int',
      name: 'journalNo',
      value: 0
    },
    {
      class: 'Int',
      name: 'limit',
      value: 50000
    },
    {
      class: 'Int',
      name: 'recordCount',
      value: 0
    },
    {
      name: 'journal',
      factory: function() {
        return require('fs').createWriteStream(
          this.basename + this.journalNo + '.dat',
          { flags: 'a' });
      }
    }
  ],

  methods: [
    function put(obj) {
      this.journal.write('dao.put(foam.json.parse(');
      this.journal.write(foam.json.Storage.stringify(obj));
      this.journal.write('));\r\n');
      this.recordCount += 1;
      this.rollover();
    },

    function remove(obj) {
      this.journal.write('dao.remove(model.create(');
      this.journal.write(foam.json.Storage.stringify(obj));
      this.journal.write('));\r\n');
      this.recordCount += 1;
      this.rollover();
    },

    function plan() {
      return this.NoPlan.create();
    },

    function bulkLoad() {
    },

    function rollover() {
      if ( this.recordCount > this.limit ) {
        this.journal.end();
        this.recordCount = 0;
        this.journalNo += 1;
        this.journal = undefined;
      }
    },

    function compact() {
    }
  ]
});
