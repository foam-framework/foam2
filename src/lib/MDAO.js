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
 * Index Interface:
 *   put(state, value) -> new state
 *   remove(state, value) -> new state
 *   removeAll(state) -> new state // TODO
 *   plan(state, sink, skip, limit, order, predicate) -> {cost: int, toString: fn, execute: fn}
 *   size(state) -> int
 * Add:
 *   get(key) -> obj
 *   update(oldValue, newValue)
 *
 * TODO:
 *  model indexes
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

  f.toSQL = function() { return args.map(function(s) { return s.toSQL(); }).join(','); };
  f.toMQL = function() { return args.map(function(s) { return s.toMQL(); }).join(' '); };
  f.toBQL = function() { return args.map(function(s) { return s.toBQL(); }).join(' '); };
  f.toString = f.toSQL;

  return f;
};


/** Plan indicating that there are no matching records. **/
var NOT_FOUND = {
  cost: 0,
  execute: function(_, sink) { },
  toString: function() { return "no-match(cost=0)"; }
};

/** Plan indicating that an index has no plan for executing a query. **/
var NO_PLAN = {
  cost: Number.MAX_VALUE,
  execute: function(promise, _, sink) { },
  toString: function() { return "no-plan"; }
};

function dump(o) {
  if ( Array.isArray(o) ) return '[' + o.map(dump).join(',') + ']';
  return o ? o.toString() : '<undefined>';
}

/** An Index which holds only a single value. **/
var ValueIndex = {
  put: function(s, newValue) { return newValue; },
  remove: function() { return undefined; },
  plan: (function() {
           var plan = {
             cost: 1,
             execute: function(promise, s, sink) {
               sink.put(s);
             },
             toString: function() { return 'unique'; }
           };

           return function() { return plan; };
         })(),
  get: function(value, key) { return value; },
  /** Skip and limit are modified in place, so passed by reference as one-element arrays.
    TODO: make this better (this used to be an options object) */
  select: function(value, sink, skip, limit, order, predicate) {
    if ( predicate && ! predicate.f(value) ) return;
    if ( skip && skip[0]-- > 0 ) return;
    if ( limit && limit[0]-- < 1 ) return;
    sink.put(value);
  },
  /** Skip and limit are modified in place, so passed by reference as one-element arrays.
    TODO: make this better (this used to be an options object) */
  selectReverse: function(value, sink, skip, limit, order, predicate) {
    this.select(value, sink, skip, limit, order, predicate);
  },
  size:   function(obj) { return 1; },
  toString: function() { return 'value'; }
};

