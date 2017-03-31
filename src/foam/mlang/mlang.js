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

// TODO(braden): Port the partialEval() code over here.

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Count',
  extends: 'foam.dao.AbstractSink',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Sink which counts number of objects put().',

  properties: [
    {
      class: 'Int',
      name: 'value'
    }
  ],

  methods: [
    function put() { this.value++; },

    function toString() { return 'COUNT()'; }
  ]
});


foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'NullSink',
  extends: 'foam.dao.AbstractSink',
  implements: ['foam.core.Serializable'],

  documentation: 'Null Pattern (do-nothing) Sink.',

  axioms: [
    foam.pattern.Singleton.create()
  ]
});


foam.INTERFACE({
  package: 'foam.mlang',
  name: 'Expr',

  documentation: 'Expression interface: f(obj) -> val.',

  methods: [
    {
      name: 'f',
      args: [ 'obj' ]
    },
    {
      name: 'partialEval'
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'ExprProperty',
  extends: 'FObjectProperty',

  documentation: 'Property for Expr values.',

  properties: [
    {
      name: 'adapt',
      value: function(_, o) {
        if ( o === null )                       return foam.mlang.Constant.create({ value: null });
        if ( ! o.f && typeof o === 'function' ) return foam.mlang.predicate.Func.create({ fn: o });
        if ( typeof o !== 'object' )            return foam.mlang.Constant.create({ value: o });
        if ( o instanceof Date )                return foam.mlang.Constant.create({ value: o });
        if ( Array.isArray(o) )                 return foam.mlang.Constant.create({ value: o });
        if ( foam.core.FObject.isInstance(o) )  return o;

        console.error('Invalid expression value: ', o);
      }
    }
  ]
});


foam.INTERFACE({
  package: 'foam.mlang.predicate',
  name: 'Predicate',

  documentation: 'Predicate interface: f(obj) -> boolean.',

  methods: [
    {
      name: 'f',
      args: [
        'obj'
      ]
    },
    {
      name: 'partialEval'
    },
    {
      name: 'toIndex',
      args: [
        'tail'
      ]
    },
    {
      name: 'toDisjunctiveNormalForm'
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'PredicateProperty',
  extends: 'FObjectProperty',

  documentation: 'Property for Predicate values.',

  properties: [
    ['of', 'foam.mlang.predicate.Predicate'],
    {
      name: 'adapt',
      value: function(_, o) {
        if ( ! o.f && typeof o === "function" ) return foam.mlang.predicate.Func.create({ fn: o });
        return o;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'PredicateArray',
  extends: 'FObjectArray',

  documentation: 'Property for storing arrays of Predicates.',

  properties: [
    {
      name: 'of',
      value: 'foam.mlang.predicate.Predicate'
    },
    {
      name: 'adaptArrayElement',
      // TODO?: Make into a multi-method?
      value: function(o) {
        if ( o === null ) return foam.mlang.Constant.create({ value: o });
        if ( ! o.f && typeof o === "function" ) return foam.mlang.predicate.Func.create({ fn: o });
        if ( typeof o !== "object" ) return foam.mlang.Constant.create({ value: o });
        if ( Array.isArray(o) ) return foam.mlang.Constant.create({ value: o });
        if ( o === true ) return foam.mlang.predicate.True.create();
        if ( o === false ) return foam.mlang.predicate.False.create();
        if ( foam.core.FObject.isInstance(o) ) return o;
        console.error('Invalid expression value: ', o);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'AbstractPredicate',
  abstract: true,
  implements: [ 'foam.mlang.predicate.Predicate' ],

  documentation: 'Abstract Predicate base-class.',

  methods: [
    function toIndex() { },

    function toDisjunctiveNormalForm() { return this; },

    function partialEval() { return this; },

    function toString() { return this.cls_.name; }
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'AbstractExpr',
  abstract: true,
  implements: [ 'foam.mlang.Expr' ],

  documentation: 'Abstract Expr base-class.',

  methods: [
    function partialEval() { return this; }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'True',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Expression which always returns true.',

  axioms: [ foam.pattern.Singleton.create() ],

  methods: [
    function f() { return true; }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'False',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Expression which always returns false.',

  axioms: [ foam.pattern.Singleton.create() ],

  methods: [
    function f() { return false; }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Unary',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  abstract: true,

  documentation: 'Abstract Unary (single-argument) Predicate base-class.',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    }
  ],

  methods: [
    function toIndex(tail) {
      return this.arg1 && this.arg1.toIndex(tail);
    },

    function toString() {
      return foam.String.constantize(this.cls_.name) +
          '(' + this.arg1.toString() + ')';
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Binary',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  abstract: true,

  documentation: 'Abstract Binary (two-argument) Predicate base-class.',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg2'
    }
  ],

  methods: [
    function toIndex(tail) {
      return this.arg1 && this.arg1.toIndex(tail);
    },

    function toString() {
      return foam.String.constantize(this.cls_.name) + '(' +
          this.arg1.toString() + ', ' +
          this.arg2.toString() + ')';
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Nary',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  abstract: true,

  documentation: 'Abstract n-ary (many-argument) Predicate base-class.',

  properties: [
    {
      class: 'foam.mlang.predicate.PredicateArray',
      name: 'args'
    }
  ],

  methods: [
    function toString() {
      var s = foam.String.constantize(this.cls_.name) + '(';
      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a = this.args[i];
        s += a.toString();
        if ( i < this.args.length - 1 ) s += ', ';
      }
      return s + ')';
    },
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Or',
  extends: 'foam.mlang.predicate.Nary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Logical Or n-ary Predicate.',

  requires: [
    'foam.mlang.predicate.False',
    'foam.mlang.predicate.True'
  ],

  methods: [
    {
      name: 'f',
      code: function f(o) {
        for ( var i = 0 ; i < this.args.length ; i++ ) {
          if ( this.args[i].f(o) ) return true;
        }
        return false;
      }
    },

    function partialEval() {
      var newArgs = [];
      var updated = false;

      var TRUE  = this.True.create();
      var FALSE = this.False.create();

      for ( var i = 0 ; i < this.args.length ; i++ ) {
        var a    = this.args[i];
        var newA = this.args[i].partialEval();

        if ( newA === TRUE ) return TRUE;

        if ( this.cls_.isInstance(newA) ) {
          // In-line nested OR clauses
          for ( var j = 0 ; j < newA.args.length ; j++ ) {
            newArgs.push(newA.args[j]);
          }
          updated = true;
        }
        else {
          if ( newA !== FALSE ) {
            newArgs.push(newA);
          }
          if ( a !== newA ) updated = true;
        }
      }

      /*
      TODO(braden): Implement partialOr and PARTIAL_OR_RULES, for full partial
      eval support. Currently this is only dropping FALSE, and short-circuiting
      on TRUE.

      for ( var i = 0 ; i < newArgs.length-1 ; i++ ) {
        for ( var j = i+1 ; j < newArgs.length ; j++ ) {
          var a = this.partialOr(newArgs[i], newArgs[j]);
          if ( a ) {
            if ( a === TRUE ) return TRUE;
            newArgs[i] = a;
            newArgs.splice(j, 1);
          }
        }
      }
      */

      if ( newArgs.length === 0 ) return FALSE;
      if ( newArgs.length === 1 ) return newArgs[0];

      return updated ? this.cls_.create({ args: newArgs }) : this;
    },

    function toIndex(tail) { },

    function toDisjunctiveNormalForm() {
      // TODO: memoization around this process?
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


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'And',
  extends: 'foam.mlang.predicate.Nary',
  implements: ['foam.core.Serializable'],

  documentation: 'Logical And n-ary Predicate.',

  requires: [
    'foam.mlang.predicate.Or'
  ],

  methods: [
    {
      name: 'f',
      code: function(o) {
        for ( var i = 0 ; i < this.args.length ; i++ ) {
          if ( ! this.args[i].f(o) ) return false;
        }
        return true;
      }
    },

    function partialEval() {
      var newArgs = [];
      var updated = false;

      var FALSE = foam.mlang.predicate.False.create();
      var TRUE = foam.mlang.predicate.True.create();

      for ( var i = 0; i < this.args.length; i++ ) {
        var a    = this.args[i];
        var newA = this.args[i].partialEval();

        if ( newA === FALSE ) return FALSE;

        if ( this.cls_.isInstance(newA) ) {
          // In-line nested AND clauses
          for ( var j = 0 ; j < newA.args.length ; j++ ) {
            newArgs.push(newA.args[j]);
          }
          updated = true;
        }
        else {
          if ( newA === TRUE ) {
            updated = true;
          } else {
            newArgs.push(newA);
            if ( a !== newA ) updated = true;
          }
        }
      }

      /*
      TODO(braden): Implement partialAnd and PARTIAL_AND_RULES, for full partial
      eval support. Currently it just drops TRUE and bails on FALSE.

      for ( var i = 0; i < newArgs.length - 1; i++ ) {
        for ( var j = i + 1; j < newArgs.length; j++ ) {
          var a = this.partialAnd(newArgs[i], newArgs[j]);
          if ( a ) {
            if ( a === FALSE ) return FALSE;
            newArgs[i] = a;
            newArgs.splice(j, 1);
          }
        }
      }
      */

      if ( newArgs.length === 0 ) return TRUE;
      if ( newArgs.length === 1 ) return newArgs[0];

      return updated ? this.cls_.create({ args: newArgs }) : this;
    },

    function toIndex(tail, depth) {
      /** Builds the ideal index for this predicate. The indexes will be chained
          in order of index uniqueness (put the most indexable first):
          This prevents dropping to scan mode too early, and restricts
          the remaning set more quickly.
           i.e. EQ, IN,... CONTAINS, ... LT, GT...
        @param depth {number} The maximum number of sub-indexes to chain.
      */
      depth = depth || 99;

      if ( depth === 1 ) {
        // generate indexes, find costs, use the fastest
        var bestCost = Number.MAX_VALUE;
        var bestIndex;
        var args = this.args;
        for (var i = 0; i < args.length; i++ ) {
          var arg = args[i];
          var idx = arg.toIndex(tail);
          if ( ! idx ) continue;

          var idxCost = Math.floor(idx.estimate(
             1000, undefined, undefined, undefined, undefined, arg));

          if ( bestCost > idxCost ) {
            bestIndex = idx;
            bestCost = idxCost;
          }
        }
        return bestIndex;

      } else {
        // generate indexes, sort by estimate, chain as requested
        var sortedArgs = Object.create(null);
        var costs = [];
        var args = this.args;
        var dupes = {}; // avoid duplicate indexes
        for (var i = 0; i < args.length; i++ ) {
          var arg = args[i];
          var idx = arg.toIndex(tail);
          if ( ! idx ) continue;

          // duplicate check
          var idxString = idx.toString();
          if ( dupes[idxString] ) continue;
          dupes[idxString] = true;

          var idxCost = Math.floor(idx.estimate(
             1000, undefined, undefined, undefined, undefined, arg));
          // make unique with a some extra digits
          var costKey = idxCost + i / 1000.0;
          sortedArgs[costKey] = arg;
          costs.push(costKey);
        }
        costs = costs.sort(foam.Number.compare);

        // Sort, build list up starting at the end (most expensive
        //   will end up deepest in the index)
        var tailRet = tail;
        var chainDepth = Math.min(costs.length - 1, depth - 1);
        for ( var i = chainDepth; i >= 0; i-- ) {
          var arg = sortedArgs[costs[i]];
          //assert(arg is a predicate)
          tailRet = arg.toIndex(tailRet);
        }

        return tailRet;
      }
    },

    function toDisjunctiveNormalForm() {
      // for each nested OR, multiply:
      // AND(a,b,OR(c,d),OR(e,f)) -> OR(abce,abcf,abde,abdf)

      var andArgs = [];
      var orArgs  = [];
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
  package: 'foam.mlang.predicate',
  name: 'Contains',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Predicate returns true iff second arg found in first array argument.',

  methods: [
    {
      name: 'f',
      code: function(o) {
        var s1 = this.arg1.f(o);
        return s1 ? s1.indexOf(this.arg2.f(o)) !== -1 : false;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'ContainsIC',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Predicate returns true iff second arg found in first array argument, ignoring case.',

  methods: [
    function f(o) {
      var s1 = this.arg1.f(o);
      var s2 = this.arg2.f(o);
      if ( typeof s1 !== 'string' || typeof s2 !== 'string' ) return false;
      // TODO(braden): This is faster if we use a regex with the ignore-case
      // option. That requires regex escaping arg2, though.
      // TODO: port faster version from FOAM1
      var uc1 = s1.toUpperCase();
      var uc2 = s2.toUpperCase();
      return uc1.indexOf(uc2) !== -1;
    },
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'StartsWith',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Predicate returns true iff arg1 starts with arg2 or if arg1 is an array, if an element starts with arg2.',

  methods: [
    {
      name: 'f',
      code: function(o) {
        var arg1 = this.arg1.f(o);
        var arg2 = this.arg2.f(o);

        if ( Array.isArray(arg1) ) {
          return arg1.some(function(arg) {
            return arg.startsWith(arg2);
          });
        }

        return arg1.startsWith(arg2);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'StartsWithIC',
  extends: 'foam.mlang.predicate.Binary',
  implements: ['foam.core.Serializable'],

  documentation: 'Predicate returns true iff arg1 starts with arg2 or if arg1 is an array, if an element starts with arg2, ignoring case.',

  methods: [
    {
      name: 'f',
      code: function f(o) {
        var arg1 = this.arg1.f(o);
        var arg2 = this.arg2.f(o);

        if ( Array.isArray(arg1) ) {
          return arg1.some(function(arg) {
            return foam.String.startsWithIC(arg, arg2);
          });
        }

        return foam.String.startsWithIC(arg1, arg2);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'In',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Predicate returns true iff arg1 is a substring of arg2, or if arg2 is an array, is an element of arg2.',

  properties: [
    {
      name: 'arg1',
      postSet: function(old, nu) {
        // this is slightly slower when an expression on upperCase_
        this.upperCase_ = nu && foam.core.Enum.isInstance(nu);
      }
    },
    {
      name: 'arg2',
      postSet: function() {
        this.valueSet_ = null;
      }
    },
    {
      // TODO: simpler to make an expression
      name: 'valueSet_'
    },
    {
      name: 'upperCase_',
    }
  ],

  methods: [
    function f(o) {
      var lhs = this.arg1.f(o);
      var rhs = this.arg2.f(o);

      // If arg2 is a constant array, we use valueSet for it.
      if ( foam.mlang.Constant.isInstance(this.arg2) ) {
        if ( ! this.valueSet_ ) {
          var set = {};
          for ( var i = 0 ; i < rhs.length ; i++ ) {
            var s = rhs[i];
            if ( this.upperCase_ ) s = s.toUpperCase();
            set[s] = true;
          }
          this.valueSet_ = set;
        }

        return !! this.valueSet_[lhs];
      }

      return rhs ? rhs.indexOf(lhs) !== -1 : false;
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'InIC',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Predicate returns true iff arg1 is a substring of arg2, or if arg2 is an array, is an element of arg2, case insensitive.',

  properties: [
    {
      name: 'arg2',
      postSet: function() { this.valueSet_ = null; }
    },
    {
      // TODO: simpler to make an expression
      name: 'valueSet_'
    }
  ],

  methods: [
    function f(o) {
      var lhs = this.arg1.f(o).toUpperCase();
      var rhs = this.arg2.f(o);

      // If arg2 is a constant array, we use valueSet for it.
      if ( foam.mlang.Constant.isInstance(this.arg2) ) {
        if ( ! this.valueSet_ ) {
          var set = {};
          for ( var i = 0 ; i < rhs.length ; i++ ) {
            set[rhs[i].toUpperCase()] = true;
          }
          this.valueSet_ = set;
        }

        return !! this.valueSet_[lhs];
      } else {
        if ( ! rhs ) return false;
        return rhs.toUpperCase().indexOf(lhs) !== -1;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'Constant',
  extends: 'foam.mlang.AbstractExpr',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'An Expression which always returns the same constant value.',

  properties: [
    {
      class: 'Object',
      name: 'value'
    }
  ],

  methods: [
    function f() { return this.value; },

    function toString_(x) {
      return typeof x === 'number' ? '' + x :
        typeof x === 'string' ? '"' + x + '"' :
        Array.isArray(x) ? '[' + x.map(this.toString_.bind(this)).join(', ') + ']' :
        x.toString ? x.toString() :
        x;
    },

    function toString() { return this.toString_(this.value); },

    // TODO(adamvy): Re-enable when we can parse this in java more correctly.
    function xxoutputJSON(os) {
      os.output(this.value);
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Func',
  extends: 'foam.mlang.predicate.AbstractPredicate',

  documentation: 'A function to Predicate adapter.',

  // TODO: rename FunctionPredicate

  properties: [
    {
      /** The function to apply to objects passed to this expression */
      name: 'fn'
    }
  ],

  methods: [
    function f(o) { return this.fn(o); },
    function toString() {
      return 'FUNC(' + fn.toString() + ')';
    }
  ]
});


/** Binary expression for equality of two arguments. */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Eq',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Binary Predicate returns true iff arg1 EQUALS arg2.',

  methods: [
    {
      name: 'f',
      code: function(o) {
        var v1 = this.arg1.f(o);
        var v2 = this.arg2.f(o);

        // First check is so that EQ(Class.PROPERTY, null | undefined) works.
        return ( v1 === undefined && v2 === null ) || foam.util.equals(v1, v2);
      }
    }
  ]
});


/** Binary expression for inequality of two arguments. */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Neq',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Binary Predicate returns true iff arg1 does NOT EQUAL arg2.',

  methods: [
    {
      name: 'f',
      code: function(o) {
        return ! foam.util.equals(this.arg1.f(o), this.arg2.f(o));
      }
    }
  ]
});


/** Binary expression for "strictly less than". */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Lt',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Binary Predicate returns true iff arg1 is LESS THAN arg2.',

  methods: [
    {
      name: 'f',
      code: function(o) {
        return foam.util.compare(this.arg1.f(o), this.arg2.f(o)) < 0;
      }
    }
  ]
});


/** Binary expression for "less than or equal to". */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Lte',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Binary Predicate returns true iff arg1 is LESS THAN or EQUAL to arg2.',

  methods: [
    {
      name: 'f',
      code: function(o) {
        return foam.util.compare(this.arg1.f(o), this.arg2.f(o)) <= 0;
      }
    }
  ]
});


/** Binary expression for "strictly greater than". */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Gt',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Binary Predicate returns true iff arg1 is GREATER THAN arg2.',

  methods: [
    {
      name: 'f',
      code: function(o) {
        return foam.util.compare(this.arg1.f(o), this.arg2.f(o)) > 0;
      }
    }
  ]
});


/** Binary expression for "greater than or equal to". */
foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Gte',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Binary Predicate returns true iff arg1 is GREATER THAN or EQUAL to arg2.',


  methods: [
    {
      name: 'f',
      code: function(o) {
        return foam.util.compare(this.arg1.f(o), this.arg2.f(o)) >= 0;
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Has',
  extends: 'foam.mlang.predicate.Unary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Unary Predicate that returns true iff the given property has a value other than null, undefined, \'\', or [].',

  methods: [
    function f(obj) {
      var value = this.arg1.f(obj);

      return ! (
        value === undefined ||
        value === null      ||
        value === ''        ||
        (Array.isArray(value) && value.length === 0) );
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Not',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Unary Predicate which negates the value of its argument.',

  properties: [
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'arg1'
    }
  ],

  methods: [
    function f(obj) { return ! this.arg1.f(obj); },

    function toString() {
      return foam.String.constantize(this.cls_.name) +
          '(' + this.arg1.toString() + ')';
    },

    /*
      TODO: this isn't ported to FOAM2 yet.
    function partialEval() {
      return this;
      var newArg = this.arg1.partialEval();

      if ( newArg === TRUE ) return FALSE;
      if ( newArg === FALSE ) return TRUE;
      if ( NotExpr.isInstance(newArg) ) return newArg.arg1;
      if ( EqExpr.isInstance(newArg)  ) return NeqExpr.create(newArg);
      if ( NeqExpr.isInstance(newArg) ) return EqExpr.create(newArg);
      if ( LtExpr.isInstance(newArg)  ) return GteExpr.create(newArg);
      if ( GtExpr.isInstance(newArg)  ) return LteExpr.create(newArg);
      if ( LteExpr.isInstance(newArg) ) return GtExpr.create(newArg);
      if ( GteExpr.isInstance(newArg) ) return LtExpr.create(newArg);

      return this.arg1 === newArg ? this : NOT(newArg);
    }*/
  ]
});


foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'Keyword',
  extends: 'foam.mlang.predicate.Unary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Unary Predicate for generic keyword search (searching all String properties for argument substring).',

  requires: [
    'foam.core.String'
  ],

  methods: [
    function f(obj) {
      var arg = this.arg1.f(obj);
      if ( ! arg || typeof arg !== 'string' ) return false;

      arg = arg.toLowerCase();

      var props = obj.cls_.getAxiomsByClass(this.String);
      for ( var i = 0; i < props.length; i++ ) {
        var s = props[i].f(obj);
        if ( ! s || typeof s !== 'string' ) continue;
        if ( s.toLowerCase().indexOf(arg) >= 0 ) return true;
      }

      return false;
    }
  ]
});


/** Map sink transforms each put with a given mapping expression. */
foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Map',
  extends: 'foam.dao.ProxySink',

  implements: [
    'foam.mlang.predicate.Unary',
    'foam.core.Serializable'
  ],

  documentation: 'Sink Decorator which applies a map function to put() values before passing to delegate.',

  methods: [
    function f(o) { return this.arg1.f(o); },

    function put(o) { this.delegate.put( this.f(o) ); }
  ]
});


foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'Mul',

  implements: [
    'foam.mlang.predicate.Binary',
    'foam.core.Serializable'
  ],

  documentation: 'Multiplication Binary Expression.',

  methods: [
    function f(o) { return this.arg1.f(o) * this.arg2.f(o); }
  ]
});


foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'GroupBy',
  extends: 'foam.dao.AbstractSink',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Sink which behaves like the SQL group-by command.',

  // TODO: it makes no sense to name the arguments arg1 and arg2
  // because this isn't an expression, so they should be more meaningful
  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg2'
    },
    {
      name: 'groups',
      factory: function() { return {}; }
    },
    {
      class: 'StringArray',
      name: 'groupKeys',
      factory: function() { return []; }
    },
    {
      class: 'Boolean',
      name: 'processArrayValuesIndividually',
      documentation: 'If true, each value of an array will be entered into a separate group.',
      factory: function() {
        // TODO: it would be good if it could also detect RelationshipJunction.sourceId/targetId
        return ! foam.core.MultiPartID.isInstance(this.arg1);
      }
    }
  ],

  methods: [
    function sortedKeys(opt_comparator) {
      this.groupKeys.sort(opt_comparator || this.arg1.comparePropertyValues);
      return this.groupKeys;
    },

    function putInGroup_(key, obj) {
      var group = this.groups.hasOwnProperty(key) && this.groups[key];
      if ( ! group ) {
        group = this.arg2.clone();
        this.groups[key] = group;
        this.groupKeys.push(key);
      }
      group.put(obj);
    },

    function put(obj) {
      var key = this.arg1.f(obj);
      if ( this.processArrayValuesIndividually && Array.isArray(key) ) {
        if ( key.length ) {
          for ( var i = 0; i < key.length; i++ ) {
            this.putInGroup_(key[i], obj);
          }
        } else {
          // Perhaps this should be a key value of null, not '', since '' might
          // actually be a valid key.
          this.putInGroup_('', obj);
        }
      } else {
        this.putInGroup_(key, obj);
      }
    },

    function eof() { },

    function clone() {
      // Don't use the default clone because we don't want to copy 'groups'.
      return this.cls_.create({ arg1: this.arg1, arg2: this.arg2 });
    },

    function toString() {
      return this.groups.toString();
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Unique',
  extends: 'foam.dao.ProxySink',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Sink decorator which only put()\'s a single obj for each unique expression value.',

  properties: [
    {
      class: 'foam.mlang.ExprProperty',
      name: 'expr'
    },
    {
      name: 'values',
      factory: function() { return {}; }
    }
  ],

  methods: [
    function putInGroup_(key, obj) {
      var group = this.groups.hasOwnProperty(key) && this.groups[key];
      if ( ! group ) {
        group = this.arg2.clone();
        this.groups[key] = group;
        this.groupKeys.push(key);
      }
      group.put(obj);
    },

    function put(obj) {
      var value = this.expr.f(obj);
      if ( Array.isArray(value) ) {
        throw 'Unique doesn\'t Array values.';
      } else {
        if ( ! this.values.hasOwnProperty(value) ) {
          this.values[value] = obj;
          this.delegate.put(obj);
        }
      }
    },

    function eof() { },

    function clone() {
      // Don't use the default clone because we don't want to copy 'uniqueValues'.
      return this.cls_.create({ expr: this.expr, delegate: this.delegate });
    },

    function toString() {
      return this.uniqueValues.toString();
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Explain',
  extends: 'foam.dao.ProxySink',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Pseudo-Sink which outputs a human-readable description of an MDAO\'s execution plan for evaluating it.',

  properties: [
    {
      class: 'String',
      name:  'plan',
      help:  'Execution Plan'
    }
  ],

  methods: [
    function toString() { return this.plan; },
  ]
});


foam.INTERFACE({
  package: 'foam.mlang.order',
  name: 'Comparator',

  documentation: 'Interface for comparing two values: -1: o1 < o2, 0: o1 == o2, 1: o1 > o2.',

  methods: [
    {
      name: 'compare',
      args: [
        'o1',
        'o2'
      ]
    },
    {
      name: 'toIndex',
      args: [
        'tail'
      ]
    },
    {
      /** Returns remaning ordering without this first one, which may be the
        only one. */
      name: 'orderTail'
    },
    {
      /** The property, if any, sorted by this ordering. */
      name: 'orderPrimaryProperty'
    },
    {
      /** Returns 1 or -1 for ascending/descending */
      name: 'orderDirection'
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Property',

  implements: [ 'foam.mlang.order.Comparator' ],

  methods: [
    {
      name: 'orderTail',
      code: function() { return; }
    },
    {
      name: 'orderPrimaryProperty',
      code: function() { return this; }
    },
    {
      name: 'orderDirection',
      code: function() { return 1; }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.order',
  name: 'Desc',

  implements: [
    'foam.mlang.order.Comparator',
    'foam.core.Serializable'
  ],

  documentation: 'Comparator Decorator which reverses direction of comparison. Short for "descending".',

  properties: [
    {
      class: 'FObjectProperty',
      name: 'arg1',
      of: 'foam.mlang.order.Comparator',
      adapt: function(_, c) { return foam.compare.toCompare(c); }
    }
  ],

  methods: [
    function compare(o1, o2) {
      return -1 * this.arg1.compare(o1, o2);
    },
    function toString() { return 'DESC(' + this.arg1.toString() + ')'; },
    function toIndex(tail) { return this.arg1 && this.arg1.toIndex(tail); },
    function orderTail() { return; },
    function orderPrimaryProperty() { return this.arg1; },
    function orderDirection() { return -1 * this.arg1.orderDirection(); }
  ]
});


foam.CLASS({
  package: 'foam.mlang.order',
  name: 'ThenBy',

  implements: [
    'foam.mlang.order.Comparator',
    'foam.core.Serializable'
  ],

  documentation: 'Binary Comparator, which sorts for first Comparator, then second.',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.order.Comparator',
      adapt: function(_, a) {
        // TODO(adamvy): We should fix FObjectProperty's default adapt when the
        // of parameter is an interface rather than a class.
        return a;
      },
      name: 'arg1'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.order.Comparator',
      adapt: function(_, a) {
        // TODO(adamvy): We should fix FObjectProperty's default adapt when the
        // of parameter is an interface rather than a class.
        return a;
      },
      name: 'arg2'
    },
    {
      name: 'compare',
      transient: true,
      documentation: 'Is a property so that it can be bound to "this" so that it works with Array.sort().',
      factory: function() { return this.compare_.bind(this); }
    }
  ],

  methods: [
    function compare_(o1, o2) {
      // an equals of arg1.compare is falsy, which will then hit arg2
      return this.arg1.compare(o1, o2) || this.arg2.compare(o1, o2);
    },

    function toString() {
      return 'THEN_BY(' + this.arg1.toString() + ', ' +
        this.arg2.toString() + ')';
    },

    function toIndex(tail) {
      return this.arg1 && this.arg2 && this.arg1.toIndex(this.arg2.toIndex(tail));
    },

    function orderTail() { return this.arg2; },

    function orderPrimaryProperty() { return this.arg1.orderPrimaryProperty(); },

    function orderDirection() { return this.arg1.orderDirection(); }
  ]
});


foam.CLASS({
  package: 'foam.mlang.order',
  name: 'CustomComparator',
  implements: [ 'foam.mlang.order.Comparator' ],

  // TODO: rename FunctionComparator

  documentation: 'A function to Comparator adapter.',

  properties: [
    {
      class: 'Function',
      name: 'compareFn'
    }
  ],

  methods: [
    {
      name: 'compare',
      code: function(o1, o2) {
        return this.compareFn(o1, o2);
      }
    },
    {
      name: 'toString',
      code: function() {
        return 'CUSTOM_COMPARE(' + this.compareFn.toString() + ')';
      }
    },
    {
      name: 'orderTail',
      code: function() { return undefined; }
    },
    {
      /** TODO: allow user to set this to match the given function */
      name: 'orderPrimaryProperty',
      code: function() { return undefined; }
    },
    {
      name: 'orderDirection',
      code: function() { return 1; }
    }
  ]
});


foam.LIB({
  name: 'foam.compare',

  methods: [
    function desc(c) {
      return foam.mlang.order.Desc.create({ arg1: c });
    },

    function toCompare(c) {
      return foam.Array.isInstance(c) ? foam.compare.compound(c) :
        foam.Function.isInstance(c)   ? foam.mlang.order.CustomComparator.create({ compareFn: c }) :
        c ;
    },

    function compound(args) {
      /* Create a compound comparator from an array of comparators. */
      var cs = args.map(foam.compare.toCompare);

      if ( cs.length === 0 ) return;
      if ( cs.length === 1 ) return cs[0];

      var ThenBy = foam.mlang.order.ThenBy;
      var ret, tail;

      ret = tail = ThenBy.create({arg1: cs[0], arg2: cs[1]});

      for ( var i = 2 ; i < cs.length ; i++ ) {
        tail = tail.arg2 = ThenBy.create({arg1: tail.arg2, arg2: cs[i]});
      }

      return ret;
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Max',
  extends: 'foam.dao.AbstractSink',

  implements: [
    'foam.mlang.predicate.Unary',
    'foam.core.Serializable'
  ],

  documentation: 'A Sink which remembers the maximum value put().',

  properties: [
    {
      name: 'value',
      value: 0
    }
  ],

  methods: [
    function put(obj) {
      if ( ! this.hasOwnProperty('value') ) {
        this.value = this.arg1.f(obj);
      } else if ( foam.util.compare(this.value, this.arg1.f(obj)) < 0 ) {
        this.value = this.arg1.f(obj);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Sum',
  extends: 'foam.dao.AbstractSink',

  implements: [
    'foam.mlang.predicate.Unary',
    'foam.core.Serializable',
  ],

  documentation: 'A Sink which sums put() values.',

  properties: [
    {
      name: 'value',
      value: 0
    }
  ],

  methods: [
    function put(obj) { this.value += this.arg1.f(obj); }
  ]
});


foam.CLASS({
  package: 'foam.mlang.expr',
  name: 'Dot',
  extends: 'foam.mlang.predicate.Binary',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'A Binary Predicate which applies arg2.f() to arg1.f().',

  methods: [
    function f(o) {
      return this.arg2.f(this.arg1.f(o));
    }
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'Expressions',

  documentation: 'Convenience mix-in for requiring all mlangs.',

  requires: [
    'foam.mlang.Constant',
    'foam.mlang.expr.Dot',
    'foam.mlang.expr.Mul',
    'foam.mlang.order.Desc',
    'foam.mlang.order.ThenBy',
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.Contains',
    'foam.mlang.predicate.ContainsIC',
    'foam.mlang.predicate.Eq',
    'foam.mlang.predicate.False',
    'foam.mlang.predicate.Func',
    'foam.mlang.predicate.Gt',
    'foam.mlang.predicate.Gte',
    'foam.mlang.predicate.Has',
    'foam.mlang.predicate.In',
    'foam.mlang.predicate.Keyword',
    'foam.mlang.predicate.Lt',
    'foam.mlang.predicate.Lte',
    'foam.mlang.predicate.Neq',
    'foam.mlang.predicate.Not',
    'foam.mlang.predicate.Or',
    'foam.mlang.predicate.StartsWith',
    'foam.mlang.predicate.StartsWithIC',
    'foam.mlang.predicate.True',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Explain',
    'foam.mlang.sink.GroupBy',
    'foam.mlang.sink.Unique',
    'foam.mlang.sink.Map',
    'foam.mlang.sink.Max',
    'foam.mlang.sink.Sum'
  ],

  constants: {
    FALSE: foam.mlang.predicate.False.create(),
    TRUE: foam.mlang.predicate.True.create()
  },

  methods: [
    function _nary_(name, args) {
      return this[name].create({ args: Array.from(args) });
    },

    function _unary_(name, arg) {
      return this[name].create({ arg1: arg });
    },

    function _binary_(name, arg1, arg2) {
      return this[name].create({ arg1: arg1, arg2: arg2 });
    },

    function OR() { return this._nary_("Or", arguments); },
    function AND() { return this._nary_("And", arguments); },
    function CONTAINS(a, b) { return this._binary_("Contains", a, b); },
    function CONTAINS_IC(a, b) { return this._binary_("ContainsIC", a, b); },
    function EQ(a, b) { return this._binary_("Eq", a, b); },
    function NEQ(a, b) { return this._binary_("Neq", a, b); },
    function IN(a, b) { return this._binary_("In", a, b); },
    function LT(a, b) { return this._binary_("Lt", a, b); },
    function GT(a, b) { return this._binary_("Gt", a, b); },
    function LTE(a, b) { return this._binary_("Lte", a, b); },
    function GTE(a, b) { return this._binary_("Gte", a, b); },
    function HAS(a) { return this._unary_("Has", a); },
    function NOT(a) { return this._unary_("Not", a); },
    function KEYWORD(a) { return this._unary_("Keyword", a); },
    function STARTS_WITH(a, b) { return this._binary_("StartsWith", a); },
    function STARTS_WITH_IC(a, b) { return this._binary_("StartsWithIC", a, b); },
    function FUNC(fn) { return this.Func.create({ fn: fn }); },
    function DOT(a, b) { return this._binary_("Dot", a, b); },
    function MUL(a, b) { return this._binary_("Mul", a, b); },

    function UNIQUE(expr, sink) { return this.Unique.create({ expr: expr, delegate: sink }); },
    function GROUP_BY(expr, sinkProto) { return this.GroupBy.create({ arg1: expr, arg2: sinkProto }); },
    function MAP(expr, sink) { return this.Map.create({ arg1: expr, delegate: sink }); },
    function EXPLAIN(sink) { return this.Explain.create({ delegate: sink }); },
    function COUNT() { return this.Count.create(); },
    function MAX(arg1) { return this.Max.create({ arg1: arg1 }); },
    function SUM(arg1) { return this.Sum.create({ arg1: arg1 }); },

    function DESC(a) { return this._unary_("Desc", a); },
    function THEN_BY(a, b) { return this._binary_("ThenBy", a, b); },
  ]
});


foam.CLASS({
  package: 'foam.mlang',
  name: 'ExpressionsSingleton',
  extends: 'foam.mlang.Expressions',

  documentation: 'A convenience object which provides access to all mlangs.',
  // TODO: why is this needed?

  axioms: [
    foam.pattern.Singleton.create()
  ]
});

// TODO(braden): We removed Expr.pipe(). That may still be useful to bring back,
// probably with a different name. It doesn't mean the same as DAO.pipe().
// remove eof()
