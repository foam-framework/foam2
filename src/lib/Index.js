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

/** TODO: move to stdlib */
var toCompare = function toCompare(c) {
  if ( Array.isArray(c) ) return CompoundComparator.apply(null, c);

  return c.compare ? c.compare.bind(c) : c;
};
/** TODO: move to stdlib */
var CompoundComparator = function CompoundComparator() {
  var args = argsToArray(arguments);
  var cs = [];

  // Convert objects with .compare() methods to compare functions.
  for ( var i = 0 ; i < args.length ; i++ )
    cs[i] = toCompare(args[i]);

  var f = function(o1, o2) {
    for ( var i = 0 ; i < cs.length ; i++ ) {
      var r = cs[i](o1, o2);
      if ( r != 0 ) return r;
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
      class: 'Int',
      name: 'cost',
      value: 0
    },
  ],

  methods: [
    function execute(promise, state, sink, skip, limit, order, predicate) {},
    function toString() { return this.cls_.name+"(cost="+this.cost+")"; }
  ]
});

/** Plan indicating that there are no matching records. **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'NotFoundPlan',
  extends: 'foam.dao.index.Plan',
  axoims: [ foam.pattern.Singleton.create() ],

  properties: [
    { name: 'cost', value: 0 }
  ],

  methods: [
    function toString() { return "no-match(cost=0)"; }
  ]
});


/** Plan indicating that an index has no plan for executing a query. **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'NoPlan',
  extends: 'foam.dao.index.Plan',
  axoims: [ foam.pattern.Singleton.create() ],

  properties: [
    { name: 'cost', value: Number.MAX_VALUE }
  ],

  methods: [
    function toString() { return "no-plan"; }
  ]
});

foam.CLASS({
  package: 'foam.dao.index',
  name: 'CustomPlan',
  extends: 'foam.dao.index.Plan',

  properties: [
    {
      class: 'Function',
      name: 'customExecute',
    },
    {
      class: 'Function',
      name: 'customToString'
    }
  ],

  methods: [
    function execute(promise, state, sink, skip, limit, order, predicate) {
      this.customExecute.call(this, promise, state, sink, skip, limit, order, predicate);
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
      name: 'count',
    },
  ],

  methods: [
    function execute(promise, sink, skip, limit, order, predicate) {
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
    'prop',
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
        'IN(key=' + prop && prop.name + ', cost=' + this.cost + ", " +
          ', size=' + this.subPlans.length + ')' :
        'lookup(key=' + prop && prop.name + ', cost=' + this.cost + ", " +
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
    /** Adds or updates the given value in the index */
    function put(value) {},
    /** Removes the given value from the index */
    function remove(value) {},
    /** @return a Plan to execute a select with the given parameters */
    function plan(sink, skip, limit, order, predicate) {},
    /** @return the stored value for the given key. */
    function get(key) {},
    /** @return the integer size of this index. */
    function size() {},

    /** Selects matching items from the index and puts them into sink */
    function select(sink, skip, limit, order, predicate) { },
    /** Selects matching items in reverse order from the index and puts
      them into sink */
    function selectReverse(sink, skip, limit, order, predicate) { },
  ],
});