/** Represents one node's state in a binary tree */
foam.CLASS({
  package: 'foam.dao.index',
  name: 'TreeNode',

  properties: [
    {
      class: 'Simple',
      name: 'key',
//       preSet: function(o, n) {
//         return n;
//       }
    },
    {
      class: 'Simple',
      name: 'value',
//       preSet: function(o, n) {
//         return n;
//       }
    },
    { class: 'Simple', name: 'size' },
    { class: 'Simple', name: 'level' },
    { class: 'Simple', name: 'left' },
    { class: 'Simple', name: 'right' },

    { class: 'Simple', name: 'index' }, // replace with export/import
  ],

  methods: [
    function init() {
      this.left  = this.left  || foam.dao.index.NullTreeNode.create(this);
      this.right = this.right || foam.dao.index.NullTreeNode.create(this);
    },

    /** Nodes do a shallow clone */
    function clone() {
      var c = this.cls_.create();
      var ps = this.cls_.getAxiomsByClass(foam.core.Property);
      for ( var i = 0; i < ps.length; ++i ) {
        var name = ps[i].name;
        var value = this[name];
        if ( typeof value !== 'undefined' ) c[name] = value;
      }
      return c;
    },

    /** Clone is only needed if a select() is active in the tree at the
      same time we are updating it. */
    function maybeClone() {
      return ( this.index.selectCount > 0 ) ? this.clone() : this;
    },

    function updateSize() {
      this.size = this.index.size(this.left) +
        this.index.size(this.right) + this.index.tail.size(this.value);
    },

    /** @return Another node representing the rebalanced AA tree. */
    function skew() {
      if ( this.left.level === this.level ) {
        // Swap the pointers of horizontal left links.
        var l = this.left.maybeClone();

        this.left = l.right;
        l.right = this;

        this.updateSize();
        l.updateSize();

        return l;
      }

      return this;
    },

    /** @return a node representing the rebalanced AA tree. */
    function split() {
      if ( this.right.level && this.right.right.level && this.level === this.right.right.level ) {
        // We have two horizontal right links.  Take the middle node, elevate it, and return it.
        var r = this.right.maybeClone();

        this.right = r.left;
        r.left = this;
        r.level++;

        this.updateSize();
        r.updateSize();

        return r;
      }

      return this;
    },

    function predecessor() {
      if ( ! this.left.level ) return this;
      for ( var s = this.left ; s.right.level ; s = s.right );
        return s;
    },
    function successor() {
      if ( ! this.right.level ) return this;
      for ( var s = this.right ; s.left.level ; s = s.left );
        return s;
    },

    /** Removes links that skip levels.
      @return the tree with its level decreased. */
    function decreaseLevel() {
      var expectedLevel = Math.min(this.left.level ? this.left.level : 0, this.right.level ? this.right.level : 0) + 1;

      if ( expectedLevel < this.level ) {
        this.level = expectedLevel;
        if ( this.right.level && expectedLevel < this.right.level ) {
          this.right = this.right.maybeClone();
          this.right.level = expectedLevel;
        }
      }
      return this;
    },

    /** extracts the value with the given key from the index */
    function get(key) {
      var r = this.index.compare(this.key, key);

      if ( r === 0 ) return this.value; // TODO... tail.get(this.value) ???

      return r > 0 ? this.left.get(key) : this.right.get(key);
    },

    function putKeyValue(key, value) {
      var s = this.maybeClone();

      var r = this.index.compare(s.key, key);

      if ( r === 0 ) {
        this.index.dedup(value, s.key);

        s.size -= this.index.tail.size(s.value);
        s.value = this.index.tail.put(s.value, value);
        s.size += this.index.tail.size(s.value);
      } else {
        var side = r > 0 ? 'left' : 'right';

        if ( s[side].level ) s.size -= s[side].size;
        s[side] = s[side].putKeyValue(key, value);
        s.size += s[side].size;
      }

      return s.split().skew();
    },

    function removeKeyValue(key, value) {
      var s = this.maybeClone();

      var r = this.index.compare(s.key, key);

      if ( r === 0 ) {
        s.size -= this.index.tail.size(s.value);
        s.value = this.index.tail.remove(s.value, value);

        // If the sub-Index still has values, then don't
        // delete this node.
        if ( s.value ) {
          s.size += this.index.tail.size(s.value);
          return s;
        }

        // If we're a leaf, easy, otherwise reduce to leaf case.
        if ( ! s.left.level && ! s.right.level ) {
          return foam.dao.index.NullTreeNode.create({ index: this.index });
        }

        var side = s.left.level ? 'left' : 'right';

        // TODO: it would be faster if successor and predecessor also deleted
        // the entry at the same time in order to prevent two traversals.
        // But, this would also duplicate the delete logic.
        var l = side === 'left' ?
          s.predecessor() :
          s.successor()   ;

        s.key = l.key;
        s.value = l.value;

        s[side] = s[side].removeNode(l.key);
      } else {
        var side = r > 0 ? 'left' : 'right';

        s.size -= s[side].size;
        s[side] = s[side].removeKeyValue(key, value);
        s.size += s[side].size;
      }

      // Rebalance the tree. Decrease the level of all nodes in this level if
      // necessary, and then skew and split all nodes in the new level.
      s = s.decreaseLevel().skew();
      if ( s.right.level ) {
        s.right = s.right.maybeClone().skew();
        if ( s.right.right.level ) s.right.right = s.right.right.maybeClone().skew();
      }
      s = s.split();
      s.right = s.right.maybeClone().split();

      return s;
    },

    function removeNode(key) {
      var s = this.maybeClone();

      var r = this.index.compare(s.key, key);

      if ( r === 0 ) return s.left.level ? s.left : s.right;

      var side = r > 0 ? 'left' : 'right';

      s.size -= s[side].size;
      s[side] = s[side].removeNode(key);
      s.size += s[side].size;

      return s;
    },

    function select(sink, skip, limit, order, predicate) {
      if ( limit && limit[0] <= 0 ) return;

      if ( skip && skip[0] >= this.size && ! predicate ) {
        skip[0] -= this.size;
        return;
      }
      // TODO: all these index.tail references will go away once actual
      // sub-index instances are stored in this.value
      this.left.select(sink, skip, limit, order, predicate);
      this.index.tail.select(this.value, sink, skip, limit, order, predicate);
      this.right.select(sink, skip, limit, order, predicate);
    },

    function selectReverse(sink, skip, limit, order, predicate) {
      if ( limit && limit[0] <= 0 ) return;

      if ( skip && skip[0] >= this.size ) {
        skip[0] -= this.size;
        return;
      }

      this.right.selectReverse(sink, skip, limit, order, predicate);
      this.index.tail.selectReverse(this.value, sink, skip, limit, order, predicate);
      this.left.selectReverse(sink, skip, limit, order, predicate);
    },

  ]
});

foam.CLASS({
  package: 'foam.dao.index',
  name: 'NullTreeNode',
  extends: 'foam.dao.index.TreeNode',
  axioms: [
    foam.pattern.Multiton.create({
      property: foam.dao.index.TreeNode.INDEX
    })
  ],

  methods: [
    function init() {
      this.left  = undefined;
      this.right = undefined;
      this.size = 0;
      this.level = 0;
    },

    function clone() {         return this; },
    function maybeClone() {    return this; },
    function skew() {          return this; },
    function split() {         return this; },
    function decreaseLevel() { return this; },
    function get() {           return undefined; },
    function updateSize() { },

    /** Add a new value to the tree */
    function putKeyValue(key, value) {
      return foam.dao.index.TreeNode.create({
        key: key,
        value: this.index.tail.put(null, value),
        size: 1,
        level: 1,
        index: this.index
      });
    },
    function removeKeyValue(key, value) { return this; },
    function removeNode(key) { return this; },
    function select() { },
    function selectReverse() {},
  ]


});

/** An AATree (balanced binary search tree) Index. **/
var TreeIndex = {
  create: function(prop, tail) {
    // value index just stores the value in each node
    tail = tail || ValueIndex;

    return {
      __proto__: this,
      prop: prop, // the property we index over
      tail: tail, // the factory for making sub-indexes for the value at each node
      selectCount: 0
    };
  },

  /**
   * Bulk load an unsorted array of objects.
   * Faster than loading individually, and produces a balanced tree.
   **/
  bulkLoad: function(a) {
    a = a.a || a;
    // Only safe if children aren't themselves trees
    if ( this.tail === ValueIndex ) {
      a.sort(toCompare(this.prop));
      return this.bulkLoad_(a, 0, a.length-1);
    }

    var s = foam.dao.index.NullTreeNode.create({ index: this });
    for ( var i = 0 ; i < a.length ; i++ ) {
      s = this.put(s, a[i]);
    }
    return s;
  },

  bulkLoad_: function(a, start, end) {
    if ( end < start ) return undefined;

    var m    = start + Math.floor((end-start+1) / 2);
    var tree = this.put(undefined, a[m]);

    tree.left = this.bulkLoad_(a, start, m-1);
    tree.right = this.bulkLoad_(a, m+1, end);
    tree.size += this.size(tree.left) + this.size(tree.right);

    return tree;
  },

  /** Set the value's property to be the same as the key in the index.
      This saves memory by sharing objects. */
  dedup: function(obj, value) {
    obj[this.prop.name] = value;
  },

  // TODO: remove the 's' in these and use a known root node
  put: function(s, newValue) {
    if ( ! s ) s = foam.dao.index.NullTreeNode.create({ index: this });
    return s.putKeyValue(this.prop.f(newValue), newValue);
  },

  remove: function(s, value) {
    if ( ! s ) return s;
    return s.removeKeyValue(this.prop.f(value), value);
  },

  get: function(s, key) {
    if ( ! s ) return undefined;

    return s.get(key);
  },

  select: function(s, sink, skip, limit, order, predicate) {
    return s.select(sink, skip, limit, order, predicate);
  },

  selectReverse: function(s, sink, skip, limit, order, predicate) {
    return s.selectReverse(sink, skip, limit, order, predicate);
  },

  findPos: function(s, key, incl) {
    if ( ! s.level ) return 0;
    var r = this.compare(s.key, key);
    if ( r === 0 ) {
      return incl ?
        this.size(s.left) :
        this.size(s) - this.size(s.right);
    }
    return r > 0 ?
      this.findPos(s.left, key, incl) :
      this.findPos(s.right, key, incl) + this.size(s) - this.size(s.right);
  },

  size: function(s) { return s.level ? s.size : 0; },

  compare: function(o1, o2) {
    return foam.util.compare(o1, o2);
  },

  plan: function(s, sink, skip, limit, order, predicate) {
    var predicate = predicate;

    if ( predicate === foam.mlang.predicate.False ) return NOT_FOUND;

    if ( ! predicate && foam.mlang.sink.Count.isInstance(sink) ) {
      var count = this.size(s);
      //        console.log('**************** COUNT SHORT-CIRCUIT ****************', count, this.toString());
      return {
        cost: 0,
        execute: function(promise, unused, sink, skip, limit, order, predicate) { sink.value += count; },
        toString: function() { return 'short-circuit-count(' + count + ')'; }
      };
    }

//    if ( limit != null && skip != null && skip + limit > this.size(s) ) return NO_PLAN;

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
              if ( predicate === foam.mlang.predicate.True ) predicate = null;
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
         Math.log(this.size(s))/Math.log(2) * arg2.length < this.size(s) ) {
      var keys = arg2;
      var subPlans = [];
      var results  = [];
      var cost = 1;

      for ( var i = 0 ; i < keys.length ; ++i) {
        var result = this.get(s, keys[i]);

        if ( result ) {
          var subPlan = this.tail.plan(result, sink, skip, limit, order, predicate);

          cost += subPlan.cost;
          subPlans.push(subPlan);
          results.push(result);
        }
      }

      if ( subPlans.length == 0 ) return NOT_FOUND;

      return {
        cost: 1 + cost,
        execute: function(promise, s2, sink, skip, limit, order, predicate) {
          for ( var i = 0 ; i < subPlans.length ; ++i) {
            subPlans[i].execute(promise, results[i], sink, skip, limit, order, predicate);
          }
        },
        toString: function() {
          return 'IN(key=' + prop.name + ', size=' + results.length + ')';
        }
      };
    }

    arg2 = isExprMatch(foam.mlang.predicate.Eq);
    if ( arg2 != undefined ) {
      var key = arg2.f();
      var result = this.get(s, key);

      if ( ! result ) return NOT_FOUND;

      var subPlan = this.tail.plan(result, sink, skip, limit, order, predicate);

      return {
        cost: 1 + subPlan.cost,
        execute: function(promise, s2, sink, skip, limit, order, predicate) {
          return subPlan.execute(promise, result, sink, skip, limit, order, predicate);
        },
        toString: function() {
          return 'lookup(key=' + prop.name + ', cost=' + this.cost + (predicate && predicate.toSQL ? ', predicate: ' + predicate.toSQL() : '') + ') ' + subPlan.toString();
        }
      };
    }

    arg2 = isExprMatch(foam.mlang.predicate.Gt);
    if ( arg2 != undefined ) {
      var key = arg2.f();
      var pos = this.findPos(s, key, false);
      skip = ((skip) || 0) + pos;
    }

    arg2 = isExprMatch(foam.mlang.predicate.Gte);
    if ( arg2 != undefined ) {
      var key = arg2.f();
      var pos = this.findPos(s, key, true);
      skip = ((skip) || 0) + pos;
    }

    arg2 = isExprMatch(foam.mlang.predicate.Lt);
    if ( arg2 != undefined ) {
      var key = arg2.f();
      var pos = this.findPos(s, key, true);
      limit = Math.min(limit, (pos - (skip || 0)) );
    }

    arg2 = isExprMatch(foam.mlang.predicate.Lte);
    if ( arg2 != undefined ) {
      var key = arg2.f();
      var pos = this.findPos(s, key, false);
      limit = Math.min(limit, (pos - (skip || 0)) );
    }

    var cost = this.size(s);
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

    return {
      cost: cost,
      execute: function(promise, s, sink, skip, limit, order, predicate) {
        if ( sortRequired ) {
          var arrSink = foam.dao.ArraySink.create();
          index.selectCount++;
          index.select(s, arrSink, null, null, null, predicate);
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
// What did this do?  It appears to break sorting in saturn mail
/*          if ( reverseSort && skip )
            // TODO: temporary fix, should include range in select and selectReverse calls instead.
            skip = index.size(s) - skip - (limit || index.size(s)-skip)
            */
          index.selectCount++;
          reverseSort ? // Note: pass skip and limit by reference, as they are modified in place
            index.selectReverse(s, sink, [skip], [limit], order, predicate) :
            index.select(s, sink, [skip], [limit], order, predicate) ;
          index.selectCount--;
        }
      },
      toString: function() { return 'scan(key=' + prop.name + ', cost=' + this.cost + (predicate && predicate.toSQL ? ', predicate: ' + predicate.toSQL() : '') + ')'; }
    };
  },

  toString: function() {
    return 'TreeIndex(' + this.prop.name + ', ' + this.tail + ')';
  }

};