/** An Index which holds only a single value. **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'ValueIndex',
  extends: 'foam.dao.index.Index',
  implements: [
    'foam.dao.index.Plan',
  ],

  properties: [
    {
      class: 'Simple',
      name: 'value'
    },
    { name: 'cost', value: 1 },
  ],

  methods: [
    // from Plan (this index is its own plan)
    function execute(promise, sink, skip, limit, order, predicate) {
      sink.put(this.value);
    },

    // from Index
    function put(s) { this.value = s; },
    function remove() { this.value = undefined; },
    function plan() { return this; },
    function get(key) { return this.value; },
    function size() { return typeof this.value == 'undefined' ? 0 : 1; },
    function toString() { return 'value'; },

    function select(sink, skip, limit, order, predicate) {
      if ( predicate && ! predicate.f(this.value) ) return;
      if ( skip && skip[0]-- > 0 ) return;
      if ( limit && limit[0]-- <= 0 ) return;
      sink.put(this.value);
    },
    function selectReverse(sink, skip, limit, order, predicate) {
      this.select(sink, skip, limit, order, predicate);
    },

  ],
});


/** An AATree (balanced binary search tree) Index. **/
foam.CLASS({
  package: 'foam.dao.index',
  name: 'TreeIndex',
  extends: 'foam.dao.index.Index',

  properties: [
    'subIndexModel',
    'prop',
    [ 'selectCount', 0 ],
    {
      name: 'nullNode',
      factory: function() {
        return foam.dao.index.NullTreeNode.create({ index: this });
      }
    },
    {
      name: 'root',
      factory: function() {
        return this.nullNode;
      }
    }
  ],

  methods: [
    /**
     * Bulk load an unsorted array of objects.
     * Faster than loading individually, and produces a balanced tree.
     **/
    function bulkLoad(a) {
      a = a.a || a;
      this.root = foam.dao.index.NullTreeNode.create({ index: this });

      // Only safe if children aren't themselves trees
      if ( this.subIndexModel === foam.dao.index.ValueIndex ) {
        a.sort(toCompare(this.prop));
        this.root = this.root.bulkLoad_(a, 0, a.length-1);
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

    // TODO: remove the 's' in these and use a known root node
    function put(newValue) {
      this.root = this.root.putKeyValue(this.prop.f(newValue), newValue);
    },

    function remove(value) {
      this.root = this.root.removeKeyValue(this.prop.f(value), value);
    },

    function get(key) {
      return this.root.get(key); // does not delve into sub-indexes
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
      var predicate = predicate;

      if ( predicate === foam.mlang.predicate.False ) return foam.dao.index.NotFoundPlan.create();

      if ( ! predicate && foam.mlang.sink.Count.isInstance(sink) ) {
        var count = this.size();
        //        console.log('**************** COUNT SHORT-CIRCUIT ****************', count, this.toString());
        return foam.dao.index.CountPlan.create({ count: count });
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

          if ( foam.mlang.predicate.And.isInstance(predicate) ) {
            for ( var i = 0 ; i < predicate.args.length ; i++ ) {
              var q = predicate.args[i];
              if ( model.isInstance(q) && q.arg1 === prop ) {
                predicate = predicate.clone();
                predicate.args[i] = foam.mlang.predicate.True;
                predicate = predicate.partialEval();
                if ( predicate === foam.mlang.predicate.True ) predicate = undefined;
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

      var index = this;

      var arg2 = isExprMatch(foam.mlang.predicate.In);
      if ( arg2 &&
           // Just scan if that would be faster.
           Math.log(this.size())/Math.log(2) * arg2.length < this.size() ) {
        var keys = arg2;
        var subPlans = [];
        var cost = 1;

        for ( var i = 0 ; i < keys.length ; ++i) {
          var result = this.get(keys[i]);

          if ( result ) { // TODO: could refactor this subindex recursion into .plan()
            var subPlan = result.plan(sink, skip, limit, order, predicate);

            cost += subPlan.cost;
            subPlans.push(subPlan);
          }
        }

        if ( subPlans.length == 0 ) return foam.dao.index.NotFoundPlan.create();

        return foam.dao.index.AltPlan.create({
          subPlans: subPlans,
          prop: prop
        });
      }

      arg2 = isExprMatch(foam.mlang.predicate.Eq);
      if ( arg2 != undefined ) {
        var key = arg2.f();
        var result = this.get(key);

        if ( ! result ) return foam.dao.index.NotFoundPlan.create();

        var subPlan = result.plan(sink, skip, limit, order, predicate);

        return foam.dao.index.AltPlan.create({
          subPlans: [subPlan],
          prop: prop
        });
      }

      // Restrict the subtree to search as necessary
      var subTree = this.root;
      
      arg2 = isExprMatch(foam.mlang.predicate.Gt);
      if ( arg2 ) subTree = subTree.gt(arg2.f());

      arg2 = isExprMatch(foam.mlang.predicate.Gte);
      if ( arg2 ) subTree = subTree.gte(arg2.f());

      arg2 = isExprMatch(foam.mlang.predicate.Lt);
      if ( arg2 ) subTree = subTree.lt(arg2.f());
      
      arg2 = isExprMatch(foam.mlang.predicate.Lte);
      if ( arg2 ) subTree = subTree.lte(arg2.f());
      
      var cost = subTree.size;
      var sortRequired = false;
      var reverseSort = false;

      if ( order ) {
        if ( order === prop ) {
          // sort not required
        } else if ( foam.mlang.order.Desc && foam.mlang.order.Desc.isInstance(order) && order.arg1 === prop ) {
          // reverse-sort, sort not required
          reverseSort = true;
        } else {
          sortRequired = true;
          if ( cost != 0 ) cost *= Math.log(cost) / Math.log(2);
        }
      }

      if ( ! sortRequired ) {
        if ( skip ) cost -= skip;
        if ( limit ) cost = Math.min(cost, limit);
      }

      return foam.dao.index.CustomPlan.create({
        cost: cost,
        customExecute: function(promise, sink, skip, limit, order, predicate) {
          if ( sortRequired ) {
            var arrSink = foam.dao.ArraySink.create();
            index.selectCount++;
            subTree.select(arrSink, null, null, null, predicate);
            index.selectCount--;
            var a = arrSink.a;
            a.sort(toCompare(order));

            var skip = skip || 0;
            var limit = Number.isFinite(limit) ? limit : a.length;
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
      return 'TreeIndex(' + this.prop.name + ', ' + this.subIndexModel + ')';
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
      this.root = this.root.putKeyValue(this.prop.f(newValue).toLowerCase(), newValue);
    },

    function remove(value) {
      this.root = this.root.removeKeyValue(this.prop.f(value).toLowerCase(), value);
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
    function dedup(obj, value) {
      // NOP, not safe to do here
    },

    function put(newValue) {
      var a = this.prop.f(newValue);

      if ( a.length ) {
        for ( var i = 0 ; i < a.length ; i++ ) {
          this.root = this.root.putKeyValue(a[i], newValue);
        }
      } else {
        this.root = this.root.putKeyValue('', newValue);
      }
    },

    function remove(value) {
      var a = this.prop.f(value);

      if ( a.length ) {
        for ( var i = 0 ; i < a.length ; i++ ) {
          this.root = this.root.removeKeyValue(a[i], value);
        }
      } else {
        this.root = this.root.removeKeyValue('', value);
      }

      return s;
    }
  ]
});


foam.CLASS({
  package: 'foam.dao.index',
  name: 'AltIndex',
  extends: 'foam.dao.index.Index',

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
      if ( bestPlan == undefined || bestPlan == foam.dao.index.NoPlan.create() ) {
        return foam.dao.index.NoPlan.create();
      }
      return bestPlan;
    },

    function size(obj) { return this.delegates[0].size(); },

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

    function put(newValue) { },

    function remove(obj) { },

    function bulkLoad(a) {
      return 'auto';
    },

    function addIndex(prop) {
      if ( foam.mlang.order.Desc && foam.mlang.order.Desc.isInstance(prop) ) {
        prop = prop.arg1;
      }
      console.log('Adding AutoIndex : ', prop.id);
      this.properties[prop.name] = true;
      this.mdao.addIndex(prop);
    },

    function plan(sink, skip, limit, order, predicate) {
      if ( order && foam.core.Property.isInstance(order) && ! this.properties[order.name] ) {
        this.addIndex(order);
      } else if ( predicate ) {
        // TODO: check for property in predicate
      }
      return foam.dao.index.NoPlan.create();
    },
    function toString() {
      return 'AutoIndex()';
    }
  ]
});




// var mLangIndex = {
//   create: function(mlang) {
//     return {
//       __proto__: this,
//       mlang: mlang,
//       PLAN: {
//         cost: 0,
//         execute: function(promise, s, sink, skip, limit, order, predicate) {
//           sink.copyFrom(s);
//         },
//         toString: function() { return 'mLangIndex(' + this.s + ')'; }
//       }
//     };
//   },

//   bulkLoad: function(a) {
//     a.select(this.mlang);
//     return this.mlang;
//   },

//   put: function(s, newValue) {
//     // TODO: Should we clone s here?  That would be more
//     // correct in terms of the purely functional interface
//     // but maybe we can get away with it.
//     s = s || this.mlang.clone();
//     s.put(newValue);
//     return s;
//   },

//   remove: function(s, obj) {
//     // TODO: Should we clone s here?  That would be more
//     // correct in terms of the purely functional interface
//     // but maybe we can get away with it.
//     s = s || this.mlang.clone();
//     s.remove && s.remove(obj);
//     return s;
//   },

//   size: function(s) { return Number.MAX_VALUE; },

//   plan: function(s, sink, skip, limit, order, predicate) {
//     // console.log('s');
//     if ( predicate ) return foam.dao.index.NoPlan.create();

//     if ( sink.model_ && sink.model_.isInstance(s) && s.arg1 === sink.arg1 ) {
//       this.PLAN.s = s;
//       return this.PLAN;
//     }

//     return foam.dao.index.NoPlan.create();
//   },

//   toString: function() {
//     return 'mLangIndex(' + this.mlang + ')';
//   }

// };