/** Case-Insensitive TreeIndex **/
var CITreeIndex = {
  __proto__: TreeIndex,

  create: function(prop, tail) {
    tail = tail || ValueIndex;

    return {
      __proto__: this,
      prop: prop,
      tail: tail
    };
  },

  put: function(s, newValue) {
    return this.putKeyValue(s, this.prop.f(newValue).toLowerCase(), newValue);
  },

  remove: function(s, value) {
    return this.removeKeyValue(s, this.prop.f(value).toLowerCase(), value);
  }

};


/** An Index for storing multi-valued properties. **/
var SetIndex = {
  __proto__: TreeIndex,

  create: function(prop, tail) {
    tail = tail || ValueIndex;

    return {
      __proto__: this,
      prop: prop,
      tail: tail
    };
  },

  // TODO: see if this can be done some other way
  dedup: function(obj, value) {
    // NOP, not safe to do here
  },

  put: function(s, newValue) {
    var a = this.prop.f(newValue);

    if ( a.length ) {
      for ( var i = 0 ; i < a.length ; i++ ) {
        s = this.putKeyValue(s, a[i], newValue);
      }
    } else {
      s = this.putKeyValue(s, '', newValue);
    }

    return s;
  },

  remove: function(s, value) {
    var a = this.prop.f(value);

    if ( a.length ) {
      for ( var i = 0 ; i < a.length ; i++ ) {
        s = this.removeKeyValue(s, a[i], value);
      }
    } else {
      s = this.removeKeyValue(s, '', value);
    }

    return s;
  }

};

var PositionQuery = {
  create: function(args) {
    return {
      __proto__: this,
      skip: args.skip,
      limit: args.limit,
      s: args.s
    };
  },
  reduce: function(other) {
    var otherFinish = other.skip + other.limit;
    var myFinish = this.skip + this.limit;

    if ( other.skip > myFinish ) return null;
    if ( other.skip >= this.skip ) {
      return PositionQuery.create({
        skip: this.skip,
        limit: Math.max(myFinish, otherFinish) - this.skip,
        s: this.s
      });
    }
    return other.reduce(this);
  },
  equals: function(other) {
    return this.skip === other.skip && this.limit === other.limit;
  }
};

var AutoPositionIndex = {
  create: function(factory, mdao, networkdao, maxage) {
    var obj = {
      __proto__: this,
      factory: factory,
      maxage: maxage,
      dao: mdao,
      networkdao: networkdao,
      sets: [],
      alt: AltIndex.create()
    };
    return obj;
  },

  put: function(s, value) { return this.alt.put(s, value); },
  remove: function(s, value) { return this.alt.remove(s, value); },

  bulkLoad: function(a) {
    return [];
  },

  addIndex: function(s, index) {
    return this;
  },

  addPosIndex: function(s, skip, limit, order, predicate) {
    var index = PositionIndex.create(
      order,
      predicate,
      this.factory,
      this.dao,
      this.networkdao,
      this.queue,
      this.maxage);

    this.alt.delegates.push(index);
    s.push(index.bulkLoad([]));
  },

  hasIndex: function(skip, limit, order, predicate) {
    for ( var i = 0; i < this.sets.length; i++ ) {
      var set = this.sets[i];
      if ( set[0].equals((predicate) || '') && set[1].equals((order) || '') ) return true;
    }
    return false;
  },

  plan: function(s, sink, skip, limit, order, predicate) {
    var subPlan = this.alt.plan(s, sink, skip, limit, order, predicate);

    if ( subPlan != NO_PLAN ) return subPlan;

    if ( ( skip != null && limit != null ) ||
         CountExpr.isInstance(sink) ) {
      if ( this.hasIndex(skip, limit, order, predicate) ) return NO_PLAN;
      this.sets.push([(predicate) || '', (order) || '']);
      this.addPosIndex(s, skip, limit, order, predicate);
      return this.alt.plan(s, sink, skip, limit, order, predicate);
    }
    return NO_PLAN;
  }
};

var PositionIndex = {
  create: function(order, predicate, factory, dao, networkdao, queue, maxage) {
    var obj = {
      __proto__: this,
      order: order || '',
      predicate: predicate || '',
      factory: factory,
      dao: dao,
      networkdao: networkdao.where(predicate).orderBy(order),
      maxage: maxage,
      queue: arequestqueue(function(ret, request) {
        var s = request.s;
        obj.networkdao
          .skip(request.skip)
          .limit(request.limit)
          .select()(function(objs) {
            var now = Date.now();
            for ( var i = 0; i < objs.length; i++ ) {
              s[request.skip + i] = {
                obj: objs[i].id,
                timestamp: now
              };
              s.feedback = objs[i].id;
              obj.dao.put(objs[i]);
              s.feedback = null;
            }
            ret();
          });
      }, undefined, 1)
    };
    return obj;
  },

  put: function(s, newValue) {
    if ( s.feedback === newValue.id ) return s;
    if ( this.predicate && ! this.predicate.f(newValue) ) return s;

    var compare = toCompare(this.order);

    for ( var i = 0; i < s.length; i++ ) {
      var entry = s[i]
      if ( ! entry ) continue;
      // TODO: This abuses the fact that find is synchronous.
      this.dao.find(entry.obj, { put: function(o) { entry = o; } });

      // Only happens when things are put into the dao from a select on this index.
      // otherwise objects are removed() first from the MDAO.
      if ( entry.id === newValue.id ) {
        break;
      }

      if ( compare(entry, newValue) > 0 ) {
        for ( var j = s.length; j > i; j-- ) {
          s[j] = s[j-1];
        }

        // If we have objects on both sides, put this one here.
        if ( i == 0 || s[i-1] ) s[i] = {
          obj: newValue.id,
          timestamp: Date.now()
        };
        break;
      }
    }
    return s;
  },

  remove: function(s, obj) {
    if ( s.feedback === obj.id ) return s;
    for ( var i = 0; i < s.length; i++ ) {
      if ( s[i] && s[i].obj === obj.id ) {
        for ( var j = i; j < s.length - 1; j++ ) {
          s[j] = s[j+1];
        }
        break;
      }
    }
    return s;
  },

  bulkLoad: function(a) { return []; },

  plan: function(s, sink, skip, limit, order, predicate) {
    var order = ( order ) || '';
    var predicate = ( predicate ) || '';

    var self = this;

    if ( ! order.equals(this.order) ||
         ! predicate.equals(this.predicate) ) return NO_PLAN;

    if ( foam.mlang.sink.Count.isInstance(sink) ) {
      return {
        cost: 0,
        execute: function(promise, s, sink, skip, limit, order, predicate) {
          // TODO: double check this bit...
          if ( ! s.value ) {
            // TODO: memoize, expire after self.maxage, as per foam1 amemo
            s.value = self.networkdao.select(foam.mlang.sink.Count.create());
          }

          promise[0] = promise[0].then(s.value.then(function(countSink) {
            sink.value = countSink.value;
            return Promise.resolve(sink);
          }));
        },
        toString: function() { return 'position-index(cost=' + this.cost + ', count)'; }
      }
    } else if ( skip == undefined || limit == undefined ) {
      return NO_PLAN;
    }

    var threshold = Date.now() - this.maxage;
    return {
      cost: 0,
      toString: function() { return 'position-index(cost=' + this.cost + ')'; },
      execute: function(promise, s, sink, skip, limit, order, predicate) {
        var objs = [];

        var min;
        var max;

        for ( var i = 0 ; i < limit; i++ ) {
          var o = s[i + skip];
          if ( ! o || o.timestamp < threshold ) {
            if ( min == undefined ) min = i + skip;
            max = i + skip;
          }
          if ( o ) {
            // TODO: Works because find is actually synchronous.
            // this will need to fixed if find starts using an async function.
            self.dao.find(o.obj, { put: function(obj) { objs[i] = obj; } });
          } else {
            objs[i] = self.factory();
          }
          if ( ! objs[i] ) debugger;
        }

        if ( min != undefined ) {
          self.queue(PositionQuery.create({
            skip: min,
            limit: (max - min) + 1,
            s: s
          }));
        }

        for ( var i = 0; i < objs.length; i++ ) {
          sink.put(objs[i]);
        }
      }
    };
  }
};

var AltIndex = {
  // Maximum cost for a plan which is good enough to not bother looking at the rest.
  GOOD_ENOUGH_PLAN: 10, // put to 10 or more when not testing

  create: function() {
    return {
      __proto__: this,
      delegates: foam.Array.argsToArray(arguments)
    };
  },

  addIndex: function(s, index) {
    // Populate the index
    var a = foam.dao.ArraySink.create();
    this.plan(s, a).execute([Promise.resolve()], s, a);

    s.push(index.bulkLoad(a));
    this.delegates.push(index);

    return this;
  },

  bulkLoad: function(a) {
    var root = this.ArraySink.create();
    for ( var i = 0 ; i < this.delegates.length ; i++ ) {
      root[i] = this.delegates[i].bulkLoad(a);
    }
    return root;
  },

  get: function(s, key) {
    return this.delegates[0].get(s[0], key);
  },

  put: function(s, newValue) {
    s = s || this.ArraySink.create();
    for ( var i = 0 ; i < this.delegates.length ; i++ ) {
      s[i] = this.delegates[i].put(s[i], newValue);
    }

    return s;
  },

  remove: function(s, obj) {
    s = s || this.ArraySink.create();
    for ( var i = 0 ; i < this.delegates.length ; i++ ) {
      s[i] = this.delegates[i].remove(s[i], obj);
    }

    return s;
  },

  plan: function(s, sink, skip, limit, order, predicate) {
    var bestPlan;
    var bestPlanI = 0;
    //    console.log('Planning: ' + (predicate && predicate.toSQL && predicate.toSQL()));
    for ( var i = 0 ; i < this.delegates.length ; i++ ) {
      var plan = this.delegates[i].plan(s[i], sink, skip, limit, order, predicate);

      // console.log('  plan ' + i + ': ' + plan);
      if ( plan.cost <= AltIndex.GOOD_ENOUGH_PLAN ) {
        bestPlanI = i;
        bestPlan = plan;
        break;
      }

      if ( ! bestPlan || plan.cost < bestPlan.cost ) {
        bestPlanI = i;
        bestPlan = plan;
      }
    }

    //    console.log('Best Plan: ' + bestPlan);

    if ( bestPlan == undefined || bestPlan == NO_PLAN ) return NO_PLAN;

    return {
      __proto__: bestPlan,
      execute: function(promise, unused, sink, skip, limit, order, predicate) { return bestPlan.execute(promise, s[bestPlanI], sink, skip, limit, order, predicate); }
    };
  },

  size: function(obj) { return this.delegates[0].size(obj[0]); },

  toString: function() {
    return 'Alt(' + this.delegates.join(',') + ')';
  }
};


var mLangIndex = {
  create: function(mlang) {
    return {
      __proto__: this,
      mlang: mlang,
      PLAN: {
        cost: 0,
        execute: function(promise, s, sink, skip, limit, order, predicate) { sink.copyFrom(s); },
        toString: function() { return 'mLangIndex(' + this.s + ')'; }
      }
    };
  },

  bulkLoad: function(a) {
    a.select(this.mlang);
    return this.mlang;
  },

  put: function(s, newValue) {
    // TODO: Should we clone s here?  That would be more
    // correct in terms of the purely functional interface
    // but maybe we can get away with it.
    s = s || this.mlang.clone();
    s.put(newValue);
    return s;
  },

  remove: function(s, obj) {
    // TODO: Should we clone s here?  That would be more
    // correct in terms of the purely functional interface
    // but maybe we can get away with it.
    s = s || this.mlang.clone();
    s.remove && s.remove(obj);
    return s;
  },

  size: function(s) { return Number.MAX_VALUE; },

  plan: function(s, sink, skip, limit, order, predicate) {
    // console.log('s');
    if ( predicate ) return NO_PLAN;

    if ( sink.model_ && sink.model_.isInstance(s) && s.arg1 === sink.arg1 ) {
      this.PLAN.s = s;
      return this.PLAN;
    }

    return NO_PLAN;
  },

  toString: function() {
    return 'mLangIndex(' + this.mlang + ')';
  }

};


/** An Index which adds other indices as needed. **/
var AutoIndex = {
  create: function(mdao) {
    return {
      __proto__: this,
      properties: { id: true },
      mdao: mdao
    };
  },

  put: function(s, newValue) { return s; },

  remove: function(s, obj) { return s; },

  bulkLoad: function(a) {
    return 'auto';
  },

  addIndex: function(prop) {
    if ( GLOBAL.DescExpr && DescExpr.isInstance(prop) ) prop = prop.arg1;

    console.log('Adding AutoIndex : ', prop.id);
    this.properties[prop.name] = true;
    this.mdao.addIndex(prop);
  },

  plan: function(s, sink, skip, limit, order, predicate) {
    if ( order && Property.isInstance(order) && ! this.properties[order.name] ) {
      this.addIndex(order);
    } else if ( predicate ) {
      // TODO: check for property in predicate
    }
    return NO_PLAN;
  },

  toString: function() { return 'AutoIndex()'; }
};


foam.CLASS({
  extends: 'foam.dao.AbstractDAO',
  package: 'foam.dao',
  name: 'MDAO',
  label: 'Indexed DAO',
  requires: [
    'foam.dao.ExternalException',
    'foam.dao.InternalException',
    'foam.dao.ObjectNotFoundException',
    'foam.mlang.predicate.Eq',
    'foam.dao.ArraySink',
  ],
  properties: [
    {
      name:  'of',
      required: true
    },
    {
      type: 'Boolean',
      name: 'autoIndex',
      value: false
    }
  ],

  methods: [

    function init() {
      this.map = {};
      // TODO(kgr): this doesn't support multi-part keys, but should (foam2: still applies!)
      // TODO: generally sort out how .ids is supposed to work
      this.index = TreeIndex.create(this.of.getAxiomByName(
        ( this.of.ids && this.of.ids[0] ) || 'id' ) );
      this.root = foam.dao.index.NullTreeNode.create({ index: this.index });

      if ( this.autoIndex ) this.addRawIndex(AutoIndex.create(this));
    },

    /**
     * Add a non-unique index
     * args: one or more properties
     **/
    function addIndex() {
      var props = foam.Array.argsToArray(arguments);

      if ( ! this.of.ids ) {// throw "Undefined index"; // TODO: err
        this.of.ids = ['id'];
      }

      // Add on the primary key(s) to make the index unique.
      for ( var i = 0 ; i < this.of.ids.length ; i++ ) {
        props.push(this.of.getAxiomByName(this.of.ids[i]));
        if ( ! props[props.length - 1] ) throw "Undefined index property"; // TODO: err
      }

      return this.addUniqueIndex.apply(this, props);
    },

    /**
     * Add a unique index
     * args: one or more properties
     **/
    function addUniqueIndex() {
      var index = ValueIndex;

      for ( var i = arguments.length-1 ; i >= 0 ; i-- ) {
        var prop = arguments[i];
        // TODO: the index prototype should be in the property
        var proto = prop.type == 'Array[]' ? SetIndex : TreeIndex;
        index = proto.create(prop, index);
      }

      return this.addRawIndex(index);
    },

    // TODO: name 'addIndex' and renamed addIndex
    function addRawIndex(index) {
      // Upgrade single Index to an AltIndex if required.
      if ( ! /*AltIndex.isInstance(this.index)*/ this.index.delegates ) {
        this.index = AltIndex.create(this.index);
        this.root = [this.root];
      }

      this.index.addIndex(this.root, index);

      return this;
    },

    /**
     * Bulk load data from another DAO.
     * Any data already loaded into this DAO will be lost.
     * @arg sink (optional) eof is called when loading is complete.
     **/
    function bulkLoad(dao, sink) {
      var self = this;
      return new Promise(function(resolve, reject) {
        dao.select().then(function() {
          self.root = self.index.bulkLoad(this);
          resolve();
        });
      })
    },

    function put(obj) {
      var oldValue = this.map[obj.id];
      if ( oldValue ) {
        this.root = this.index.put(this.index.remove(this.root, oldValue), obj);
      } else {
        this.root = this.index.put(this.root, obj);
      }
      this.map[obj.id] = obj;
      this.pub('on', 'put', obj);
      return Promise.resolve(obj);
    },

    function findObj_(key) {
      var self = this;
      return new Promise(function(resolve, reject) {
        var obj = self.map[key];
        // var obj = this.index.get(this.root, key);
        if ( obj ) {
          resolve(obj);
        } else {
          reject(self.ObjectNotFoundException.create({ id: key })); // TODO: err
        }
      });
    },

    function find(key) {
      var self = this;
      if ( key == undefined ) {
        reject(self.InternalException.create({ id: key })); // TODO: err
        return;
      }
      var foundObj = null;
      return this.findObj_(key);
      // TODO: How to handle multi value primary keys?
      // return new Promise(function(resolve, reject) {
//         self.where(self.Eq.create({ arg1: self.of.getAxiomByName(
//             ( self.of.ids && self.of.ids[0] ) || 'id' ), arg2: key })
//           ).limit(1).select({
//           put: function(obj) {
//             foundObj = obj;
//             resolve(obj);
//           },
//           eof: function() {
//             if ( ! foundObj ) {
//               reject(self.ObjectNotFoundException.create({ id: key })); // TODO: err
//             }
//           },
//           error: function(e) {
//             reject(self.InternalException.create({ id: key })); // TODO: err
//           }
//         });
//       });
    },

    function remove(obj) {
      if ( ! obj || ! obj.id ) {
        return Promise.reject(this.ExternalException.create({ id: 'no_id' })); // TODO: err
      }
      var id = obj.id;
      var self = this;

      return this.find(id).then(
        function(obj) {
          self.root = self.index.remove(self.root, obj);
          delete self.map[obj.id];
          self.pub('on', 'remove', obj);
          return Promise.resolve();
        },
        function(err) {
          if ( self.ObjectNotFoundException.isInstance(err) ) {
            return Promise.resolve(); // not found error is actually ok
          } else {
            return Promise.reject(err);
          }
        }
      );
    },

    function removeAll(skip, limit, order, predicate) {
      if (!predicate) predicate = this.True;
      var self = this;
      return self.where(predicate).select(self.ArraySink.create()).then(
        function(sink) {
          var a = sink.a;
          for ( var i = 0 ; i < a.length ; i++ ) {
            self.root = self.index.remove(self.root, a[i]);
            delete self.map[a[i].id];
            self.pub('on', 'remove', a[i]);
          }
          return Promise.resolve();
        }
      );
    },

    function select(sink, skip, limit, order, predicate) {
      sink = sink || this.ArraySink.create();

      if ( foam.mlang.sink.Explain && foam.mlang.sink.Explain.isInstance(sink) ) {
        var plan = this.index.plan(this.root, sink.arg1, skip, limit, order, predicate);
        sink.plan = 'cost: ' + plan.cost + ', ' + plan.toString();
        sink && sink.eof && sink.eof();
        return Promise.resolve(sink)
      }

      var plan = this.index.plan(this.root, sink, skip, limit, order, predicate);

      var promise = [Promise.resolve()];
      plan.execute(promise, this.root, sink, skip, limit, order, predicate);
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

    function toString() {
      return 'MDAO(' + this.cls_.name + ',' + this.index + ')';
    }
  ]
});
